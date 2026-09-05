// Phase 5 test cases - run with: node test_phase5.mjs
const BASE = "http://localhost:3001/api/chat";

async function chat(query, language) {
  const body = { query };
  if (language) body.language = language;
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function pass(label, condition, detail) {
  const status = condition ? "PASS" : "FAIL";
  console.log(`[${status}] ${label}`);
  if (detail) console.log(`       ${detail}`);
}

async function main() {
  console.log("=== Phase 5 Multilingual Tests ===\n");

  // Case A: Hindi query, no language selector → should detect hi, answer in Hindi
  console.log("--- Case A: Hindi query, auto-detect (no selector) ---");
  try {
    const a = await chat("आयुर्वेद में बौद्धिक संपदा अधिकार क्या हैं?");
    pass("A1 detectedLanguage == hi", a.detectedLanguage === "hi", `detectedLanguage: ${a.detectedLanguage}`);
    const hasDevanagari = /[\u0900-\u097F]/.test(a.answer);
    pass("A2 answer contains Hindi/Devanagari script", hasDevanagari, `answer preview: ${a.answer.substring(0, 100)}`);
    pass("A3 sources returned (English excerpts)", a.sources?.length > 0, `sources count: ${a.sources?.length}`);
  } catch (e) {
    console.log(`[FAIL] Case A error: ${e.message}`);
  }

  console.log();

  // Case B: English query + language selector = hi → answer should be in Hindi
  console.log("--- Case B: English query + language selector set to hi ---");
  try {
    const b = await chat("What is the TKDL and how does it protect Ayurvedic knowledge?", "hi");
    pass("B1 detectedLanguage == hi", b.detectedLanguage === "hi", `detectedLanguage: ${b.detectedLanguage}`);
    const hasDevanagari = /[\u0900-\u097F]/.test(b.answer);
    pass("B2 answer contains Devanagari script", hasDevanagari, `answer preview: ${b.answer.substring(0, 100)}`);
    pass("B3 sources returned (English excerpts)", b.sources?.length > 0, `sources count: ${b.sources?.length}`);
  } catch (e) {
    console.log(`[FAIL] Case B error: ${e.message}`);
  }

  console.log();

  // Case C: Bengali query, no selector → auto-detect bn, answer in Bengali
  console.log("--- Case C: Bengali query, auto-detect, no selector option ---");
  try {
    const c = await chat("আয়ুর্বেদে মেধাস্বত্ব অধিকার কী?");
    pass("C1 detectedLanguage == bn", c.detectedLanguage === "bn", `detectedLanguage: ${c.detectedLanguage}`);
    const hasBengali = /[\u0980-\u09FF]/.test(c.answer);
    pass("C2 answer contains Bengali script", hasBengali, `answer preview: ${c.answer.substring(0, 100)}`);
    pass("C3 sources returned (English excerpts)", c.sources?.length > 0, `sources count: ${c.sources?.length}`);
  } catch (e) {
    console.log(`[FAIL] Case C error: ${e.message}`);
  }
}

main().catch(console.error);
