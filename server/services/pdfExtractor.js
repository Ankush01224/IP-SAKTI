const fs = require("fs");
const { PDFParse } = require("pdf-parse");

/**
 * Extract text from a PDF file, returning per-page text.
 * Uses pdf-parse v2 API.
 * @param {string} filePath - absolute path to the PDF
 * @returns {Promise<{pages: {page: number, text: string}[]}>}
 */
async function extractText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer, verbosity: 0 });

  try {
    const result = await parser.getText();
    // result.pages is an array of { num: number, text: string }
    const pages = [];
    if (result.pages) {
      for (const p of result.pages) {
        pages.push({ page: p.num, text: p.text || "" });
      }
    } else {
      // Fallback: single blob of text, treat as page 1
      pages.push({ page: 1, text: result.text || "" });
    }
    return { pages };
  } finally {
    await parser.destroy();
  }
}

module.exports = { extractText };
