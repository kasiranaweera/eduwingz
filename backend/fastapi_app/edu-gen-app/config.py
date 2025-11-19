# config.py
from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    LLM_MODEL: str = "Qwen/Qwen2.5-0.5B-Instruct"
    
    # Paths
    OUTPUT_DIR: Path = Path("outputs")
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Visual settings
    DIAGRAM_WIDTH: int = 1024
    DIAGRAM_HEIGHT: int = 768

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()