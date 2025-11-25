from pydantic_settings import BaseSettings
import os
from pathlib import Path

class Settings(BaseSettings):
    SECRET_KEY: str = "21444d310f654572d297c5b2b6363273d5ab6754580c26a846858a9702f61a10"
    ALGORITHM: str = "HS256"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:1b"
    LLM_MODEL: str = "Qwen/Qwen3-0.6B"  # Non-gated reasoning model
    # LLM_MODEL: str = "Qwen/Qwen2.5-0.5B-Instruct"  # Non-gated reasoning model
    LLM_BACKEND: str = "huggingface"  # "ollama" or "huggingface"
    EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K: int = 5
    MAX_TOKENS: int = 2048  # Maximum tokens for LLM response generation
    HUGGINGFACE_TOKEN: str | None = None  # Optional, for HuggingFace authentication if needed
    DEBUG: bool = True  # Optional, for debugging
    FASTAPI_URL: str = "http://localhost:8000"  # For Django-FastAPI communication
    
    # ==================== API KEYS FOR TOOLS ====================
    HF_TOKEN: str | None = None  # HuggingFace token
    GOOGLE_SERPER_API_KEY: str | None = None  # Google Serper Search
    YOUTUBE_API_KEY: str | None = None  # YouTube Search
    GITHUB_TOKEN: str | None = None  # GitHub API
    SEARCHAPI_API_KEY: str | None = None  # SearchAPI.io
    TAVILY_API_KEY: str | None = None  # Tavily Search
    BRAVE_SEARCH_API_KEY: str | None = None  # Brave Search
    OPENWEATHERMAP_API_KEY: str | None = None  # Weather API
    RIZA_API_KEY: str | None = None  # Code Interpreter
    ROBOCORP_API_KEY: str | None = None  # Robocorp RPA
    # =========================================================

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "allow"  # Allow extra environment variables to avoid validation errors

# Create settings instance with explicit .env loading
_env_file_path = Path(__file__).parent.parent / ".env"
if _env_file_path.exists():
    from dotenv import load_dotenv
    load_dotenv(_env_file_path, override=True)

settings = Settings()