// Loads and validates the knowledge-base translations in supabase/i18n/*.json.
// Shared by i18n-sql.mjs (SQL for the SQL Editor) and i18n-import.mjs.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const LANGS = ["ru", "en"];
const DIR = "supabase/i18n";

export function loadTranslations(dir = DIR) {
  const read = (name) => JSON.parse(readFileSync(join(dir, name), "utf8"));
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const merge = (prefix) => Object.assign({}, ...files.filter((f) => f.startsWith(prefix)).map(read));
  return {
    chapters: read("chapters.json"),
    countries: read("countries.json"),
    topics: read("topics.json"),
    sections: merge("sections-"),
    rules: merge("rules-"),
    // Section bodies, added chapter by chapter: bodies-<chapter>.json → { "<section slug>": { ru, en } }
    bodies: Object.fromEntries(files.filter((f) => f.startsWith("bodies-")).map((f) => [f.slice(7, -5), read(f)])),
  };
}

const UZBEK_WORDS = /\b(va|uchun|bilan|bo‘yicha|kerak|qanday|emas)\b/;

/** Problems that must be fixed before importing (empty list = OK). */
export function validate(t) {
  const problems = [];
  const need = (value, where) => {
    if (typeof value !== "string" || !value.trim()) problems.push(`${where}: empty or missing`);
    else if (where.endsWith(".ru") && /[a-z]{3}/.test(value.replace(/\[[^\]]*\]|https?:\S+|\b[A-Z][\w-]*\b/g, "")) && UZBEK_WORDS.test(value)) {
      problems.push(`${where}: looks untranslated (Uzbek words in the Russian text)`);
    }
  };
  for (const [slug, v] of Object.entries(t.chapters)) for (const l of LANGS) { need(v[l]?.label, `chapters.${slug}.${l}.label`); need(v[l]?.title, `chapters.${slug}.${l}`); }
  for (const [code, v] of Object.entries(t.countries)) for (const l of LANGS) need(v[l], `countries.${code}.${l}`);
  for (const [src, v] of Object.entries(t.topics)) for (const l of LANGS) need(v[l], `topics.${src}.${l}`);
  for (const [ch, list] of Object.entries(t.sections)) for (const [slug, v] of Object.entries(list)) for (const l of LANGS) need(v[l], `sections.${ch}/${slug}.${l}`);
  for (const [ch, list] of Object.entries(t.bodies)) for (const [slug, v] of Object.entries(list)) for (const l of LANGS) need(v[l], `bodies.${ch}/${slug}.${l}`);
  for (const [id, v] of Object.entries(t.rules)) {
    if (!/^[0-9a-f-]{36}$/.test(id)) problems.push(`rules.${id}: not a uuid`);
    for (const l of LANGS) need(v[l], `rules.${id}.${l}`);
  }
  return problems;
}

export function summary(t) {
  const count = (o) => Object.values(o).reduce((n, list) => n + Object.keys(list).length, 0);
  return `chapters=${Object.keys(t.chapters).length} sections=${count(t.sections)} bodies=${count(t.bodies)} countries=${Object.keys(t.countries).length} topics=${Object.keys(t.topics).length} rules=${Object.keys(t.rules).length}`;
}

/** Flat rows, the shape kb_admin_i18n_import() reads with jsonb_to_recordset. */
export function toPayload(t) {
  return {
    chapters: Object.entries(t.chapters).flatMap(([slug, v]) => LANGS.map((lang) => ({ slug, lang, label: v[lang].label, title: v[lang].title }))),
    sections: Object.entries(t.sections).flatMap(([chapter_slug, list]) =>
      Object.entries(list).flatMap(([section_slug, v]) => LANGS.map((lang) => ({ chapter_slug, section_slug, lang, title: v[lang] })))
    ),
    bodies: Object.entries(t.bodies).flatMap(([chapter_slug, list]) =>
      Object.entries(list).flatMap(([section_slug, v]) => LANGS.map((lang) => ({ chapter_slug, section_slug, lang, content_md: v[lang] })))
    ),
    countries: Object.entries(t.countries).flatMap(([code, v]) => LANGS.map((lang) => ({ code, lang, name: v[lang] }))),
    topics: Object.entries(t.topics).flatMap(([src, v]) => LANGS.map((lang) => ({ src, lang, topic: v[lang] }))),
    rules: Object.entries(t.rules).flatMap(([rule_id, v]) => LANGS.map((lang) => ({ rule_id, lang, rule_text: v[lang] }))),
  };
}

const byCode = (list) => [...list].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

/**
 * The markdown skeleton a translated body must keep from the Uzbek original:
 * line and paragraph counts, headings, table rows, list items, ** markers,
 * [n] references, URLs and numbers. bodyShapeSql() computes the same values
 * for the Uzbek rows, so the two can be compared before an import.
 */
export function bodyShape(md) {
  return {
    lines: md.split("\n").length,
    paras: md.split("\n\n").length,
    headings: (md.match(/^#+ /gm) ?? []).length,
    table: (md.match(/^\|/gm) ?? []).length,
    list: (md.match(/^(\d+\.|-) /gm) ?? []).length,
    bold: md.split("**").length - 1,
    refs: byCode(md.match(/\[\d+\]/g) ?? []).join(","),
    urls: createHash("md5").update(byCode(md.match(/https?:\/\/\S+/g) ?? []).join(" ")).digest("hex"),
    digits: byCode(md.replace(/https?:\/\/\S+/g, "").match(/\d+/g) ?? []).join(","),
  };
}

export function bodyShapeSql(chapter) {
  if (!/^[a-z0-9-]+$/.test(chapter)) throw new Error(`bad chapter slug: ${chapter}`);
  return `select json_object_agg(s.slug, json_build_object(
  'lines', array_length(string_to_array(s.content_md, E'\\n'), 1),
  'paras', array_length(string_to_array(s.content_md, E'\\n\\n'), 1),
  'headings', (select count(*) from regexp_matches(s.content_md, '^#+ ', 'gn')),
  'table', (select count(*) from regexp_matches(s.content_md, '^\\|', 'gn')),
  'list', (select count(*) from regexp_matches(s.content_md, '^(\\d+\\.|-) ', 'gn')),
  'bold', (length(s.content_md) - length(replace(s.content_md, '**', ''))) / 2,
  'refs', coalesce((select string_agg(m[1], ',' order by m[1] collate "C") from regexp_matches(s.content_md, '(\\[\\d+\\])', 'g') m), ''),
  'urls', md5(coalesce((select string_agg(m[1], ' ' order by m[1] collate "C") from regexp_matches(s.content_md, '(https?://\\S+)', 'g') m), '')),
  'digits', coalesce((select string_agg(m[1], ',' order by m[1] collate "C") from regexp_matches(regexp_replace(s.content_md, 'https?://\\S+', '', 'g'), '(\\d+)', 'g') m), '')
) order by s.position)
from public.kb_sections s join public.kb_chapters c on c.id = s.chapter_id where c.slug = '${chapter}';`;
}

/** md5 of the sorted keys — compared with the same digest computed in SQL to prove every key exists. */
export function keyDigests(t) {
  const md5 = (keys) => createHash("md5").update(keys.sort().join("\n")).digest("hex");
  return {
    sections: md5(Object.entries(t.sections).flatMap(([ch, list]) => Object.keys(list).map((s) => `${ch}/${s}`))),
    rules: md5(Object.keys(t.rules)),
    chapters: md5(Object.keys(t.chapters)),
    countries: md5(Object.keys(t.countries)),
  };
}
