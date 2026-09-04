const config = require("../config");

const EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

/**
 * Embed a single text string using Gemini text-embedding-004.
 * @param {string} text
 * @returns {Promise<number[]>} embedding vector
 */
async function embedText(text) {
  const res = await fetch(`${EMBED_URL}?key=${config.geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embedding API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

/**
 * Embed multiple texts sequentially (no batching to keep it simple).
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function embedTexts(texts) {
  const embeddings = [];
  for (const text of texts) {
    const emb = await embedText(text);
    embeddings.push(emb);
  }
  return embeddings;
}

module.exports = { embedText, embedTexts };
