// Unit tests for the answer-generator switch and the no-AI answers.
// No network, no paid calls.
//
//   node --test scripts/knowledge/offline-mode.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAiMode } from "../../src/lib/ai/mode.ts";
import { buildReferences, excerpt, libraryHref, mockAnswer, previewAnswer, retrievalAnswer } from "../../src/lib/knowledge/offline.ts";

test("resolveAiMode: production without a key never calls a paid API", () => {
  assert.equal(resolveAiMode({ NODE_ENV: "production" }), "off");
  assert.equal(resolveAiMode({ NODE_ENV: "production", ANTHROPIC_API_KEY: "   " }), "off");
});

test("resolveAiMode: mock answers only under next dev", () => {
  assert.equal(resolveAiMode({ NODE_ENV: "development" }), "mock");
  assert.equal(resolveAiMode({ NODE_ENV: "production", KB_AI_MODE: "mock" }), "off");
  assert.equal(resolveAiMode({ NODE_ENV: "test", KB_AI_MODE: "mock" }), "off");
});

test("resolveAiMode: adding ANTHROPIC_API_KEY switches AI on", () => {
  assert.equal(resolveAiMode({ NODE_ENV: "production", ANTHROPIC_API_KEY: "sk-ant-test" }), "live");
  assert.equal(resolveAiMode({ NODE_ENV: "development", ANTHROPIC_API_KEY: "sk-ant-test" }), "live");
});

test("resolveAiMode: KB_AI_MODE=off is a kill switch even with a key", () => {
  assert.equal(resolveAiMode({ NODE_ENV: "production", ANTHROPIC_API_KEY: "sk-ant-test", KB_AI_MODE: "off" }), "off");
  assert.equal(resolveAiMode({ NODE_ENV: "development", ANTHROPIC_API_KEY: "sk-ant-test", KB_AI_MODE: "OFF" }), "off");
});

test("resolveAiMode: KB_AI_MODE=live without a key falls back safely", () => {
  assert.equal(resolveAiMode({ NODE_ENV: "production", KB_AI_MODE: "live" }), "off");
  assert.equal(resolveAiMode({ NODE_ENV: "development", KB_AI_MODE: "live" }), "mock");
});

const chunk = (n, extra = {}) => ({
  chunk_id: `c${n}`,
  chapter_slug: "bob-1",
  chapter_label: "I BOB",
  chapter_title: "I BOB. Viza tizimi va vizalarning turlari",
  section_id: `s${n}`,
  section_slug: `1-${n}`,
  section_number: `1.${n}`,
  section_title: `Bo‘lim ${n}`,
  heading_path: `I BOB. Viza tizimi › 1.${n}. Bo‘lim ${n}`,
  content: `Birinchi gap ${n}. Ikkinchi gap juda muhim ma’lumot beradi.\n\n| A | B |\n| --- | --- |\n| 1 | 2 |`,
  full_text_rank: n,
  semantic_rank: n,
  similarity: 0.9,
  score: 1 / n,
  ...extra,
});
const rule = {
  rule_id: "r1",
  country_code: "AE",
  country_name: "BAA",
  topic: "Kirish rejimi (2026)",
  rule_text: "Davlat: BAA\nAsosiy yo‘l: Qisqa vizasiz tashrif\nNimani oldindan hal qilish kerak: Pasport va 30 kunlik rejim shartlari",
  volatility: "high",
  status: "unverified",
  as_of: "2026-10-26",
  last_verified_at: null,
  next_review_at: "2026-11-25",
  section_slug: "8-22",
  chapter_slug: "bob-8",
  sources: [{ title: "UAE", url: "https://u.ae/", check_status: "ok", last_checked_at: null }],
  country_hit: true,
  rank: 0.5,
};
const result = { query: "q", terms: ["q"], chunks: [chunk(1), chunk(2), chunk(3), chunk(4)], rules: [rule] };

test("buildReferences numbers book passages first, then rules", () => {
  const refs = buildReferences(result);
  assert.deepEqual(refs.map((r) => [r.n, r.kind]), [[1, "book"], [2, "book"], [3, "book"], [4, "book"], [5, "rule"]]);
  assert.equal(refs[4].title, "BAA: Kirish rejimi (2026)");
  assert.deepEqual(refs[4].urls, ["https://u.ae/"]);
});

test("retrievalAnswer quotes the top 3 passages verbatim and cites rules", () => {
  const { markdown, references } = retrievalAnswer(result);
  for (const n of [1, 2, 3]) assert.ok(markdown.includes(`⟦${n}⟧`), `cites passage ${n}`);
  assert.ok(!markdown.includes("⟦4⟧"), "only the top three passages");
  assert.ok(markdown.includes(chunk(1).content), "passage text is not shortened");
  assert.ok(markdown.includes("⟦5⟧") && markdown.includes("BAA: Kirish rejimi (2026)"));
  assert.ok(!/ANTHROPIC|API key|kalit/i.test(markdown), "no configuration jargon for end users");
  assert.deepEqual(references.filter((r) => r.cited).map((r) => r.n), [1, 2, 3, 5]);
});

test("mockAnswer is clearly labelled and cites what it uses", () => {
  const { markdown, references } = mockAnswer(result);
  assert.ok(markdown.startsWith("> 🧪 **Test javobi (mock).**"));
  assert.ok(markdown.includes("⟦1⟧") && markdown.includes("⟦5⟧"));
  assert.ok(!markdown.includes("| --- |"), "tables are not pasted into the summary");
  assert.deepEqual(references.filter((r) => r.cited).map((r) => r.n), [1, 2, 3, 5]);
});

test("empty search results give a helpful message", () => {
  const empty = { query: "q", terms: [], chunks: [], rules: [] };
  assert.match(retrievalAnswer(empty).markdown, /mos bo‘lim topilmadi/);
  assert.match(mockAnswer(empty).markdown, /mos bo‘lim topilmadi/);
});

test("references link into the /knowledge-base library", () => {
  const refs = buildReferences(result);
  assert.equal(refs[0].href, "/knowledge-base/book/bob-1/1-1");
  assert.equal(refs[4].href, "/knowledge-base/countries/ae");
  assert.equal(libraryHref.country("DE"), "/knowledge-base/countries/de");
});

test("previewAnswer (no subscription) never contains full passages or rule texts", () => {
  // kb-search already shortens passages for preview callers; previewAnswer must not add anything back.
  const preview = {
    ...result,
    access: "preview",
    chunks: result.chunks.map((c) => ({ ...c, content: "Birinchi gap…" })),
    rules: [{ ...rule, rule_text: "" }],
  };
  const { markdown, references } = previewAnswer(preview);
  assert.ok(markdown.includes("I BOB › 1.1. Bo‘lim 1") && markdown.includes("⟦1⟧"));
  assert.ok(markdown.includes("BAA: Kirish rejimi (2026)") && markdown.includes("⟦5⟧"));
  assert.ok(!markdown.includes("Ikkinchi gap"), "no text beyond the preview");
  assert.ok(!markdown.includes("Asosiy yo‘l"), "no rule text");
  assert.ok(!markdown.includes("| --- |"));
  assert.deepEqual(references.filter((r) => r.cited).map((r) => r.n), [1, 2, 3, 4, 5]);
  // Even if a full result slipped through, the answer stays an excerpt.
  const leaked = previewAnswer({ ...result, chunks: [chunk(1, { content: `${"so‘z ".repeat(200)}SIR` })] }).markdown;
  assert.ok(!leaked.includes("SIR") && leaked.length < 400);
  assert.match(previewAnswer({ query: "q", terms: [], access: "preview", chunks: [], rules: [] }).markdown, /mos bo‘lim topilmadi/);
});

test("excerpt drops tables/headings and cuts on a boundary", () => {
  assert.equal(excerpt("### Sarlavha\nOddiy matn.\n| a | b |"), "Oddiy matn.");
  const long = `${"so‘z ".repeat(100)}oxiri.`;
  const out = excerpt(long, 50);
  assert.ok(out.length <= 51 && out.endsWith("…"));
});
