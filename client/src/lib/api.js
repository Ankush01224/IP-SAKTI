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

export async function sendChat(query) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Chat failed");
  return res.json();
}
