from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

DEV_ENVIRONMENT = "dev"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')
    # API Configuration
    DEBUG: bool = True
    API_PORT: int = 5000
    ENVIRONMENT: str = "dev"
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"

    # GCP Configuration
    GCS_BUCKET_NAME: str = "multitune-stem-storage-test"
    GOOGLE_APPLICATION_CREDENTIALS: str
    # Audio Processing
    DEMUCS_MODEL: str = "htdemucs_6st"
    USE_GPU: bool = False
    DEV_SERVICE_URL: str = None
    GCP_PROJECT_ID: str
    GCS_ENDPOINT:str = None
    STORAGE_EMULATOR_HOST:str = None
    PUBSUB_EMULATOR_HOST: str = None
    CORE_API_URL: str


@lru_cache()
def get_settings():
    return Settings()
