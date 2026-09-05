const { Pinecone } = require("@pinecone-database/pinecone");
const config = require("../config");

let index = null;

const INDEX_NAME = "ipsakti-documents";
const NAMESPACE = "default";
// Gemini text-embedding-004 outputs 768 dimensions
const DIMENSION = 768;

async function getIndex() {
  if (index) return index;

  const pc = new Pinecone({ apiKey: config.pineconeApiKey });

  // Create index if it doesn't exist
  const existingIndexes = await pc.listIndexes();
  const names = (existingIndexes.indexes || []).map((i) => i.name);

  if (!names.includes(INDEX_NAME)) {
    console.log(`[pinecone] Creating index "${INDEX_NAME}"...`);
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: DIMENSION,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    // Wait for index to be ready
    let ready = false;
    while (!ready) {
      await new Promise((r) => setTimeout(r, 2000));
      const desc = await pc.describeIndex(INDEX_NAME);
      ready = desc.status?.ready === true;
      console.log(`[pinecone] Index status: ${JSON.stringify(desc.status)}`);
    }
  }

  index = pc.index(INDEX_NAME);
  console.log(`[pinecone] Index ready: "${INDEX_NAME}"`);
  return index;
}

/**
 * Add chunks with embeddings to Pinecone.
 * @param {{text: string, metadata: object}[]} chunks
 * @param {number[][]} embeddings
 */
async function addChunks(chunks, embeddings) {
  const idx = await getIndex();

  const vectors = chunks.map((c, i) => ({
    id: c.metadata.chunk_id,
    values: embeddings[i],
    metadata: {
      ...c.metadata,
      text: c.text, // store text in metadata for retrieval
    },
  }));

  // Pinecone recommends batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    await idx.namespace(NAMESPACE).upsert(vectors.slice(i, i + BATCH_SIZE));
  }

  return vectors.length;
}

/**
 * List all documents (unique filenames) in the index.
 */
async function listDocuments() {
  const idx = await getIndex();

  // Pinecone serverless: use list to get all IDs then fetch metadata
  const stats = await idx.describeIndexStats();
  const totalChunks = stats.namespaces?.[NAMESPACE]?.recordCount || 0;

  // Fetch up to 10000 vectors to get unique filenames
  // Use a dummy query to get metadata
  if (totalChunks === 0) {
    return { totalChunks: 0, documents: [] };
  }

  // Query with a zero vector to get all (approximate)
  const dummyEmbedding = new Array(DIMENSION).fill(0);
  const result = await idx.namespace(NAMESPACE).query({
    vector: dummyEmbedding,
    topK: Math.min(totalChunks, 10000),
    includeMetadata: true,
  });

  const filenames = new Set();
  for (const match of result.matches || []) {
    if (match.metadata?.filename) filenames.add(match.metadata.filename);
  }

  return {
    totalChunks,
    documents: [...filenames],
  };
}

/**
 * Query Pinecone for the top-N most similar chunks.
 * @param {number[]} queryEmbedding
 * @param {number} nResults
 */
async function querySimilar(queryEmbedding, nResults = 5) {
  const idx = await getIndex();

  const result = await idx.namespace(NAMESPACE).query({
    vector: queryEmbedding,
    topK: nResults,
    includeMetadata: true,
  });

  const matches = result.matches || [];

  return {
    ids: matches.map((m) => m.id),
    documents: matches.map((m) => m.metadata?.text || ""),
    metadatas: matches.map((m) => {
      const { text, ...rest } = m.metadata || {};
      return rest;
    }),
    distances: matches.map((m) => 1 - (m.score || 0)), // convert similarity to distance
  };
}

module.exports = { getIndex, addChunks, listDocuments, querySimilar };
