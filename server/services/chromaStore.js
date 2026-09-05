const { ChromaClient } = require("chromadb");
const config = require("../config");

let client = null;
let collection = null;

const COLLECTION_NAME = "ipsakti_documents";

async function getCollection() {
  if (collection) return collection;

  const url = new URL(config.chromaUrl);
  const isHttps = url.protocol === "https:";
  // On Render, HTTPS services don't have an explicit port (defaults to 443)
  const port = url.port ? parseInt(url.port, 10) : isHttps ? 443 : 8000;

  client = new ChromaClient({
    host: url.hostname,
    port,
    ssl: isHttps,
  });

  collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { "hnsw:space": "cosine" },
    embeddingFunction: null,
  });

  return collection;
}

/**
 * Add chunks with embeddings to ChromaDB.
 * @param {{text: string, metadata: object}[]} chunks
 * @param {number[][]} embeddings
 */
async function addChunks(chunks, embeddings) {
  const col = await getCollection();

  const ids = chunks.map((c) => c.metadata.chunk_id);
  const documents = chunks.map((c) => c.text);
  const metadatas = chunks.map((c) => c.metadata);

  await col.add({
    ids,
    documents,
    embeddings,
    metadatas,
  });

  return ids.length;
}

/**
 * List all documents (unique filenames) in the collection.
 */
async function listDocuments() {
  const col = await getCollection();
  const result = await col.get({});

  const filenames = new Set();
  if (result.metadatas) {
    for (const meta of result.metadatas) {
      if (meta && meta.filename) filenames.add(meta.filename);
    }
  }

  return {
    totalChunks: result.ids ? result.ids.length : 0,
    documents: [...filenames],
  };
}
/**
 * Query ChromaDB for the top-N most similar chunks.
 * @param {number[]} queryEmbedding
 * @param {number} nResults
 * @returns {Promise<{ids: string[], documents: string[], metadatas: object[], distances: number[]}>}
 */
async function querySimilar(queryEmbedding, nResults = 5) {
  const col = await getCollection();
  const result = await col.query({
    queryEmbeddings: [queryEmbedding],
    nResults,
    include: ["documents", "metadatas", "distances"],
  });

  return {
    ids: result.ids[0] || [],
    documents: result.documents[0] || [],
    metadatas: result.metadatas[0] || [],
    distances: result.distances[0] || [],
  };
}

module.exports = { getCollection, addChunks, listDocuments, querySimilar };
