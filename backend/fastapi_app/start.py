import uvicorn

if __name__ == "__main__":
    # Run FastAPI with extended timeout for LLM generation
    # LLM can take 30-60 seconds, so we need timeout_keep_alive >= 120
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        timeout_keep_alive=180  # 3 minutes - allows LLM generation
    )