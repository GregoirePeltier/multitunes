from pydantic_settings import BaseSettings,SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')
	# API Configuration
    DEBUG: bool = True
    API_PORT: int = 5000
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    
    # GCP Configuration
    GCS_BUCKET_NAME: str = "multitune-stem-storage"
    GOOGLE_APPLICATION_CREDENTIALS:str
    # Audio Processing
    DEMUCS_MODEL: str = "htdemucs_6st"
    USE_GPU: bool = False


@lru_cache()
def get_settings():
    return Settings()