const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  geminiApiKey: process.env.GEMINI_API_KEY,
  chromaUrl: process.env.CHROMA_URL || "http://localhost:8000",
};
