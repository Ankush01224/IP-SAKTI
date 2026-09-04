/**
 * Split text into chunks of approximately `maxTokens` tokens
 * with `overlapTokens` overlap. Tokens are approximated as whitespace-split words.
 *
 * @param {string} text
 * @param {object} meta - { filename, page }
 * @param {number} maxTokens - target chunk size (default 500)
 * @param {number} overlapTokens - overlap between chunks (default 50)
 * @returns {{text: string, metadata: {filename: string, page: number, chunk_id: string}}[]}
 */
function chunkText(text, meta, maxTokens = 500, overlapTokens = 50) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < words.length) {
    const end = Math.min(start + maxTokens, words.length);
    const chunkWords = words.slice(start, end);
    chunks.push({
      text: chunkWords.join(" "),
      metadata: {
        filename: meta.filename,
        page: meta.page,
        chunk_id: `${meta.filename}_p${meta.page}_c${chunkIndex}`,
      },
    });
    chunkIndex++;
    start = end - overlapTokens;
    if (start >= words.length) break;
    // Prevent infinite loop when overlap >= remaining
    if (end === words.length) break;
  }

  return chunks;
}

/**
 * Chunk all pages of extracted text.
 * @param {{page: number, text: string}[]} pages
 * @param {string} filename
 * @returns {{text: string, metadata: {filename: string, page: number, chunk_id: string}}[]}
 */
function chunkPages(pages, filename) {
  const allChunks = [];
  for (const { page, text } of pages) {
    const chunks = chunkText(text, { filename, page });
    allChunks.push(...chunks);
  }
  return allChunks;
}

module.exports = { chunkText, chunkPages };
