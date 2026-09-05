FROM chromadb/chroma:latest

ENV IS_PERSISTENT=true
ENV PERSIST_DIRECTORY=/chroma/chroma
ENV CHROMA_SERVER_CORS_ALLOW_ORIGINS=["*"]
ENV CHROMA_SERVER_HOST=0.0.0.0

EXPOSE 8000

CMD ["uvicorn", "chromadb.app:app", "--host", "0.0.0.0", "--port", "8000"]
