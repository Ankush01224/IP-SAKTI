const BASE = "";

export async function uploadDocument(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/api/documents/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
  return res.json();
}

export async function ingestDocument(filename) {
  const res = await fetch(`${BASE}/api/documents/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Ingest failed");
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${BASE}/api/documents/list`);
  if (!res.ok) throw new Error("Failed to list documents");
  return res.json();
}

/**
 * @param {string} query
 * @param {string} [language] - ISO-639-1 code e.g. "hi", "ta". If omitted, server auto-detects.
 */
export async function sendChat(query, language) {
  const body = { query };
  if (language) body.language = language;

  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Chat failed");
  return res.json();
}
