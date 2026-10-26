#!/usr/bin/env node
// One-off loader for the knowledge base, for a first import or a full
// re-import of a new edition. Day-to-day edits happen in /admin/knowledge.
//
// The app never holds a service-role key, so the import goes through a
// temporary SECURITY DEFINER function guarded by a one-time token:
//
//   1. node scripts/knowledge/import-book.mjs prepare <token-file>
//        → writes a random token to <token-file> and prints the SQL that
//          creates public.kb_admin_import() with that token's SHA-256.
//          Run that SQL in the Supabase SQL Editor.
//   2. node scripts/knowledge/import-book.mjs run <book.json> <token-file>
//        → uploads book, sources, chapters (with chunks), country rules,
//          then drives the kb-embed function until every chunk has an
//          embedding. Reads NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY from
//          .env.local; never prints them.
//   3. Run in the SQL Editor:  drop function public.kb_admin_import(text, text, jsonb);
//      and delete <token-file>.
//
// <book.json> comes from scripts/knowledge/parse-book.mjs.
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [mode, ...args] = process.argv.slice(2);

function importFunctionSql(hash) {
  return `create or replace function public.kb_admin_import(p_token text, p_kind text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_book uuid;
  v_chapter uuid;
  v_section uuid;
  v_rule uuid;
  s jsonb;
  r jsonb;
  n integer := 0;
begin
  if encode(sha256(convert_to(p_token, 'UTF8')), 'hex') <> '${hash}' then
    raise exception 'invalid import token' using errcode = '42501';
  end if;

  if p_kind = 'book' then
    insert into public.kb_books (slug, title, author, edition_date)
    values (p_payload->>'slug', p_payload->>'title', p_payload->>'author', (p_payload->>'edition_date')::date)
    on conflict (slug) do update
      set title = excluded.title, author = excluded.author, edition_date = excluded.edition_date
    returning id into v_book;
    return jsonb_build_object('book_id', v_book);

  elsif p_kind = 'sources' then
    insert into public.kb_sources (code, title, url, chapters)
    select e->>'code', e->>'title', e->>'url', array(select jsonb_array_elements_text(e->'chapters'))
    from jsonb_array_elements(p_payload) e
    on conflict (url) do update set code = excluded.code, title = excluded.title, chapters = excluded.chapters;
    get diagnostics n = row_count;
    return jsonb_build_object('sources', n);

  elsif p_kind = 'chapter' then
    select id into v_book from public.kb_books where slug = p_payload->>'book_slug';
    insert into public.kb_chapters (book_id, position, slug, kind, number, label, title, display_title)
    values (v_book, (p_payload->>'position')::integer, p_payload->>'slug', p_payload->>'kind',
            (p_payload->>'number')::integer, p_payload->>'label', p_payload->>'title', p_payload->>'display_title')
    on conflict (book_id, slug) do update
      set position = excluded.position, kind = excluded.kind, number = excluded.number,
          label = excluded.label, title = excluded.title, display_title = excluded.display_title
    returning id into v_chapter;
    for s in select * from jsonb_array_elements(p_payload->'sections') loop
      insert into public.kb_sections (chapter_id, position, slug, number, title, is_intro, content_md)
      values (v_chapter, (s->>'position')::integer, s->>'slug', s->>'number', s->>'title',
              (s->>'is_intro')::boolean, s->>'content_md')
      on conflict (chapter_id, slug) do update
        set position = excluded.position, number = excluded.number, title = excluded.title,
            is_intro = excluded.is_intro, content_md = excluded.content_md
      returning id into v_section;
      perform kb_private.apply_section_chunks(v_section, s->'chunks');
      n := n + 1;
    end loop;
    return jsonb_build_object('chapter_id', v_chapter, 'sections', n);

  elsif p_kind = 'rules' then
    for r in select * from jsonb_array_elements(p_payload) loop
      v_rule := null;
      insert into public.kb_country_rules (country_code, country_name, region, topic, rule_text, volatility,
                                           section_id, source_match, as_of, next_review_at)
      values (
        r->>'country_code', r->>'country_name', r->>'region', r->>'topic', r->>'rule_text', r->>'volatility',
        (select s2.id from public.kb_sections s2 join public.kb_chapters c on c.id = s2.chapter_id
          where c.slug = r->>'chapter_slug' and s2.slug = r->>'section_slug' limit 1),
        r->>'source_match', (r->>'as_of')::date,
        (r->>'as_of')::date + case r->>'volatility' when 'high' then 30 when 'medium' then 90 else 180 end
      )
      on conflict (country_code, topic, md5(rule_text)) do nothing
      returning id into v_rule;
      if v_rule is not null then
        insert into public.kb_rule_sources (rule_id, source_id)
        select v_rule, src.id from public.kb_sources src
        where src.url in (select jsonb_array_elements_text(r->'source_urls'))
        on conflict do nothing;
        n := n + 1;
      end if;
    end loop;
    return jsonb_build_object('rules', n);

  elsif p_kind = 'country_sections' then
    insert into public.kb_country_sections (country_code, section_id, anchor)
    select e->>'country_code', s2.id, e->>'anchor'
    from jsonb_array_elements(p_payload) e
    join public.kb_chapters c on c.slug = e->>'chapter_slug'
    join public.kb_sections s2 on s2.chapter_id = c.id and s2.slug = e->>'section_slug'
    on conflict do nothing;
    get diagnostics n = row_count;
    return jsonb_build_object('country_sections', n);
  end if;

  raise exception 'unknown import kind %', p_kind;
end;
$fn$;`;
}

function readEnv() {
  const env = {};
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing in .env.local");
  return { url, key };
}

async function post(url, key, path, body) {
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

if (mode === "prepare") {
  const [tokenFile] = args;
  if (!tokenFile) throw new Error("Usage: import-book.mjs prepare <token-file>");
  const token = randomBytes(32).toString("hex");
  writeFileSync(tokenFile, token, { mode: 0o600 });
  console.log(importFunctionSql(createHash("sha256").update(token).digest("hex")));
} else if (mode === "run") {
  const [bookPath, tokenFile] = args;
  if (!bookPath || !tokenFile) throw new Error("Usage: import-book.mjs run <book.json> <token-file>");
  const book = JSON.parse(readFileSync(bookPath, "utf8"));
  const token = readFileSync(tokenFile, "utf8").trim();
  const { url, key } = readEnv();
  const rpc = (kind, payload) => post(url, key, "/rest/v1/rpc/kb_admin_import", { p_token: token, p_kind: kind, p_payload: payload });

  console.log("book", await rpc("book", book.book));
  console.log("sources", await rpc("sources", book.sources));
  for (const ch of book.chapters) {
    const { sections, ...meta } = ch;
    const res = await rpc("chapter", { ...meta, book_slug: book.book.slug, sections });
    console.log(`chapter ${ch.slug}`, res);
  }
  const asOf = book.book.edition_date;
  console.log("rules", await rpc("rules", book.country_rules.map((r) => ({ ...r, as_of: asOf }))));
  console.log("country_sections", await rpc("country_sections", book.country_sections));

  await drainEmbeddings(url, key);
} else if (mode === "embed") {
  const { url, key } = readEnv();
  await drainEmbeddings(url, key);
} else {
  console.error("Usage: import-book.mjs prepare <token-file> | run <book.json> <token-file> | embed");
  process.exit(1);
}

// Calls kb-embed until every chunk has an embedding. The Edge Runtime caps
// CPU per request (HTTP 546 WORKER_RESOURCE_LIMIT), so the batch size halves
// on that error and creeps back up after successes.
async function drainEmbeddings(url, key) {
  let limit = 4;
  let remaining = Infinity;
  let calls = 0;
  let failures = 0;
  while (remaining > 0 && calls < 2000) {
    calls++;
    const res = await fetch(`${url}/functions/v1/kb-embed`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ limit, chain: false }),
    });
    if (!res.ok) {
      failures++;
      if (failures > 20) throw new Error(`kb-embed kept failing (last HTTP ${res.status})`);
      limit = Math.max(1, Math.floor(limit / 2));
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    const body = await res.json();
    remaining = body.remaining;
    if (calls % 10 === 0 && limit < 4) limit++;
    if (calls % 20 === 0 || remaining === 0) console.log(`embeddings: ${remaining} remaining (batch ${limit}, ${calls} calls, ${failures} retries)`);
  }
}
