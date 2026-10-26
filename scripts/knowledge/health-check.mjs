#!/usr/bin/env node
// Knowledge-base ↔ Supabase integration check, using only the public
// (publishable) key from .env.local — exactly what the website itself has.
// Makes no paid API calls: search embeddings run on Supabase's built-in
// gte-small model.
//
//   node scripts/knowledge/health-check.mjs
//
// Exits non-zero if any check fails. The RLS checks attempt writes that must
// be rejected; nothing is written when the policies are correct.
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")])
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing in .env.local");

const headers = { apikey: key, "Content-Type": "application/json" };
const rest = (path, init = {}) => fetch(`${url}/rest/v1/${path}`, { ...init, headers: { ...headers, ...init.headers } });
const fn = (name, body) => fetch(`${url}/functions/v1/${name}`, { method: "POST", headers, body: JSON.stringify(body) });

const results = [];
async function check(name, run) {
  try {
    const detail = await run();
    results.push({ ok: true, name, detail });
  } catch (e) {
    results.push({ ok: false, name, detail: e instanceof Error ? e.message : String(e) });
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

await check("kb_stats: book loaded and fully embedded", async () => {
  const s = await (await rest("rpc/kb_stats", { method: "POST", body: "{}" })).json();
  expect(s.chapters >= 15 && s.sections >= 352, `chapters=${s.chapters} sections=${s.sections}`);
  expect(s.chunks > 0 && s.chunks === s.chunks_embedded, `chunks=${s.chunks} embedded=${s.chunks_embedded}`);
  return `${s.chapters} bob, ${s.sections} bo‘lim, ${s.chunks}/${s.chunks_embedded} bo‘lak embedding bilan, ${s.country_rules} qoida (${s.countries} davlat), manbalar ${JSON.stringify(s.sources_by_status)}`;
});

await check("Public read: published chapters visible", async () => {
  const res = await rest("kb_chapters?select=slug&status=eq.published", { headers: { Prefer: "count=exact" } });
  const count = Number(res.headers.get("content-range")?.split("/")[1]);
  expect(res.ok && count >= 15, `HTTP ${res.status}, count=${count}`);
  return `${count} ta bob ochiq o‘qiladi`;
});

await check("RLS: anonymous insert into kb_sections is rejected", async () => {
  const res = await rest("kb_sections", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ chapter_id: "00000000-0000-0000-0000-000000000000", position: 0, slug: "rls-check", title: "rls-check" }),
  });
  expect(!res.ok, `insert unexpectedly succeeded (HTTP ${res.status})`);
  return `rad etildi (HTTP ${res.status})`;
});

await check("RLS: anonymous kb_replace_section_chunks is rejected", async () => {
  const res = await rest("rpc/kb_replace_section_chunks", {
    method: "POST",
    body: JSON.stringify({ p_section_id: "00000000-0000-0000-0000-000000000000", p_chunks: [] }),
  });
  expect(!res.ok, `RPC unexpectedly succeeded (HTTP ${res.status})`);
  return `rad etildi (HTTP ${res.status})`;
});

await check("kb_is_editor() is false for anonymous callers", async () => {
  const v = await (await rest("rpc/kb_is_editor", { method: "POST", body: "{}" })).json();
  expect(v === false, `got ${JSON.stringify(v)}`);
  return "false";
});

await check("kb-search: hybrid search answers a question", async () => {
  const t0 = Date.now();
  const res = await fn("kb-search", { query: "Kanada vizasi uchun biometrika qanday topshiriladi?" });
  const body = await res.json();
  expect(res.ok && body.chunks?.length > 0, `HTTP ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  const top = body.chunks.slice(0, 3).map((c) => c.section_number ?? c.section_title).join(", ");
  return `${body.chunks.length} bo‘lak, ${body.rules.length} qoida, ${Date.now() - t0} ms; top-3: ${top}`;
});

await check("kb-search: country rules stay on topic", async () => {
  const body = await (await fn("kb-search", { query: "Dubayga vizasiz borsa bo'ladimi?" })).json();
  const countries = [...new Set(body.rules.map((r) => r.country_code))];
  expect(countries.length > 0 && countries.every((c) => c === "AE"), `countries=${countries.join(",")}`);
  return `faqat ${countries.join(", ")} qoidalari`;
});

await check("kb-search: input validation", async () => {
  const res = await fn("kb-search", { query: "" });
  expect(res.status === 400, `HTTP ${res.status}`);
  return "bo‘sh so‘rov → HTTP 400";
});

await check("kb-embed: no pending chunks", async () => {
  const body = await (await fn("kb-embed", { chain: false, limit: 1 })).json();
  expect(body.remaining === 0, `remaining=${body.remaining}`);
  return "navbatda 0 ta bo‘lak";
});

const width = Math.max(...results.map((r) => r.name.length));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
