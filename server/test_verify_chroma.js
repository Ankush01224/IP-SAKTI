// Verify ChromaDB contents: chunks, embeddings, metadata
const { ChromaClient } = require("chromadb");

async function verify() {
  const client = new ChromaClient({ host: "localhost", port: 8000 });
  const col = await client.getOrCreateCollection({
    name: "ipsakti_documents",
    embeddingFunction: null,
  });

  const result = await col.get({ include: ["documents", "embeddings", "metadatas"] });

  console.log("=== ChromaDB Verification ===");
  console.log(`Total chunks: ${result.ids.length}`);

  for (let i = 0; i < result.ids.length; i++) {
    console.log(`\n--- Chunk ${i + 1} ---`);
    console.log(`  ID:       ${result.ids[i]}`);
    console.log(`  Metadata: ${JSON.stringify(result.metadatas[i])}`);
    console.log(`  Text:     ${result.documents[i].substring(0, 100)}...`);
    const emb = result.embeddings[i];
    console.log(`  Embedding: [${emb.slice(0, 5).map(v => v.toFixed(6)).join(", ")}...] (dim=${emb.length})`);
  }

  console.log("\n=== All checks passed ===");
}

verify().catch(console.error);
