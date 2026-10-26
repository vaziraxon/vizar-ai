// RAG retrieval test: asks kb-search a fixed set of questions and checks that
// the expected book section appears in the top results.
// Usage (from project root): node scripts/knowledge/rag-test.mjs [out.json]
import { readFileSync, writeFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]));
const CASES = [
  { q: "Shengen vizasida 90/180 kun qoidasi qanday hisoblanadi?", expect: ["1.10", "1.25", "5.3"] },
  { q: "AQSh B-1/B-2 vizasi 214(b) bo'yicha rad etilsa nima qilish kerak?", expect: ["4.15", "4.37", "7.8"] },
  { q: "Bank ko‘chirmasida katta bir martalik tushum bo‘lsa qanday izoh beriladi?", expect: ["2.9", "A5", "7.24", "8.27"] },
  { q: "Germaniya vizasi uchun O‘zbekistondan qayerga topshiriladi?", expect: ["5.9", "5.8"] },
  { q: "Tailandga 2026-yilda vizasiz kirish mumkinmi?", expect: ["8.7", "8.2", "8.22"] },
  { q: "Yangi Zelandiya visitor visa uchun oyiga qancha pul ko'rsatish kerak?", expect: ["7.20", "2.17", "A12"] },
  { q: "Voyaga yetmagan bola bilan sayohat uchun qanday hujjat kerak?", expect: ["2.21", "1.31", "5.9.32", "8.25", "7.28"] },
  { q: "Kanada vizasi uchun biometrika qanday topshiriladi?", expect: ["3.15", "7.11", "3.28"] },
  { q: "Tranzitda aeroportdan chiqmasam ham viza kerakmi?", expect: ["1.14", "1.32"] },
  { q: "Homiylik xati qanday yoziladi?", expect: ["2.13", "7.25", "A13", "8.25"] },
];
const results = [];
let hits = 0;
for (const c of CASES) {
  const t0 = Date.now();
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/kb-search`, {
    method: "POST", headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ query: c.q, match_count: 8 }),
  });
  const body = await res.json();
  const ms = Date.now() - t0;
  const top = (body.chunks ?? []).map((h) => ({
    section: h.section_number ?? h.section_title, chapter: h.chapter_label, title: h.section_title,
    ft: h.full_text_rank, sem: h.semantic_rank, sim: h.similarity && +h.similarity.toFixed(3), score: +h.score.toFixed(4),
  }));
  const headings = (body.chunks ?? []).map((h) => `${h.section_number ?? ""} ${h.heading_path}`);
  const found = c.expect.find((e) => headings.slice(0, 5).some((p) => p.includes(` ${e}`) || p.startsWith(e) || p.includes(`${e}.`)));
  if (found) hits++;
  const rules = (body.rules ?? []).map((r) => `${r.country_code}:${r.topic} [${r.status}]${r.sources.length ? " +src" : ""}`);
  results.push({ q: c.q, http: res.status, ms, terms: body.terms, hit_top5: Boolean(found), matched: found ?? null, top, rules });
  console.log(`${found ? "PASS" : "MISS"} ${ms}ms  ${c.q}\n   top3: ${top.slice(0, 3).map((t) => `${t.section} (${t.chapter})`).join(" | ")}\n   rules: ${rules.slice(0, 3).join(" | ") || "—"}`);
}
console.log(`\nTop-5 hit rate: ${hits}/${CASES.length}`);
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify({ hits, total: CASES.length, results }, null, 1));
process.exitCode = hits === CASES.length ? 0 : 1;
