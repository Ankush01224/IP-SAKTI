const config = require("../config");
const { SYSTEM_PROMPT } = require("../config/constants");

const GENERATE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Generate an answer using Gemini with retrieved context chunks.
 * @param {string} query - user question
 * @param {{text: string, metadata: object}[]} chunks - retrieved context chunks
 * @returns {Promise<string>} generated answer
 */
async function generateAnswer(query, chunks) {
  const contextBlock = chunks
    .map(
      (c, i) =>
        `[Chunk ${i + 1} | File: ${c.metadata.filename} | Page: ${c.metadata.page}]\n${c.text}`
    )
    .join("\n\n");

  const userMessage = `Context:\n${contextBlock}\n\nQuestion: ${query}`;

  const res = await fetch(`${GENERATE_URL}?key=${config.geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini generation API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate?.content?.parts?.[0]?.text) {
    throw new Error("No text in Gemini response");
  }

  return candidate.content.parts[0].text;
}

module.exports = { generateAnswer };
