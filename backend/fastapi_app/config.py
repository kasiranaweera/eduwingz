from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "21444d310f654572d297c5b2b6363273d5ab6754580c26a846858a9702f61a10"
    ALGORITHM: str = "HS256"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:1b"
    LLM_MODEL: str = "Qwen/Qwen2.5-0.5B-Instruct"  # Non-gated reasoning model
    EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K: int = 5
    HUGGINGFACE_TOKEN: str | None = None  # Optional, for HuggingFace authentication if needed
    DEBUG: bool = True  # Optional, for debugging
    FASTAPI_URL: str = "http://localhost:8000"  # For Django-FastAPI communication

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "allow"  # Allow extra environment variables to avoid validation errors

settings = Settings()
