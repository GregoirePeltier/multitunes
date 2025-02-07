import demucs.api
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel,Field
import redis.asyncio as redis
import json
import os
import aiohttp
import numpy as np
import soundfile as sf
import tempfile
from pathlib import Path
import torch
from demucs.pretrained import get_model
from demucs.apply import apply_model
import torchaudio
from google.cloud import storage
import logging
from typing import Dict, List, Optional
import asyncio
from datetime import datetime, timedelta
from app.config import get_settings

settings = get_settings()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_APPLICATION_CREDENTIALS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL)

# Initialize GCS
BUCKET_NAME = settings.GCS_BUCKET_NAME
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)

# Initialize Demucs
MODEL_NAME = "htdemucs"
model = None

# Constants
JOB_EXPIRY_MINUTES = 5
JOB_PROCESSING_TIMEOUT_MINUTES = 1
MAX_CONCURRENT_JOBS = 1

class ProcessingJob(BaseModel):
    job_id: str = Field(alias="jobId")
    track_id: int = Field(alias="trackId")
    preview_url: str = Field(alias="preview")
    created_at: Optional[datetime] = None
    last_updated: Optional[datetime] = None

class JobManager:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.processing_jobs = set()
        self.semaphore = asyncio.Semaphore(MAX_CONCURRENT_JOBS)

    async def get_pending_jobs(self) -> List[ProcessingJob]:
        """Retrieve all pending jobs from Redis"""
        pending_jobs = []
        async for key in self.redis.scan_iter("job:*"):
            job_data = await self.redis.hgetall(key)
            if job_data.get(b"status") in [b"pending", b"processing"]:
                # Check if the job is stuck in processing
                if job_data.get(b"status") == b"processing":
                    last_updated = datetime.fromisoformat(job_data.get("last_updated", datetime.now().isoformat()))
                    if datetime.now() - last_updated < timedelta(minutes=JOB_PROCESSING_TIMEOUT_MINUTES):
                        continue  # Skip jobs that are currently being processed
                logger.info(f"Found pending job {key}")
                try:
                    job = ProcessingJob(
                        jobId=key.split(b":")[1],
                        trackId=job_data[b"trackId"],
                        preview=job_data[b"preview"]
                    )
                    pending_jobs.append(job)
                except Exception as e:
                    logger.error(f"Error parsing job data for {key}: {e}")
                    continue

        return pending_jobs

    async def cleanup_old_jobs(self):
        """Remove expired jobs from Redis"""
        async for key in self.redis.scan_iter("job:*"):
            job_data = await self.redis.hgetall(key)
            if not job_data:
                continue

            created_at = datetime.fromisoformat(job_data.get(b"created_at", datetime.now().isoformat()))
            if datetime.now() - created_at > timedelta(minutes=JOB_EXPIRY_MINUTES):
                await self.redis.delete(key)
                logger.info(f"Cleaned up expired job {key}")

    async def mark_job_started(self, job: ProcessingJob):
        """Mark a job as processing and update timestamps"""
        await self.redis.hset(
            f"job:{job.job_id}",
            mapping={
                "status": "processing",
                "last_updated": datetime.now().isoformat()
            }
        )
        self.processing_jobs.add(job.job_id)

    async def mark_job_completed(self, job: ProcessingJob, stem_urls: Dict[str, str]):
        """Mark a job as completed with results"""
        await self.redis.hset(
            f"job:{job.job_id}",
            mapping={
                "status": "completed",
                "instruments": json.dumps(stem_urls),
                "last_updated": datetime.now().isoformat()
            }
        )
        self.processing_jobs.remove(job.job_id)

    async def mark_job_failed(self, job: ProcessingJob, error: str):
        """Mark a job as failed with error message"""
        await self.redis.hset(
            f"job:{job.job_id}",
            mapping={
                "status": "error",
                "error": str(error),
                "last_updated": datetime.now().isoformat()
            }
        )
        if job.job_id in self.processing_jobs:
            self.processing_jobs.remove(job.job_id)

# Initialize job manager
job_manager = JobManager(redis_client)

def process_audio(input_path: str, output_dir: str,on_separation_progress=None) -> Dict[str, str]:
    """Split audio into stems using Demucs"""
    def separation_callback(data):
        if on_separation_progress:
            progress = data["segment_offset"]/data["audio_length"] * 100
            on_separation_progress(progress)
    logging.info(f"Processing audio file")
    separator = demucs.api.Separator(model="htdemucs_6s",callback=separation_callback)
    logging.info(f"Loaded Demucs model")
    origin, separated = separator.separate_audio_file(Path(input_path))

    logging.info(f"Separated audio")
    stems = dict()
    output_dir = Path(output_dir)
    if not output_dir.exists():
        output_dir.mkdir(parents=True)
    for stem, source in separated.items():
        logging.info(f"Saving {stem} to {output_dir}")
        saved_path = output_dir.joinpath(f"{stem}.mp3")
        demucs.api.save_audio(source, saved_path, samplerate=separator.samplerate)
        stems[stem] = saved_path
    logging.info(f"Saved stems to {output_dir}")
    return stems

def upload_to_gcs(local_path: str, gcs_path: str) -> str:
    """Upload file to Google Cloud Storage and return public URL"""
    blob = bucket.blob(gcs_path)
    blob.upload_from_filename(local_path)
    return blob.public_url
async def download_preview(url: str, target_path: str):
    """Download preview file from URL"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                with open(target_path, 'wb') as f:
                    f.write(await response.read())
            else:
                raise Exception(f"Failed to download preview: {response.status}")
async def process_job(job: ProcessingJob):
    """Process a single audio job with proper error handling and cleanup"""
    async with job_manager.semaphore:
        try:
            await job_manager.mark_job_started(job)
            logger.info(f"Starting processing job {job.job_id}")

            # Create temporary directory for processing
            with tempfile.TemporaryDirectory() as temp_dir:
                # Download preview
                input_path = os.path.join(temp_dir, "input.mp3")
                await download_preview(job.preview_url, input_path)
                # Process audio
                stem_paths = process_audio(input_path, temp_dir)

                # Upload stems to GCS and get URLs
                stem_urls = {}
                for stem_name, local_path in stem_paths.items():
                    gcs_path = f"stems/{job.track_id}/{stem_name}.mp3"
                    public_url = upload_to_gcs(local_path, gcs_path)
                    stem_urls[stem_name] = public_url

                # Update job status with stem URLs
                await redis_client.hset(
                    f"job:{job.job_id}",
                    mapping={
                        "status": "completed",
                        "instruments": json.dumps(stem_urls)
                    }
                )

                logger.info(f"Completed processing job {job.job_id}")
        except Exception as e:
            logger.error(f"Error processing job {job.job_id}: {str(e)}")
            await job_manager.mark_job_failed(job, str(e))

async def recovery_worker():
    """Worker to handle recovery of pending jobs"""
    logger.info("Starting recovery worker...")
    while True:
        try:
            pending_jobs = await job_manager.get_pending_jobs()
            for job in pending_jobs:
                asyncio.create_task(process_job(job))

            await job_manager.cleanup_old_jobs()

        except Exception as e:
            logger.error(f"Error in recovery worker: {str(e)}")

        await asyncio.sleep(60)  # Check for pending jobs every minute

# Redis subscriber for processing jobs
async def subscribe_to_jobs():
    """Subscribe to Redis channel for new processing jobs"""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("audio:process")
    
    logger.info("Listening for audio processing jobs...")
    
    while True:
        try:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message and message["type"] == "message":
                try:
                    job_data = json.loads(message["data"])
                    job = ProcessingJob(**job_data)
                    asyncio.create_task(process_job(job))
                except Exception as e:
                    logger.error(f"Error processing message: {str(e)}")
        except Exception as e:
            logger.error(f"Error in subscription worker: {str(e)}")
            await asyncio.sleep(5)  # Brief pause before reconnecting
            await pubsub.subscribe("audio:process")

@app.on_event("startup")
async def startup_event():
    """Start Redis subscriber and recovery worker on startup"""
    asyncio.create_task(subscribe_to_jobs())
    asyncio.create_task(recovery_worker())

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_jobs": len(job_manager.processing_jobs)
    }

# For local development and testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.API_PORT)