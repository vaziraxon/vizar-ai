#!/usr/bin/env node
// Converts the VIZAR AI book (.docx) into the knowledge-base structure that
// supabase/knowledge.sql stores: chapters → sections (Markdown, full text),
// retrieval chunks, the source catalog, and per-country visa rules.
//
//   node scripts/knowledge/parse-book.mjs <book.docx> <out.json>
//
// Nothing is summarised: every paragraph and table cell of the .docx must
// reappear in some section's Markdown, and the script exits non-zero if the
// completeness check finds one that doesn't.
import { writeFileSync } from "node:fs";
import { readDocxBlocks } from "./docx.mjs";
import { chunkSectionMarkdown } from "../../src/lib/knowledge/chunk.ts";
import { COUNTRIES, countriesIn } from "./countries.mjs";

const [docxPath, outPath] = process.argv.slice(2);
if (!docxPath || !outPath) {
  console.error("Usage: node scripts/knowledge/parse-book.mjs <book.docx> <out.json>");
  process.exit(1);
}

const BOOK = {
  slug: "vizar-ai-kitob",
  title: "Viza olish bo‘yicha amaliy qo‘llanma",
  author: "Vaziraxon Zokirova",
  edition_date: "2026-10-26",
};

const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[‘’ʻʼ'`]/g, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9а-яё]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "bolim";

function chapterMeta(heading, position) {
  const bob = heading.match(/^([IVXLC]+)\s+BOB\.\s*(.+)$/);
  if (bob) {
    const n = ROMAN[bob[1]] ?? position;
    return { slug: `bob-${n}`, kind: "chapter", number: n, label: `${bob[1]} BOB` };
  }
  const fixed = {
    KIRISH: { slug: "kirish", kind: "intro", label: "Kirish" },
    XULOSA: { slug: "xulosa", kind: "conclusion", label: "Xulosa" },
    "AMALIY ILOVALAR": { slug: "ilovalar", kind: "appendix", label: "Amaliy ilovalar" },
    "NASHRDAN OLDINGI TAHRIRIY TEKSHIRUV": { slug: "tahririy-tekshiruv", kind: "editorial", label: "Tahririy tekshiruv" },
  };
  if (fixed[heading]) return { number: null, ...fixed[heading] };
  if (/^FOYDALANILGAN MANBALAR/.test(heading)) return { slug: "manbalar", kind: "sources", number: null, label: "Manbalar" };
  return { slug: slugify(heading), kind: "chapter", number: null, label: heading };
}

function sectionNumber(heading) {
  const num = heading.match(/^(\d+(?:\.\d+)*)\.\s+([\s\S]+)$/);
  if (num) return { number: num[1], title: num[2] };
  const ilova = heading.match(/^(ILOVA [A-Z])\.\s+([\s\S]+)$/);
  if (ilova) return { number: ilova[1], title: ilova[2] };
  return { number: null, title: heading };
}

/* ---------------------------------------------------------------- Markdown */

const wrapBold = (t) => {
  const m = t.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return m[2] ? `${m[1]}**${m[2]}**${m[3]}` : t;
};
const inline = (p) => p.segments.map((s) => (s.bold ? wrapBold(s.text) : s.text)).join("").trim();
const cell = (t) => t.replace(/\|/g, "\\|").replace(/\n/g, "<br>");

function tableMd(rows) {
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r) => Array.from({ length: width }, (_, i) => cell(r[i] ?? ""));
  const [head, ...rest] = rows;
  return [
    `| ${pad(head).join(" | ")} |`,
    `| ${Array(width).fill("---").join(" | ")} |`,
    ...rest.map((r) => `| ${pad(r).join(" | ")} |`),
  ].join("\n");
}

/** Section body blocks → Markdown, joining consecutive list items into one list. */
function toMarkdown(blocks) {
  const out = [];
  let listKind = null;
  let listNo = 0;
  for (const b of blocks) {
    if (b.type === "table") {
      listKind = null;
      out.push(tableMd(b.rows));
      continue;
    }
    const text = inline(b);
    if (!text) continue;
    if (b.style === "List Bullet" || b.style === "List Number") {
      const kind = b.style === "List Bullet" ? "ul" : "ol";
      listNo = kind === listKind ? listNo + 1 : 1;
      const item = kind === "ul" ? `- ${text}` : `${listNo}. ${text}`;
      if (kind === listKind) out[out.length - 1] += `\n${item.replace(/\n/g, " ")}`;
      else out.push(item.replace(/\n/g, " "));
      listKind = kind;
      continue;
    }
    listKind = null;
    if (b.style === "heading 3") out.push(`### ${b.text.trim()}`);
    else if (b.style === "Quote" || b.style === "Vizar Appendix Note") out.push(text.replace(/^/gm, "> "));
    else if ((b.style === "Subtitle" || b.style === "caption") && !text.includes("*")) out.push(`*${text}*`);
    else out.push(text);
  }
  return out.join("\n\n");
}

/* --------------------------------------------------------------- Structure */

const blocks = readDocxBlocks(docxPath);
const chapters = [];
let chapter = {
  position: 0,
  slug: "kitob-haqida",
  kind: "front",
  number: null,
  label: "Kitob haqida",
  title: "Muallif va nashr haqida",
  blocks: [],
};
chapters.push(chapter);

for (const b of blocks) {
  if (b.type === "p" && b.style === "heading 1") {
    const heading = b.text.trim();
    chapter = { position: chapters.length, ...chapterMeta(heading, chapters.length), title: heading, blocks: [] };
    chapters.push(chapter);
  } else {
    chapter.blocks.push(b);
  }
}

// The table of contents gives mixed-case chapter titles ("I BOB. Viza tizimi ...").
const toc = blocks.find((b) => b.type === "table" && b.rows[0]?.[0] === "KIRISH");
const tocTitle = new Map((toc?.rows ?? []).map((r) => [r[0].toUpperCase(), r[0]]));

for (const ch of chapters) {
  ch.display_title = tocTitle.get(ch.title.toUpperCase()) ?? ch.title;
  const sections = [];
  let current = null;
  const startSection = (meta) => {
    current = { position: sections.length, ...meta, blocks: [] };
    sections.push(current);
  };
  for (const b of ch.blocks) {
    if (b.type === "p" && b.style === "heading 2") {
      startSection({ ...sectionNumber(b.text.trim()), is_intro: false });
    } else {
      if (!current) startSection({ number: null, title: ch.display_title, is_intro: true });
      current.blocks.push(b);
    }
  }
  const used = new Set();
  for (const s of sections) {
    let slug = s.is_intro ? "kirish-qismi" : s.number ? slugify(s.number.replace(/\./g, "-")) : slugify(s.title);
    while (used.has(slug)) slug += "-2";
    used.add(slug);
    s.slug = slug;
    s.content_md = toMarkdown(s.blocks);
  }
  ch.sections = sections.filter((s) => s.content_md.trim() || !s.is_intro);
}

/* ------------------------------------------------- Completeness check */

const norm = (s) => s.replace(/<br>/g, "").replace(/\\\|/g, "|").replace(/[\s*|#>\\]/g, "");
let sourceChars = 0;
const missing = [];
for (const ch of chapters) {
  const sectionText = ch.sections.map((s) => norm(`${s.number ? `${s.number}. ` : ""}${s.title}${s.content_md}`)).join("");
  const check = (text, where) => {
    const n = norm(text);
    if (!n) return;
    sourceChars += text.trim().length;
    if (!sectionText.includes(n)) missing.push(`${ch.slug}: ${where}: ${text.slice(0, 80)}`);
  };
  // Chapter headings themselves are stored verbatim in kb_chapters.title.
  if (ch.kind !== "front") sourceChars += ch.title.length;
  for (const b of ch.blocks) {
    if (b.type === "table") b.rows.forEach((r) => r.forEach((c) => check(c, "table cell")));
    else check(b.text, b.style);
  }
}

/* --------------------------------------------------------------- Sources */

const URL_RE = /(https?:\/\/[^\s<>"”]+)/;
const trimTitle = (t) => t.replace(/\s*[:—–\-.]\s*$/, "").replace(/\s+/g, " ").trim();

// Unified catalog: "001. Publisher, “Title” [boblar: I, IV]\nhttps://..."
const catalog = [];
const sourcesChapter = chapters.find((c) => c.kind === "sources");
for (const b of sourcesChapter?.blocks ?? []) {
  if (b.type !== "p") continue;
  const m = b.text.match(/^(\d{3})\.\s+([\s\S]+?)\s*\[boblar:\s*([^\]]+)\]\s*([\s\S]*)$/);
  const url = m?.[4].match(URL_RE)?.[1];
  if (m && url) catalog.push({ code: m[1], title: trimTitle(m[2]), chapters: m[3].split(",").map((x) => x.trim()), url });
}

// Chapter-local references: "[R07] Title: https://..." / "[VII-01] Title\nhttps://..."
const chapterRefs = {};
for (const ch of chapters) {
  const refs = {};
  for (const b of ch.blocks) {
    if (b.type !== "p") continue;
    const m = b.text.match(/^\[([^\]]{1,12})\]\s+([\s\S]*)$/);
    const url = m?.[2].match(URL_RE)?.[1];
    if (m && url) refs[m[1]] = { title: trimTitle(m[2].replace(URL_RE, "")), url };
  }
  chapterRefs[ch.slug] = refs;
}

const sourceByUrl = new Map(catalog.map((s) => [s.url, s]));
const extraSources = [];
for (const [slug, refs] of Object.entries(chapterRefs)) {
  const label = chapters.find((c) => c.slug === slug)?.label.replace(/ BOB$/, "");
  for (const ref of Object.values(refs)) {
    const known = sourceByUrl.get(ref.url);
    if (known) {
      if (label && !known.chapters.includes(label)) known.chapters.push(label);
      continue;
    }
    const s = { code: `X${String(extraSources.length + 1).padStart(2, "0")}`, title: ref.title, chapters: label ? [label] : [], url: ref.url };
    extraSources.push(s);
    sourceByUrl.set(ref.url, s);
  }
}
const sources = [...catalog, ...extraSources];

/* --------------------------------------------------------- Country rules */

const sectionOf = (chSlug, pred) => chapters.find((c) => c.slug === chSlug)?.sections.find(pred);
const refsIn = (text) =>
  [...text.matchAll(/\[([^\]]+)\]/g)].flatMap((m) => m[1].split(/\s*,\s*/)).filter((code) => /^[A-Z]*-?\d+$|^[IVX]+-\d+$/.test(code));

function resolveSources(chSlug, text, countryCodes) {
  const refs = chapterRefs[chSlug] ?? {};
  const explicit = refsIn(text).map((code) => refs[code]?.url).filter(Boolean);
  if (explicit.length) return { urls: [...new Set(explicit)], match: "explicit" };
  // No inline reference: fall back to this chapter's sources that name the country.
  const names = countryCodes.flatMap((code) => COUNTRIES[code]?.match ?? []);
  const inferred = Object.values(refs)
    .filter((r) => names.some((n) => `${r.title} ${r.url}`.toLowerCase().includes(n.toLowerCase())))
    .map((r) => r.url);
  return inferred.length ? { urls: [...new Set(inferred)], match: "inferred" } : { urls: [], match: "none" };
}

const rules = [];
const addRule = (rule) => {
  for (const code of rule.countries) {
    rules.push({
      country_code: code,
      country_name: COUNTRIES[code].name,
      region: COUNTRIES[code].region,
      topic: rule.topic,
      rule_text: rule.text,
      volatility: rule.volatility,
      chapter_slug: rule.chapter,
      section_slug: rule.section,
      source_urls: rule.sources.urls,
      source_match: rule.sources.match,
    });
  }
};

function rulesFromTable(chSlug, sectionNo, topic, volatility) {
  const section = sectionOf(chSlug, (s) => s.number === sectionNo);
  const table = section?.blocks.find((b) => b.type === "table");
  if (!table) throw new Error(`Table for ${chSlug} ${sectionNo} not found`);
  const [head, ...rows] = table.rows;
  for (const row of rows) {
    const countries = countriesIn(row[0]);
    if (!countries.length) continue;
    const text = row.map((c, i) => `${head[i] || "—"}: ${c}`).join("\n");
    addRule({ countries, topic, text, volatility, chapter: chSlug, section: section.slug, sources: resolveSources(chSlug, text, countries) });
  }
}

// V bob: 5.9.01–5.9.29 — one subsection per Schengen state, three labelled paragraphs each.
const ch5 = chapters.find((c) => c.slug === "bob-5");
const s59 = ch5?.sections.find((s) => s.number === "5.9");
if (s59) {
  let country = null;
  for (const b of s59.blocks) {
    if (b.type === "p" && b.style === "heading 3") {
      country = countriesIn(b.text.replace(/^5\.9\.\d+\.\s*/, ""));
      continue;
    }
    if (!country?.length || b.type !== "p" || !b.text.trim()) continue;
    const label = b.text.match(/^([^.]{3,40})\.\s/)?.[1] ?? "Izoh";
    addRule({
      countries: country,
      topic: label,
      text: b.text.trim(),
      volatility: /murojaat|qabul|yig‘im/i.test(label) ? "high" : "medium",
      chapter: "bob-5",
      section: s59.slug,
      sources: resolveSources("bob-5", b.text, country),
    });
  }
}
rulesFromTable("bob-5", "5.8", "Qabul yo‘li va vakillik (2026-yil oktyabr)", "high");
rulesFromTable("bob-6", "6.4", "Kirish tartibi — tezkor taqqoslash", "high");
rulesFromTable("bob-7", "7.2", "Viza tizimi — tezkor taqqoslash", "medium");
rulesFromTable("bob-7", "7.22", "Viza yig‘imi (2026-10-26 holati)", "high");
rulesFromTable("bob-8", "8.2", "Qisqa turistik tashrif yo‘li", "high");
rulesFromTable("bob-8", "8.22", "Kirish rejimi (2026)", "high");

// Four facts the editors re-checked against official pages on 26 Oct 2026.
const checked = sectionOf("manbalar", (s) => /o‘zgaruvchan qoida/.test(s.title));
if (checked) {
  const paras = checked.blocks.filter((b) => b.type === "p" && b.text.trim()).map((b) => b.text.trim());
  for (let i = 0; i < paras.length - 1; i++) {
    const url = paras[i + 1].match(/^https?:\/\/\S+$/)?.[0];
    if (!url) continue;
    const head = paras[i].split(":")[0];
    const countries = /Shengen/i.test(head) ? ["EU"] : countriesIn(head);
    if (countries.length) {
      addRule({ countries, topic: "Tahririy qayta tekshirilgan qoida", text: paras[i], volatility: "high", chapter: "manbalar", section: checked.slug, sources: { urls: [url], match: "explicit" } });
    }
    i++;
  }
}

// Detailed book sections per country (for "read more" links and admin review).
const countrySections = [];
for (const ch of chapters.filter((c) => ["bob-5", "bob-6", "bob-7", "bob-8"].includes(c.slug))) {
  for (const s of ch.sections) {
    const fromTitle = countriesIn(s.title.split(/[:—]/)[0]);
    for (const code of fromTitle) countrySections.push({ country_code: code, chapter_slug: ch.slug, section_slug: s.slug });
  }
}
if (s59) {
  for (const b of s59.blocks.filter((x) => x.type === "p" && x.style === "heading 3")) {
    for (const code of countriesIn(b.text.replace(/^5\.9\.\d+\.\s*/, ""))) {
      countrySections.push({ country_code: code, chapter_slug: "bob-5", section_slug: s59.slug, anchor: b.text.trim() });
    }
  }
}

/* ------------------------------------------------------------------ Output */

let chunkCount = 0;
const outChapters = chapters.map((ch) => ({
  position: ch.position,
  slug: ch.slug,
  kind: ch.kind,
  number: ch.number,
  label: ch.label,
  title: ch.title,
  display_title: ch.display_title,
  sections: ch.sections.map((s) => {
    const sectionLabel = s.number ? `${s.number}. ${s.title}` : s.title;
    const chunks = chunkSectionMarkdown(s.content_md, { chapterLabel: ch.display_title, sectionLabel });
    chunkCount += chunks.length;
    return { position: s.position, slug: s.slug, number: s.number, title: s.title, is_intro: s.is_intro, content_md: s.content_md, chunks };
  }),
}));

const markdownChars = outChapters.reduce((n, c) => n + c.sections.reduce((m, s) => m + s.content_md.length, 0), 0);
const out = {
  book: BOOK,
  generated_at: new Date().toISOString(),
  chapters: outChapters,
  sources,
  chapter_refs: chapterRefs,
  country_rules: rules,
  country_sections: countrySections,
};
writeFileSync(outPath, JSON.stringify(out, null, 1));

const stats = {
  chapters: outChapters.length,
  sections: outChapters.reduce((n, c) => n + c.sections.length, 0),
  chunks: chunkCount,
  source_text_chars: sourceChars,
  markdown_chars: markdownChars,
  sources: sources.length,
  country_rules: rules.length,
  countries: new Set(rules.map((r) => r.country_code)).size,
  rules_with_sources: rules.filter((r) => r.source_urls.length).length,
  missing_paragraphs: missing.length,
};
console.log(JSON.stringify(stats, null, 2));
if (missing.length) {
  console.error("Completeness check failed — these paragraphs are not in any section:");
  missing.slice(0, 20).forEach((m) => console.error("  " + m));
  process.exit(2);
}
