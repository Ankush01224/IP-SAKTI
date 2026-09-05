const config = require("../config");
const { SYSTEM_PROMPT } = require("../config/constants");

const GENERATE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/** ISO-639-1 code -> full language name for the prompt */
const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu",
};

/**
 * Detect language via Unicode script heuristics — zero API cost, instant.
 * Returns an ISO-639-1 code or null if inconclusive.
 * @param {string} text
 * @returns {string|null}
 */
function detectLanguageHeuristic(text) {
  // Count characters in known Unicode blocks
  let devanagari = 0, tamil = 0, telugu = 0, bengali = 0,
      gujarati = 0, kannada = 0, malayalam = 0, gurmukhi = 0,
      arabic = 0, latin = 0;

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x0900 && cp <= 0x097F) devanagari++;       // Devanagari (Hindi, Marathi)
    else if (cp >= 0x0B80 && cp <= 0x0BFF) tamil++;       // Tamil
    else if (cp >= 0x0C00 && cp <= 0x0C7F) telugu++;      // Telugu
    else if (cp >= 0x0980 && cp <= 0x09FF) bengali++;      // Bengali
    else if (cp >= 0x0A80 && cp <= 0x0AFF) gujarati++;     // Gujarati
    else if (cp >= 0x0C80 && cp <= 0x0CFF) kannada++;      // Kannada
    else if (cp >= 0x0D00 && cp <= 0x0D7F) malayalam++;    // Malayalam
    else if (cp >= 0x0A00 && cp <= 0x0A7F) gurmukhi++;     // Gurmukhi (Punjabi)
    else if (cp >= 0x0600 && cp <= 0x06FF) arabic++;       // Arabic / Urdu
    else if ((cp >= 0x0041 && cp <= 0x005A) || (cp >= 0x0061 && cp <= 0x007A)) latin++;
  }

  const counts = { devanagari, tamil, telugu, bengali, gujarati, kannada, malayalam, gurmukhi, arabic };
  const maxScript = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a, ["", 0]);

  // Must have at least 3 non-Latin script chars to be confident
  if (maxScript[1] < 3) return null;

  switch (maxScript[0]) {
    case "devanagari": return "hi";  // Hindi/Marathi — default to hi
    case "tamil":      return "ta";
    case "telugu":     return "te";
    case "bengali":    return "bn";
    case "gujarati":   return "gu";
    case "kannada":    return "kn";
    case "malayalam":  return "ml";
    case "gurmukhi":   return "pa";
    case "arabic":     return "ur";
    default:           return null;
  }
}

/**
 * Auto-detect query language. Uses fast Unicode heuristic first;
 * falls back to Gemini LLM only if heuristic is inconclusive.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function detectLanguage(text) {
  // 1. Fast heuristic (no API call)
  const heuristic = detectLanguageHeuristic(text);
  if (heuristic) {
    console.log(`[chat] Language detected by heuristic: ${heuristic}`);
    return heuristic;
  }

  // 2. LLM fallback for ambiguous scripts (e.g. short Latin text)
  const prompt =
    `Detect the language of the following text and respond with ONLY the ISO-639-1 two-letter code (e.g. "en", "hi", "ta", "bn"). No explanation, just the code.\n\nText: ${text.substring(0, 300)}`;

  try {
    const res = await fetch(`${GENERATE_URL}?key=${config.geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 10 },
      }),
    });

    if (!res.ok) return "en";
    const data = await res.json();
    const code = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?.trim().toLowerCase().replace(/[^a-z]/g, "").substring(0, 2);
    return (code && code.length === 2) ? code : "en";
  } catch {
    return "en";
  }
}

/**
 * Generate an answer using Gemini with retrieved context chunks.
 * @param {string} query - user question
 * @param {{text: string, metadata: object}[]} chunks - retrieved context chunks
 * @param {string} language - ISO-639-1 code for the response language
 * @returns {Promise<string>} generated answer
 */
async function generateAnswer(query, chunks, language = "en") {
  const langName = LANGUAGE_NAMES[language] || language;

  const contextBlock = chunks
    .map(
      (c, i) =>
        `[Chunk ${i + 1} | File: ${c.metadata.filename} | Page: ${c.metadata.page}]\n${c.text}`
    )
    .join("\n\n");

  const userMessage =
    `Context:\n${contextBlock}\n\nQuestion: ${query}\n\n[RESPONSE LANGUAGE: ${langName}. Write your entire answer in ${langName}.]`;

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

module.exports = { generateAnswer, detectLanguage };
