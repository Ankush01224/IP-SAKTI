const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { extractText } = require("../services/pdfExtractor");
const { chunkPages } = require("../services/chunker");
const { embedTexts } = require("../services/embedder");
const { addChunks, listDocuments } = require("../services/chromaStore");

const router = Router();

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    size: req.file.size,
  });
});

router.post("/ingest", async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: "filename is required in body" });
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File not found: ${filename}` });
    }

    // 1. Extract text
    console.log(`[ingest] Extracting text from ${filename}...`);
    const { pages } = await extractText(filePath);
    console.log(`[ingest] Extracted ${pages.length} pages`);

    // 2. Chunk
    const chunks = chunkPages(pages, filename);
    console.log(`[ingest] Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      return res.status(400).json({ error: "No text could be extracted from PDF" });
    }

    // 3. Embed
    console.log(`[ingest] Embedding ${chunks.length} chunks...`);
    const texts = chunks.map((c) => c.text);
    const embeddings = await embedTexts(texts);
    console.log(`[ingest] Embeddings done`);

    // 4. Store in ChromaDB
    console.log(`[ingest] Storing in ChromaDB...`);
    const count = await addChunks(chunks, embeddings);
    console.log(`[ingest] Stored ${count} chunks`);

    res.json({
      message: "Ingestion complete",
      filename,
      pagesExtracted: pages.length,
      chunksStored: count,
    });
  } catch (err) {
    console.error("[ingest] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/list", async (_req, res) => {
  try {
    const result = await listDocuments();
    res.json(result);
  } catch (err) {
    console.error("[list] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
