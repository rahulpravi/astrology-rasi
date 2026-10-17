"""
Application configuration using Pydantic Settings.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Astrology Rasi Chart API"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://jyotish-rasi.vercel.app",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
