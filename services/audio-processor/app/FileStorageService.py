import os
from pathlib import Path

from google.cloud import storage

from app.config import get_settings
from app.logger import logger
settings = get_settings()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=settings.GOOGLE_APPLICATION_CREDENTIALS
logger.info("Initializing gcs connection")
BUCKET_NAME = settings.GCS_BUCKET_NAME
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)
logger.info(f"Connected to GCS bucket {BUCKET_NAME}")
logger.info("GCS connection initialized")

class FileStorageService:
    """Handles acces and edition of the files in our file storage"""

    def upload_public(self, location, file_path:Path) -> str:
        """ Uploads a file to our public storage, returns it's public url"""
        blob = bucket.blob(location)
        if (blob.exists()):
            logger.info("File already at location, no replacing done")
            return blob.public_url
        blob.upload_from_filename(file_path)
        return blob.public_url