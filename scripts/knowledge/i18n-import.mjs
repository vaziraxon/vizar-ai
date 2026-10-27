#!/usr/bin/env node
// Loads the knowledge-base translations (supabase/i18n/*.json) into the
// *_i18n tables from supabase/kb_i18n.sql — the same token-guarded pattern
// as import-book.mjs, so the data never has to be pasted into the SQL Editor:
//
//   node scripts/knowledge/i18n-import.mjs check            # validate the JSON
//   node scripts/knowledge/i18n-import.mjs digests          # key digests (compare with the SQL below)
//   node scripts/knowledge/i18n-import.mjs shapes bob-1     # prints SQL: markdown skeleton of the Uzbek bodies
//   node scripts/knowledge/i18n-import.mjs shapes bob-1 uz.json  # compares that SQL result with bodies-bob-1.json
//   node scripts/knowledge/i18n-import.mjs prepare token.txt  # prints SQL: temporary import function
//   node scripts/knowledge/i18n-import.mjs run token.txt [bodies[:bob-2]]  # posts the JSON (one transaction); optionally one part / one chapter
//   node scripts/knowledge/i18n-import.mjs cleanup          # prints SQL: drop the function
//
// Run "prepare" output in the SQL Editor, then "run", then "cleanup", and
// delete token.txt. Uzbek source rows are never modified; existing section
// bodies are only replaced when bodies-*.json contains them.
import { randomBytes, createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { bodyShape, bodyShapeSql, keyDigests, LANGS, loadTranslations, summary, toPayload, validate } from "./i18n-data.mjs";

const [mode, tokenFile, only] = process.argv.slice(2);
const t = loadTranslations();
const problems = validate(t);
if (problems.length) {
  console.error(`${problems.join("\n")}\n\n${problems.length} problem(s)`);
  process.exit(1);
}

if (mode === "check") {
  console.log(`OK ${summary(t)}`);
} else if (mode === "digests") {
  const d = keyDigests(t);
  console.log(JSON.stringify(d, null, 2));
  console.log(`-- In SQL, these must match:
select md5(string_agg(c.slug || '/' || s.slug, E'\\n' order by c.slug || '/' || s.slug collate "C")) sections
  from public.kb_sections s join public.kb_chapters c on c.id = s.chapter_id;
select md5(string_agg(id::text, E'\\n' order by id::text collate "C")) rules from public.kb_country_rules;
select md5(string_agg(slug, E'\\n' order by slug collate "C")) chapters from public.kb_chapters;
select md5(string_agg(cc, E'\\n' order by cc collate "C")) countries from (select distinct country_code cc from public.kb_country_rules) x;`);
} else if (mode === "shapes") {
  const [chapter, uzFile] = [tokenFile, only];
  if (!chapter) throw new Error("usage: shapes <chapter> [uz shapes json]");
  if (!uzFile) {
    console.log(bodyShapeSql(chapter));
  } else {
    const uz = JSON.parse(readFileSync(uzFile, "utf8"));
    const bodies = t.bodies[chapter] ?? {};
    const diffs = [];
    for (const slug of new Set([...Object.keys(uz), ...Object.keys(bodies)])) {
      if (!uz[slug] || !bodies[slug]) { diffs.push(`${slug}: missing on one side`); continue; }
      for (const lang of LANGS) {
        const got = bodyShape(bodies[slug][lang]);
        for (const [k, want] of Object.entries(uz[slug])) if (String(got[k]) !== String(want)) diffs.push(`${slug}.${lang} ${k}: uz=${want} ${lang}=${got[k]}`);
      }
    }
    console.log(diffs.length ? `${diffs.join("\n")}\n\n${diffs.length} difference(s)` : `OK ${Object.keys(uz).length} sections keep the Uzbek structure`);
    if (diffs.length) process.exit(1);
  }
} else if (mode === "prepare") {
  if (!tokenFile) throw new Error("usage: prepare <token file>");
  const token = randomBytes(32).toString("hex");
  writeFileSync(tokenFile, token);
  const hash = createHash("md5").update(token).digest("hex");
  console.log(`-- Temporary: drop it with "cleanup" right after the import.
create or replace function public.kb_admin_i18n_import(p_token text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  n_chapters integer; n_sections integer; n_bodies integer; n_countries integer; n_rules integer;
begin
  if md5(coalesce(p_token, '')) <> '${hash}' then
    raise exception 'forbidden';
  end if;

  insert into public.kb_chapter_i18n (chapter_id, lang, label, display_title, source_md5)
  select c.id, v.lang, v.label, v.title, md5(c.display_title)
  from jsonb_to_recordset(coalesce(p_payload->'chapters', '[]')) v(slug text, lang text, label text, title text)
  join public.kb_chapters c on c.slug = v.slug
  on conflict (chapter_id, lang) do update
    set label = excluded.label, display_title = excluded.display_title, source_md5 = excluded.source_md5;
  get diagnostics n_chapters = row_count;

  insert into public.kb_section_i18n (section_id, lang, title, title_source_md5)
  select s.id, v.lang, v.title, md5(s.title)
  from jsonb_to_recordset(coalesce(p_payload->'sections', '[]')) v(chapter_slug text, section_slug text, lang text, title text)
  join public.kb_chapters c on c.slug = v.chapter_slug
  join public.kb_sections s on s.chapter_id = c.id and s.slug = v.section_slug
  on conflict (section_id, lang) do update
    set title = excluded.title, title_source_md5 = excluded.title_source_md5;
  get diagnostics n_sections = row_count;

  update public.kb_section_i18n si
     set content_md = v.content_md, content_source_md5 = md5(s.content_md)
  from jsonb_to_recordset(coalesce(p_payload->'bodies', '[]')) v(chapter_slug text, section_slug text, lang text, content_md text)
  join public.kb_chapters c on c.slug = v.chapter_slug
  join public.kb_sections s on s.chapter_id = c.id and s.slug = v.section_slug
  where si.section_id = s.id and si.lang = v.lang;
  get diagnostics n_bodies = row_count;

  insert into public.kb_country_i18n (country_code, lang, name)
  select v.code, v.lang, v.name
  from jsonb_to_recordset(coalesce(p_payload->'countries', '[]')) v(code text, lang text, name text)
  on conflict (country_code, lang) do update set name = excluded.name;
  get diagnostics n_countries = row_count;

  insert into public.kb_rule_i18n (rule_id, lang, topic, rule_text, source_md5)
  select r.id, v.lang, coalesce(tp.topic, r.topic), v.rule_text, md5(r.rule_text)
  from jsonb_to_recordset(coalesce(p_payload->'rules', '[]')) v(rule_id uuid, lang text, rule_text text)
  join public.kb_country_rules r on r.id = v.rule_id
  left join jsonb_to_recordset(coalesce(p_payload->'topics', '[]')) tp(src text, lang text, topic text)
    on tp.src = r.topic and tp.lang = v.lang
  on conflict (rule_id, lang) do update
    set topic = excluded.topic, rule_text = excluded.rule_text, source_md5 = excluded.source_md5;
  get diagnostics n_rules = row_count;

  return jsonb_build_object('chapters', n_chapters, 'sections', n_sections, 'bodies', n_bodies,
                            'countries', n_countries, 'rules', n_rules);
end;
$$;
revoke all on function public.kb_admin_i18n_import(text, jsonb) from public;
grant execute on function public.kb_admin_i18n_import(text, jsonb) to anon, authenticated;`);
} else if (mode === "run") {
  if (!tokenFile) throw new Error("usage: run <token file>");
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")])
  );
  const full = toPayload(t);
  const [part, chapter] = (only ?? "").split(":");
  if (only && !(part in full)) throw new Error(`run: unknown part "${part}" (one of ${Object.keys(full).join(", ")})`);
  // A part alone (e.g. "bodies:bob-2" for a newly translated chapter) leaves the other tables and chapters untouched.
  const payload = only ? { [part]: chapter ? full[part].filter((row) => row.chapter_slug === chapter) : full[part] } : full;
  if (chapter && !payload[part].length) throw new Error(`run: no ${part} rows for chapter "${chapter}"`);
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/kb_admin_i18n_import`, {
    method: "POST",
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ p_token: readFileSync(tokenFile, "utf8").trim(), p_payload: payload }),
  });
  const body = await res.text();
  console.log(`HTTP ${res.status}: ${body}`);
  const expected = Object.fromEntries(Object.entries(payload).map(([k, rows]) => [k, rows.length]));
  console.log(`sent: ${JSON.stringify(expected)}`);
  if (!res.ok) process.exit(1);
} else if (mode === "cleanup") {
  console.log("drop function if exists public.kb_admin_i18n_import(text, jsonb);");
} else {
  console.error("usage: i18n-import.mjs check | digests | shapes <chapter> [uz.json] | prepare <token> | run <token> [part] | cleanup");
  process.exit(2);
}
