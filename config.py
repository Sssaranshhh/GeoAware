from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # External API endpoints (optional — can be provided via .env)
    USGS_API_URL: Optional[str] = ""
    IMD_WEATHER_URL: Optional[str] = ""
    IMD_RAINFALL_URL: Optional[str] = ""
    # Optional external services
    GEOSCOPE_API_URL: Optional[str] = ""

    # Local paths with sensible defaults so imports don't fail when .env is missing
    MODEL_PATH: str = "ml/models/hazard_model.pkl"
    KAGGLE_DATA_PATH: str = "Final_data.csv"
    CACHE_EXPIRY: int = 3600

    class Config:
        env_file = ".env"


# Instantiate settings (will load values from .env when present)
settings = Settings()