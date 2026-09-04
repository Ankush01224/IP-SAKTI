# IP-SAKTI Sahayak

RAG-based Q&A assistant for Ayurveda IP & regulatory documents.

## Project Structure

```
ipsakti/
├── server/            # Express backend
│   ├── config/        # Environment & app config
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic (Phase 2+)
│   ├── uploads/       # Uploaded PDF storage
│   ├── index.js       # Entry point
│   └── .env           # GEMINI_API_KEY, PORT
└── client/            # Vite + React + Tailwind frontend
    └── src/
        ├── App.jsx    # Main app component
        └── main.jsx   # React entry point
```

## Prerequisites

- Node.js ≥ 18

## Setup

### 1. Server

```bash
cd server
cp .env.example .env   # or edit .env directly
# Set GEMINI_API_KEY in .env
npm install
npm run dev            # → http://localhost:3001
```

### 2. Client

```bash
cd client
npm install
npm run dev            # → http://localhost:5173
```

The Vite dev server proxies `/api/*` and `/health` to the Express backend.

## API Endpoints

| Method | Path                     | Description              |
|--------|--------------------------|--------------------------|
| GET    | `/health`                | Health check             |
| POST   | `/api/documents/upload`  | Upload a PDF (field: `file`) |

## Test

```bash
# Health
curl http://localhost:3001/health

# Upload (replace path)
curl -F "file=@/path/to/doc.pdf" http://localhost:3001/api/documents/upload
```
