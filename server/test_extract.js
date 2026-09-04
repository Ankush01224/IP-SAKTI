// Quick test: extract + chunk the test PDF
const path = require("path");
const { extractText } = require("./services/pdfExtractor");
const { chunkPages } = require("./services/chunker");

async function main() {
  const filePath = path.join(__dirname, "uploads", "test_ayurveda.pdf");
  
  console.log("=== Testing PDF extraction ===");
  const { pages } = await extractText(filePath);
  console.log(`Pages extracted: ${pages.length}`);
  for (const p of pages) {
    console.log(`  Page ${p.page}: ${p.text.substring(0, 80)}...`);
  }

  console.log("\n=== Testing chunking ===");
  const chunks = chunkPages(pages, "test_ayurveda.pdf");
  console.log(`Chunks created: ${chunks.length}`);
  for (const c of chunks) {
    console.log(`  ${c.metadata.chunk_id}: ${c.text.substring(0, 60)}... (${c.text.split(/\s+/).length} words)`);
  }
}

main().catch(console.error);
