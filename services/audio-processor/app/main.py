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
from typing import Dict, Optional
import asyncio
from app.config import get_settings
settings = get_settings()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=settings.GOOGLE_APPLICATION_CREDENTIALS
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
print(f"Connected to GCS bucket {BUCKET_NAME}")

# Initialize Demucs
MODEL_NAME = "htdemucs"
model = None

def get_demucs_model():
    global model
    if model is None:
        model = get_model(MODEL_NAME)
        model.cuda() if torch.cuda.is_available() else model.cpu()
    return model

class ProcessingJob(BaseModel):
    job_id: str = Field(alias="jobId")
    track_id: int = Field(alias="trackId")
    preview_url: str = Field(alias="preview")

async def download_preview(url: str, target_path: str):
    """Download preview file from URL"""
    async with aiohttp.ClientSession() as session:
        print(session.get(url))
        async with session.get(url) as response:
            if response.status == 200:
                with open(target_path, 'wb') as f:
                    f.write(await response.read())
            else:
                raise Exception(f"Failed to download preview: {response.status}")

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

async def process_job(job: ProcessingJob):
    """Process a single audio job"""
    try:
        logger.info(f"Starting processing job {job.job_id}")
        
        # Update job status
        redis_client.hset(f"job:{job.job_id}", "status", "processing")
        
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
        await redis_client.hset(
            f"job:{job.job_id}",
            mapping={
                "status": "error",
                "error": str(e)
            }
        )

# Redis subscriber for processing jobs
async def subscribe_to_jobs():
    """Subscribe to Redis channel for new processing jobs"""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("audio:process")
    
    logger.info("Listening for audio processing jobs...")
    
    while True:
        message = await pubsub.get_message(ignore_subscribe_messages=True)
        if message and message["type"] == "message":
            try:
                job_data = json.loads(message["data"])
                job = ProcessingJob(**job_data)
                asyncio.create_task(process_job(job))
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Start Redis subscriber on startup"""
    asyncio.create_task(subscribe_to_jobs())

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# For local development and testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)