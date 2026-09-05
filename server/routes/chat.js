const { Router } = require("express");
const { embedText } = require("../services/embedder");
const { querySimilar } = require("../services/chromaStore");
const { generateAnswer, detectLanguage } = require("../services/chatService");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { query, language } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "query (string) is required" });
    }

    // Resolve target response language
    // If caller provides a language code, use it.
    // Otherwise, auto-detect from the query text.
    let responseLang = "en";
    if (language && typeof language === "string" && language.trim().length > 0) {
      responseLang = language.trim().toLowerCase();
      console.log(`[chat] Language set by client: ${responseLang}`);
    } else {
      responseLang = await detectLanguage(query);
      console.log(`[chat] Language auto-detected: ${responseLang}`);
    }

    // 1. Embed the query (always in the original language — embedder handles multilingual input fine)
    console.log(`[chat] Query: "${query}"`);
    const queryEmbedding = await embedText(query);

    // 2. Retrieve top 5 similar chunks (always from English document store)
    const results = await querySimilar(queryEmbedding, 5);

    console.log("[chat] Retrieved chunks:");
    for (let i = 0; i < results.ids.length; i++) {
      console.log(
        `  ${results.ids[i]} (distance: ${results.distances[i].toFixed(4)})`
      );
    }

    if (results.ids.length === 0) {
      return res.json({
        answer:
          "I don't have enough information in the provided documents.",
        sources: [],
        detectedLanguage: responseLang,
      });
    }

    // 3. Build chunks for context
    const chunks = results.ids.map((id, i) => ({
      text: results.documents[i],
      metadata: results.metadatas[i],
    }));

    // 4. Generate answer in the target language
    const answer = await generateAnswer(query, chunks, responseLang);

    // 5. Build unique sources (excerpts stay in original English — not translated)
    const seen = new Set();
    const sources = [];
    for (let i = 0; i < results.ids.length; i++) {
      const chunkId = results.ids[i];
      if (!seen.has(chunkId)) {
        seen.add(chunkId);
        sources.push({
          filename: results.metadatas[i].filename,
          page: results.metadatas[i].page,
          chunk_id: chunkId,
          excerpt: results.documents[i].substring(0, 200) + "...",
        });
      }
    }

    res.json({ answer, sources, detectedLanguage: responseLang });
  } catch (err) {
    console.error("[chat] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
