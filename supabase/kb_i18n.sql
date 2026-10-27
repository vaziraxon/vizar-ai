-- =============================================================================
-- VIZAR AI — Russian and English for the "Viza ma'lumotlar bazasi" library
-- =============================================================================
-- Run AFTER supabase/kb_library_access.sql. Additive: the Uzbek book in
-- kb_chapters / kb_sections / kb_country_rules stays the source and is not
-- changed. Translations live in *_i18n tables keyed by the source row and a
-- language ('ru' | 'en'); anything missing falls back to Uzbek.
--
--   kb_chapter_i18n  — chapter label + title                     (public)
--   kb_section_i18n  — section title (+ body, filled chapter by chapter)
--   kb_country_i18n  — country names                             (public)
--   kb_rule_i18n     — country rule topic + text
--
-- Access mirrors the Uzbek tables: section bodies and rule texts are readable
-- only while public.kb_has_access() is true. Titles reach everyone through the
-- security-definer outline RPCs, which now take p_lang (default 'uz', so
-- existing callers keep working).
--
-- source_md5 records which Uzbek text a translation was made from, so editors
-- can find translations that are out of date after the book changes.
-- Translations are machine-made unless translated_by = 'human'.
-- Data: supabase/i18n/*.json → node scripts/knowledge/i18n-import.mjs
-- Rollback: supabase/kb_i18n_rollback.sql
-- =============================================================================

create table if not exists public.kb_chapter_i18n (
  chapter_id uuid not null references public.kb_chapters(id) on delete cascade,
  lang text not null check (lang in ('ru','en')),
  label text not null,
  display_title text not null,
  source_md5 text,
  translated_by text not null default 'ai' check (translated_by in ('ai','human')),
  updated_at timestamptz not null default now(),
  primary key (chapter_id, lang)
);

create table if not exists public.kb_section_i18n (
  section_id uuid not null references public.kb_sections(id) on delete cascade,
  lang text not null check (lang in ('ru','en')),
  title text not null,
  content_md text,
  title_source_md5 text,
  content_source_md5 text,
  translated_by text not null default 'ai' check (translated_by in ('ai','human')),
  updated_at timestamptz not null default now(),
  primary key (section_id, lang)
);

create table if not exists public.kb_country_i18n (
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  lang text not null check (lang in ('ru','en')),
  name text not null,
  updated_at timestamptz not null default now(),
  primary key (country_code, lang)
);

create table if not exists public.kb_rule_i18n (
  rule_id uuid not null references public.kb_country_rules(id) on delete cascade,
  lang text not null check (lang in ('ru','en')),
  topic text not null,
  rule_text text not null,
  source_md5 text,
  translated_by text not null default 'ai' check (translated_by in ('ai','human')),
  updated_at timestamptz not null default now(),
  primary key (rule_id, lang)
);

comment on table public.kb_section_i18n is
  'Russian/English section titles and (when translated) bodies. Bodies are paid content: readable only with kb_has_access().';

drop trigger if exists trg_kb_chapter_i18n_updated on public.kb_chapter_i18n;
create trigger trg_kb_chapter_i18n_updated before update on public.kb_chapter_i18n
  for each row execute function kb_private.touch_updated_at();
drop trigger if exists trg_kb_section_i18n_updated on public.kb_section_i18n;
create trigger trg_kb_section_i18n_updated before update on public.kb_section_i18n
  for each row execute function kb_private.touch_updated_at();
drop trigger if exists trg_kb_country_i18n_updated on public.kb_country_i18n;
create trigger trg_kb_country_i18n_updated before update on public.kb_country_i18n
  for each row execute function kb_private.touch_updated_at();
drop trigger if exists trg_kb_rule_i18n_updated on public.kb_rule_i18n;
create trigger trg_kb_rule_i18n_updated before update on public.kb_rule_i18n
  for each row execute function kb_private.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security — same rules as the Uzbek tables
-- -----------------------------------------------------------------------------
alter table public.kb_chapter_i18n enable row level security;
alter table public.kb_section_i18n enable row level security;
alter table public.kb_country_i18n enable row level security;
alter table public.kb_rule_i18n enable row level security;

drop policy if exists "kb_chapter_i18n_read" on public.kb_chapter_i18n;
create policy "kb_chapter_i18n_read" on public.kb_chapter_i18n for select to anon, authenticated
  using (
    (select public.kb_is_editor())
    or exists (select 1 from public.kb_chapters c where c.id = chapter_id and c.status = 'published')
  );

drop policy if exists "kb_section_i18n_read" on public.kb_section_i18n;
create policy "kb_section_i18n_read" on public.kb_section_i18n for select to anon, authenticated
  using (
    (select public.kb_is_editor())
    or (
      (select public.kb_has_access())
      and exists (
        select 1 from public.kb_sections s join public.kb_chapters c on c.id = s.chapter_id
        where s.id = section_id and s.status = 'published' and c.status = 'published')
    )
  );

drop policy if exists "kb_country_i18n_read" on public.kb_country_i18n;
create policy "kb_country_i18n_read" on public.kb_country_i18n for select to anon, authenticated using (true);

drop policy if exists "kb_rule_i18n_read" on public.kb_rule_i18n;
create policy "kb_rule_i18n_read" on public.kb_rule_i18n for select to anon, authenticated
  using ((select public.kb_has_access()));

-- Editors maintain translations; nobody else writes.
drop policy if exists "kb_chapter_i18n_write" on public.kb_chapter_i18n;
create policy "kb_chapter_i18n_write" on public.kb_chapter_i18n for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());
drop policy if exists "kb_section_i18n_write" on public.kb_section_i18n;
create policy "kb_section_i18n_write" on public.kb_section_i18n for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());
drop policy if exists "kb_country_i18n_write" on public.kb_country_i18n;
create policy "kb_country_i18n_write" on public.kb_country_i18n for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());
drop policy if exists "kb_rule_i18n_write" on public.kb_rule_i18n;
create policy "kb_rule_i18n_write" on public.kb_rule_i18n for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

-- -----------------------------------------------------------------------------
-- Outline RPCs with a language (never full text). Dropped first because the
-- signatures change; called without p_lang they behave exactly as before.
-- *_src columns keep the Uzbek original for emoji / flag matching.
-- -----------------------------------------------------------------------------
drop function if exists public.kb_library_outline();
create or replace function public.kb_library_outline(p_lang text default 'uz')
returns table (
  chapter_slug text,
  chapter_position integer,
  chapter_kind text,
  chapter_number integer,
  chapter_label text,
  chapter_title text,
  section_slug text,
  section_position integer,
  section_number text,
  section_title text,
  section_title_src text,
  is_intro boolean,
  char_count integer,
  body_translated boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.slug, c.position, c.kind, c.number,
         coalesce(ci.label, c.label), coalesce(ci.display_title, c.display_title),
         s.slug, s.position, s.number, coalesce(si.title, s.title), s.title, s.is_intro,
         coalesce(length(si.content_md), length(s.content_md)),
         si.content_md is not null
  from public.kb_chapters c
  join public.kb_sections s on s.chapter_id = c.id
  left join public.kb_chapter_i18n ci on ci.chapter_id = c.id and ci.lang = p_lang
  left join public.kb_section_i18n si on si.section_id = s.id and si.lang = p_lang
  where c.status = 'published' and s.status = 'published'
  order by c.position, s.position;
$$;
revoke all on function public.kb_library_outline(text) from public;
grant execute on function public.kb_library_outline(text) to anon, authenticated;

drop function if exists public.kb_section_preview(text, text);
create or replace function public.kb_section_preview(p_chapter_slug text, p_section_slug text, p_lang text default 'uz')
returns table (
  chapter_slug text,
  chapter_kind text,
  chapter_label text,
  chapter_title text,
  section_id uuid,
  section_slug text,
  section_number text,
  section_title text,
  section_title_src text,
  is_intro boolean,
  char_count integer,
  preview text,
  body_lang text,
  prev_slug text,
  prev_title text,
  next_slug text,
  next_title text
)
language sql
stable
security definer
set search_path = ''
as $$
  with ordered as (
    select c.slug as chapter_slug, c.kind,
           coalesce(ci.label, c.label) as label, coalesce(ci.display_title, c.display_title) as display_title,
           s.id, s.slug, s.number, coalesce(si.title, s.title) as title, s.title as title_src, s.is_intro,
           coalesce(si.content_md, s.content_md) as content_md,
           case when si.content_md is not null then p_lang else 'uz' end as body_lang,
           lag(s.slug) over w as prev_slug, lag(coalesce(s.number || '. ', '') || coalesce(si.title, s.title)) over w as prev_title,
           lead(s.slug) over w as next_slug, lead(coalesce(s.number || '. ', '') || coalesce(si.title, s.title)) over w as next_title
    from public.kb_chapters c
    join public.kb_sections s on s.chapter_id = c.id
    left join public.kb_chapter_i18n ci on ci.chapter_id = c.id and ci.lang = p_lang
    left join public.kb_section_i18n si on si.section_id = s.id and si.lang = p_lang
    where c.slug = p_chapter_slug and c.status = 'published' and s.status = 'published'
    window w as (order by s.position)
  )
  select o.chapter_slug, o.kind, o.label, o.display_title, o.id, o.slug, o.number, o.title, o.title_src, o.is_intro,
         length(o.content_md),
         left(btrim(regexp_replace(regexp_replace(regexp_replace(o.content_md,
               '^(\|.*|#{1,6} .*)$', '', 'gn'), '[*>]', '', 'g'), '\s+', ' ', 'g')), 320),
         o.body_lang, o.prev_slug, o.prev_title, o.next_slug, o.next_title
  from ordered o
  where o.slug = p_section_slug;
$$;
revoke all on function public.kb_section_preview(text, text, text) from public;
grant execute on function public.kb_section_preview(text, text, text) to anon, authenticated;

-- topics stays the Uzbek text[] (for emoji, and for code deployed before this
-- migration); topic_labels holds the same topics in p_lang, in the same order.
drop function if exists public.kb_library_countries();
create or replace function public.kb_library_countries(p_lang text default 'uz')
returns table (
  country_code text,
  country_name text,
  country_name_src text,
  region text,
  rule_count integer,
  topics text[],
  topic_labels text[],
  needs_review integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with rules as (
    select r.country_code, r.country_name, r.region, r.topic, r.status, ri.topic as topic_t
    from public.kb_country_rules r
    left join public.kb_rule_i18n ri on ri.rule_id = r.id and ri.lang = p_lang
    where r.status <> 'outdated'
  ),
  topics as (
    select country_code, topic, min(topic_t) as topic_t from rules group by country_code, topic
  )
  select r.country_code, coalesce(min(n.name), min(r.country_name)), min(r.country_name), min(r.region), count(*)::integer,
         (select array_agg(t.topic order by t.topic) from topics t where t.country_code = r.country_code),
         (select array_agg(coalesce(t.topic_t, t.topic) order by t.topic) from topics t where t.country_code = r.country_code),
         (count(*) filter (where r.status = 'needs_review'))::integer
  from rules r
  left join public.kb_country_i18n n on n.country_code = r.country_code and n.lang = p_lang
  group by r.country_code
  order by min(r.region), min(r.country_name);
$$;
revoke all on function public.kb_library_countries(text) from public;
grant execute on function public.kb_library_countries(text) to anon, authenticated;

drop function if exists public.kb_country_outline(text);
create or replace function public.kb_country_outline(p_country_code text, p_lang text default 'uz')
returns table (
  chapter_slug text,
  chapter_label text,
  section_slug text,
  section_number text,
  section_title text,
  section_title_src text,
  anchor text
)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct c.slug, coalesce(ci.label, c.label), s.slug, s.number, coalesce(si.title, s.title), s.title, cs.anchor
  from public.kb_country_sections cs
  join public.kb_sections s on s.id = cs.section_id and s.status = 'published'
  join public.kb_chapters c on c.id = s.chapter_id and c.status = 'published'
  left join public.kb_chapter_i18n ci on ci.chapter_id = c.id and ci.lang = p_lang
  left join public.kb_section_i18n si on si.section_id = s.id and si.lang = p_lang
  where cs.country_code = upper(p_country_code)
  order by c.slug, s.number;
$$;
revoke all on function public.kb_country_outline(text, text) from public;
grant execute on function public.kb_country_outline(text, text) to anon, authenticated;

-- How much is translated, per language (counts only).
create or replace function public.kb_i18n_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_object_agg(l.lang, jsonb_build_object(
    'chapters', (select count(*) from public.kb_chapter_i18n where lang = l.lang),
    'section_titles', (select count(*) from public.kb_section_i18n where lang = l.lang),
    'section_bodies', (select count(*) from public.kb_section_i18n where lang = l.lang and content_md is not null),
    'countries', (select count(*) from public.kb_country_i18n where lang = l.lang),
    'rules', (select count(*) from public.kb_rule_i18n where lang = l.lang)
  ))
  from (values ('ru'), ('en')) l(lang);
$$;
revoke all on function public.kb_i18n_stats() from public;
grant execute on function public.kb_i18n_stats() to anon, authenticated;
