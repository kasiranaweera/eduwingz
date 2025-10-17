from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
import jwt
import os
from pydantic import BaseModel, Field
import asyncio
from contextlib import asynccontextmanager
from services.rag_service import RAGService
from config import settings

rag_service = RAGService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting RAG Chat API...")
    await rag_service.initialize()
    print("✅ Services initialized successfully!")
    yield
    print("🔄 Shutting down...")

app = FastAPI(
    title="RAG Chat API",
    description="Advanced RAG-based Chat API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8001",
        "http://localhost:3000",
        "http://127.0.0.1:8001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    session_id: str

@app.post("/api/chat/process")
async def process_message(message: MessageCreate, user_id: int = Depends(verify_token)):
    """Process a chat message with RAG"""
    response_data = await rag_service.chat(message.content, message.session_id)
    return {
        "answer": response_data["answer"],
        "context": response_data.get("context", [])
    }

@app.post("/api/documents/process")
async def process_document(file: UploadFile = File(...), user_id: int = Depends(verify_token)):
    """Process a PDF document"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_path = f"media/uploads/{file.filename}"
    os.makedirs("media/uploads", exist_ok=True)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    success = await rag_service.process_document(file_path)
    return {"processed": success}

@app.post("/api/chat/clear/{session_id}")
async def clear_session(session_id: str, user_id: int = Depends(verify_token)):
    """Clear session history in RAG service"""
    rag_service.clear_session_history(session_id)
    return {"message": "Session history cleared"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)