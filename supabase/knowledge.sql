-- =============================================================================
-- VIZAR AI — AI Knowledge Base (book RAG), country visa rules, source checks
-- =============================================================================
-- Run AFTER supabase/schema.sql. Purely additive: it only creates kb_*
-- objects, the kb_private schema and two cron jobs. It never alters, drops
-- or rewrites existing tables, auth users or storage.
--
-- Data model
--   kb_books → kb_chapters → kb_sections (full Markdown text, revisioned)
--                               └→ kb_chunks (retrieval chunks + gte-small
--                                  embeddings + full-text vector)
--   kb_sources        official pages the book cites, with change detection
--   kb_country_rules  per-country rules lifted verbatim from the book,
--                     linked to sources (kb_rule_sources) and re-review state
--   kb_country_sections  country → detailed book sections
--
-- Who can do what (RLS)
--   * Anyone (anon + authenticated) can read PUBLISHED knowledge-base rows.
--     To restrict the book to signed-in users, change `to anon, authenticated`
--     to `to authenticated` in the *_read policies below.
--   * Writes require a knowledge-base editor: a confirmed account whose email
--     is listed in kb_editors (managed from the SQL Editor only).
--   * Edge Functions (kb-embed, kb-search, kb-verify-sources) run on the
--     Supabase side with the platform-provided service role; the Next.js app
--     itself still never holds a service-role key.
-- =============================================================================

create extension if not exists vector with schema extensions;
-- pg_net's functions live in its own `net` schema; pg_cron creates `cron`.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create schema if not exists kb_private;
revoke all on schema kb_private from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

-- Uzbek text uses several apostrophe variants (o‘, g‘, ʼ). Strip them all so
-- "to‘g‘ri", "to'g'ri" and "togri" index and search identically.
create or replace function public.kb_normalize(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(translate(coalesce(t, ''), '‘’ʻʼ''`´', ''));
$$;

create or replace function kb_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Project-specific settings (e.g. the Edge Functions base URL used by the
-- embedding trigger and cron jobs). Not exposed through the API.
create table if not exists kb_private.settings (
  key text primary key,
  value text not null
);

-- -----------------------------------------------------------------------------
-- Editors
-- -----------------------------------------------------------------------------
create table if not exists public.kb_editors (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.kb_editors enable row level security;
-- No policies on purpose: rows are added in the SQL Editor, e.g.
--   insert into public.kb_editors (email) values ('editor@example.com');

comment on table public.kb_editors is
  'Emails allowed to edit the knowledge base. Managed from the SQL Editor only.';

create or replace function public.kb_is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.kb_editors e
    join auth.users u on lower(u.email) = e.email
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.kb_is_editor() from public;
grant execute on function public.kb_is_editor() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Book structure
-- -----------------------------------------------------------------------------
create table if not exists public.kb_books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text,
  edition_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kb_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.kb_books(id) on delete cascade,
  position integer not null,
  slug text not null,
  kind text not null default 'chapter'
    check (kind in ('front','intro','chapter','conclusion','appendix','sources','editorial')),
  number integer,
  label text not null,
  title text not null,
  display_title text not null,
  status text not null default 'published' check (status in ('draft','published','archived')),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, slug)
);
create index if not exists idx_kb_chapters_book on public.kb_chapters(book_id, position);

create table if not exists public.kb_sections (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.kb_chapters(id) on delete cascade,
  position integer not null,
  slug text not null,
  number text,
  title text not null,
  is_intro boolean not null default false,
  content_md text not null default '',
  status text not null default 'published' check (status in ('draft','published','archived')),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chapter_id, slug)
);
create index if not exists idx_kb_sections_chapter on public.kb_sections(chapter_id, position);

comment on column public.kb_sections.content_md is
  'Full, unabridged section text as Markdown (### subheadings, lists, GFM tables). Source of truth for kb_chunks.';

-- Every edit keeps the previous version, so nothing typed into the admin
-- editor can be lost.
create table if not exists public.kb_section_revisions (
  id bigint generated always as identity primary key,
  section_id uuid not null references public.kb_sections(id) on delete cascade,
  number text,
  title text not null,
  content_md text not null,
  edited_by uuid references auth.users(id) on delete set null,
  edited_at timestamptz not null default now()
);
create index if not exists idx_kb_section_revisions_section on public.kb_section_revisions(section_id, edited_at desc);

create or replace function kb_private.keep_section_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.content_md is distinct from new.content_md
     or old.title is distinct from new.title
     or old.number is distinct from new.number then
    insert into public.kb_section_revisions (section_id, number, title, content_md, edited_by)
    values (old.id, old.number, old.title, old.content_md, auth.uid());
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Retrieval chunks
-- -----------------------------------------------------------------------------
create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.kb_sections(id) on delete cascade,
  chunk_index integer not null,
  heading_path text not null,
  content text not null,
  content_hash text generated always as (md5(heading_path || E'\n\n' || content)) stored,
  -- gte-small (Supabase Edge Runtime built-in), 384 dims, normalized.
  embedding extensions.vector(384),
  embedded_at timestamptz,
  fts tsvector generated always as (
    to_tsvector('simple', public.kb_normalize(heading_path || ' ' || content))
  ) stored,
  created_at timestamptz not null default now()
);
create index if not exists idx_kb_chunks_section on public.kb_chunks(section_id, chunk_index);
create index if not exists idx_kb_chunks_fts on public.kb_chunks using gin (fts);
create index if not exists idx_kb_chunks_embedding on public.kb_chunks
  using hnsw (embedding extensions.vector_ip_ops);
create index if not exists idx_kb_chunks_pending on public.kb_chunks(created_at) where embedding is null;

-- -----------------------------------------------------------------------------
-- Official sources and change detection
-- -----------------------------------------------------------------------------
create table if not exists public.kb_sources (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  title text not null,
  url text not null unique,
  chapters text[] not null default '{}',
  check_status text not null default 'pending'
    check (check_status in ('pending','ok','changed','unreachable','error')),
  last_checked_at timestamptz,
  last_http_status integer,
  last_content_hash text,
  last_changed_at timestamptz,
  last_text text,
  check_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.kb_sources.last_text is
  'Normalized visible text of the page at the last check (truncated), kept so editors can see what changed.';

create table if not exists public.kb_source_checks (
  id bigint generated always as identity primary key,
  source_id uuid not null references public.kb_sources(id) on delete cascade,
  checked_at timestamptz not null default now(),
  http_status integer,
  content_hash text,
  changed boolean not null default false,
  previous_text text,
  error text
);
create index if not exists idx_kb_source_checks_source on public.kb_source_checks(source_id, checked_at desc);

-- -----------------------------------------------------------------------------
-- Country visa rules
-- -----------------------------------------------------------------------------
create table if not exists public.kb_country_rules (
  id uuid primary key default gen_random_uuid(),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  country_name text not null,
  region text not null
    check (region in ('schengen','europe_other','americas_oceania','asia_middle_east','general')),
  topic text not null,
  rule_text text not null,
  volatility text not null default 'medium' check (volatility in ('low','medium','high')),
  section_id uuid references public.kb_sections(id) on delete set null,
  source_match text not null default 'none' check (source_match in ('explicit','inferred','manual','none')),
  -- Date the book states the rule was checked on.
  as_of date,
  status text not null default 'unverified'
    check (status in ('unverified','verified','needs_review','outdated')),
  last_verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  review_note text,
  next_review_at timestamptz,
  fts tsvector generated always as (
    to_tsvector('simple', public.kb_normalize(country_name || ' ' || topic || ' ' || rule_text))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_kb_country_rules_country on public.kb_country_rules(country_code);
create index if not exists idx_kb_country_rules_status on public.kb_country_rules(status, next_review_at);
create index if not exists idx_kb_country_rules_fts on public.kb_country_rules using gin (fts);
create unique index if not exists uq_kb_country_rules_text
  on public.kb_country_rules(country_code, topic, md5(rule_text));

comment on table public.kb_country_rules is
  'Country-level visa rules quoted from the book. Volatile facts (fees, where to apply, entry regimes) must be re-checked against kb_sources before being relied on.';

create table if not exists public.kb_rule_sources (
  rule_id uuid not null references public.kb_country_rules(id) on delete cascade,
  source_id uuid not null references public.kb_sources(id) on delete cascade,
  primary key (rule_id, source_id)
);
create index if not exists idx_kb_rule_sources_source on public.kb_rule_sources(source_id);

create table if not exists public.kb_country_sections (
  id bigint generated always as identity primary key,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  section_id uuid not null references public.kb_sections(id) on delete cascade,
  anchor text
);
create unique index if not exists uq_kb_country_sections
  on public.kb_country_sections(country_code, section_id, coalesce(anchor, ''));

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
drop trigger if exists trg_kb_books_updated on public.kb_books;
create trigger trg_kb_books_updated before update on public.kb_books
  for each row execute function kb_private.touch_updated_at();
drop trigger if exists trg_kb_chapters_updated on public.kb_chapters;
create trigger trg_kb_chapters_updated before update on public.kb_chapters
  for each row execute function kb_private.touch_updated_at();
drop trigger if exists trg_kb_sections_updated on public.kb_sections;
create trigger trg_kb_sections_updated before update on public.kb_sections
  for each row execute function kb_private.touch_updated_at();
drop trigger if exists trg_kb_sections_revision on public.kb_sections;
create trigger trg_kb_sections_revision before update on public.kb_sections
  for each row execute function kb_private.keep_section_revision();
drop trigger if exists trg_kb_sources_updated on public.kb_sources;
create trigger trg_kb_sources_updated before update on public.kb_sources
  for each row execute function kb_private.touch_updated_at();
drop trigger if exists trg_kb_country_rules_updated on public.kb_country_rules;
create trigger trg_kb_country_rules_updated before update on public.kb_country_rules
  for each row execute function kb_private.touch_updated_at();

-- New chunks → ask the kb-embed Edge Function to fill embeddings right away
-- (the cron job below is the safety net if this request is lost).
create or replace function kb_private.request_embeddings()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text := (select value from kb_private.settings where key = 'functions_url');
begin
  if base is null then
    return;
  end if;
  if exists (select 1 from public.kb_chunks where embedding is null) then
    perform net.http_post(url := base || '/kb-embed', body := '{}'::jsonb);
  end if;
end;
$$;

create or replace function kb_private.after_chunks_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform kb_private.request_embeddings();
  return null;
end;
$$;

drop trigger if exists trg_kb_chunks_embed on public.kb_chunks;
create trigger trg_kb_chunks_embed after insert on public.kb_chunks
  for each statement execute function kb_private.after_chunks_insert();

create or replace function kb_private.request_source_checks()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text := (select value from kb_private.settings where key = 'functions_url');
begin
  if base is not null then
    perform net.http_post(url := base || '/kb-verify-sources', body := '{}'::jsonb, timeout_milliseconds := 60000);
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Chunk replacement (keeps embeddings of unchanged chunks)
-- -----------------------------------------------------------------------------
create or replace function kb_private.apply_section_chunks(p_section_id uuid, p_chunks jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  with incoming as (
    select (e->>'chunkIndex')::integer as chunk_index,
           e->>'headingPath' as heading_path,
           e->>'content' as content,
           md5((e->>'headingPath') || E'\n\n' || (e->>'content')) as content_hash
    from jsonb_array_elements(p_chunks) e
  )
  delete from public.kb_chunks c
  where c.section_id = p_section_id
    and not exists (select 1 from incoming i where i.content_hash = c.content_hash);

  with incoming as (
    select (e->>'chunkIndex')::integer as chunk_index,
           md5((e->>'headingPath') || E'\n\n' || (e->>'content')) as content_hash
    from jsonb_array_elements(p_chunks) e
  )
  update public.kb_chunks c
  set chunk_index = i.chunk_index
  from incoming i
  where c.section_id = p_section_id and c.content_hash = i.content_hash;

  insert into public.kb_chunks (section_id, chunk_index, heading_path, content)
  select p_section_id, (e->>'chunkIndex')::integer, e->>'headingPath', e->>'content'
  from jsonb_array_elements(p_chunks) e
  where not exists (
    select 1 from public.kb_chunks c
    where c.section_id = p_section_id
      and c.content_hash = md5((e->>'headingPath') || E'\n\n' || (e->>'content'))
  );

  select count(*) into n from public.kb_chunks where section_id = p_section_id;
  return n;
end;
$$;
revoke all on function kb_private.apply_section_chunks(uuid, jsonb) from public;

-- Called by the admin editor after saving a section.
create or replace function public.kb_replace_section_chunks(p_section_id uuid, p_chunks jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.kb_is_editor() then
    raise exception 'Knowledge-base editor access required' using errcode = '42501';
  end if;
  return kb_private.apply_section_chunks(p_section_id, p_chunks);
end;
$$;
revoke all on function public.kb_replace_section_chunks(uuid, jsonb) from public, anon;
grant execute on function public.kb_replace_section_chunks(uuid, jsonb) to authenticated;

-- -----------------------------------------------------------------------------
-- Search
-- -----------------------------------------------------------------------------
-- Hybrid retrieval: full-text (prefix-matched, apostrophe-normalized terms)
-- and vector similarity, merged with Reciprocal Rank Fusion. Full-text hits
-- are ranked by the summed IDF of the distinct query terms they contain
-- (doubled when the term is in the heading path), so a passage mentioning
-- the rare terms "Kanada" and "biometrika" beats one that repeats the
-- ubiquitous "viza" many times.
create or replace function public.kb_search(
  query_terms text[],
  query_embedding extensions.vector(384) default null,
  match_count integer default 8,
  full_text_weight double precision default 1.0,
  semantic_weight double precision default 1.0,
  rrf_k integer default 50
)
returns table (
  chunk_id uuid,
  chapter_slug text,
  chapter_label text,
  chapter_title text,
  section_id uuid,
  section_slug text,
  section_number text,
  section_title text,
  heading_path text,
  content text,
  full_text_rank integer,
  semantic_rank integer,
  similarity double precision,
  score double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with raw_terms as (
    select distinct to_tsquery('simple', quote_literal(public.kb_normalize(t)) || ':*') as tq,
                    quote_literal(public.kb_normalize(t)) || ':*' as tq_text
    from unnest(query_terms) t
    where length(public.kb_normalize(t)) > 1
  ),
  terms as (
    select rt.tq, rt.tq_text,
           ln((select count(*) from public.kb_chunks)::double precision
              / greatest(1, (select count(*) from public.kb_chunks c where c.fts @@ rt.tq))) as idf
    from raw_terms rt
  ),
  q as (
    select case when exists (select 1 from terms)
      then to_tsquery('simple', (select string_agg(tq_text, ' | ') from terms))
    end as tsq
  ),
  full_text as (
    select c.id,
           row_number() over (
             -- A term that also appears in the chapter/section/subheading path counts double.
             order by (
               select sum(idf * case when to_tsvector('simple', public.kb_normalize(c.heading_path)) @@ terms.tq then 2 else 1 end)
               from terms where c.fts @@ terms.tq
             ) desc,
             ts_rank_cd(c.fts, q.tsq, 32) desc
           )::integer as rank_ix
    from public.kb_chunks c, q
    where q.tsq is not null and c.fts @@ q.tsq
    order by rank_ix
    limit least(greatest(match_count, 1), 30) * 3
  ),
  semantic as (
    select c.id,
           row_number() over (order by c.embedding <#> query_embedding)::integer as rank_ix,
           -(c.embedding <#> query_embedding) as similarity
    from public.kb_chunks c
    where query_embedding is not null and c.embedding is not null
    order by c.embedding <#> query_embedding
    limit least(greatest(match_count, 1), 30) * 3
  )
  select c.id, ch.slug, ch.label, ch.display_title, s.id, s.slug, s.number, s.title,
         c.heading_path, c.content,
         ft.rank_ix, se.rank_ix, se.similarity,
         coalesce(1.0 / (rrf_k + ft.rank_ix), 0.0) * full_text_weight
           + coalesce(1.0 / (rrf_k + se.rank_ix), 0.0) * semantic_weight as score
  from full_text ft
  full outer join semantic se on se.id = ft.id
  join public.kb_chunks c on c.id = coalesce(ft.id, se.id)
  join public.kb_sections s on s.id = c.section_id and s.status = 'published'
  join public.kb_chapters ch on ch.id = s.chapter_id and ch.status = 'published'
  order by score desc
  limit least(greatest(match_count, 1), 30);
$$;
grant execute on function public.kb_search(text[], extensions.vector, integer, double precision, double precision, integer)
  to anon, authenticated;

-- Country rules relevant to a question: rules for countries named in it
-- first, then full-text matches. Includes sources and review state so the
-- assistant can say how fresh each rule is.
create or replace function public.kb_search_rules(
  query_text text,
  query_terms text[],
  match_count integer default 6
)
returns table (
  rule_id uuid,
  country_code text,
  country_name text,
  topic text,
  rule_text text,
  volatility text,
  status text,
  as_of date,
  last_verified_at timestamptz,
  next_review_at timestamptz,
  section_slug text,
  chapter_slug text,
  sources jsonb,
  country_hit boolean,
  rank real
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with q as (
    select public.kb_normalize(query_text) as qn,
      case
        when coalesce(array_length(query_terms, 1), 0) = 0 then null
        else to_tsquery('simple', (
          select string_agg(quote_literal(public.kb_normalize(t)) || ':*', ' | ')
          from unnest(query_terms) t
          where length(public.kb_normalize(t)) > 1
        ))
      end as tsq
  ),
  scored as (
    select r.*,
           (q.qn ~ ('\m' || public.kb_normalize(r.country_name))) as hit,
           coalesce(ts_rank_cd(r.fts, q.tsq, 32), 0)::real as rk
    from public.kb_country_rules r, q
    where r.status <> 'outdated'
      and ((q.qn ~ ('\m' || public.kb_normalize(r.country_name))) or (q.tsq is not null and r.fts @@ q.tsq))
  )
  select sc.id, sc.country_code, sc.country_name, sc.topic, sc.rule_text, sc.volatility, sc.status,
         sc.as_of, sc.last_verified_at, sc.next_review_at, s.slug, ch.slug,
         coalesce((
           select jsonb_agg(jsonb_build_object('title', src.title, 'url', src.url, 'check_status', src.check_status,
                                               'last_checked_at', src.last_checked_at) order by src.code)
           from public.kb_rule_sources rs join public.kb_sources src on src.id = rs.source_id
           where rs.rule_id = sc.id
         ), '[]'::jsonb),
         sc.hit, sc.rk
  from scored sc
  left join public.kb_sections s on s.id = sc.section_id
  left join public.kb_chapters ch on ch.id = s.chapter_id
  order by sc.hit desc, sc.rk desc, sc.country_code, sc.topic
  limit least(greatest(match_count, 1), 20);
$$;
grant execute on function public.kb_search_rules(text, text[], integer) to anon, authenticated;

create or replace function public.kb_stats()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'books', (select count(*) from public.kb_books),
    'chapters', (select count(*) from public.kb_chapters),
    'sections', (select count(*) from public.kb_sections),
    'chunks', (select count(*) from public.kb_chunks),
    'chunks_embedded', (select count(*) from public.kb_chunks where embedding is not null),
    'content_chars', (select coalesce(sum(length(content_md)), 0) from public.kb_sections),
    'sources', (select count(*) from public.kb_sources),
    'sources_by_status', (select coalesce(jsonb_object_agg(check_status, n), '{}'::jsonb)
                          from (select check_status, count(*) n from public.kb_sources group by 1) x),
    'country_rules', (select count(*) from public.kb_country_rules),
    'countries', (select count(distinct country_code) from public.kb_country_rules),
    'rules_by_status', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
                        from (select status, count(*) n from public.kb_country_rules group by 1) x),
    'rules_due', (select count(*) from public.kb_country_rules
                  where status <> 'outdated' and (next_review_at is null or next_review_at < now()))
  );
$$;
grant execute on function public.kb_stats() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.kb_books enable row level security;
alter table public.kb_chapters enable row level security;
alter table public.kb_sections enable row level security;
alter table public.kb_section_revisions enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.kb_sources enable row level security;
alter table public.kb_source_checks enable row level security;
alter table public.kb_country_rules enable row level security;
alter table public.kb_rule_sources enable row level security;
alter table public.kb_country_sections enable row level security;

drop policy if exists "kb_books_read" on public.kb_books;
create policy "kb_books_read" on public.kb_books for select to anon, authenticated using (true);
drop policy if exists "kb_books_write" on public.kb_books;
create policy "kb_books_write" on public.kb_books for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

drop policy if exists "kb_chapters_read" on public.kb_chapters;
create policy "kb_chapters_read" on public.kb_chapters for select to anon, authenticated
  using (status = 'published' or public.kb_is_editor());
drop policy if exists "kb_chapters_write" on public.kb_chapters;
create policy "kb_chapters_write" on public.kb_chapters for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

drop policy if exists "kb_sections_read" on public.kb_sections;
create policy "kb_sections_read" on public.kb_sections for select to anon, authenticated
  using (
    public.kb_is_editor()
    or (status = 'published' and exists (
      select 1 from public.kb_chapters c where c.id = chapter_id and c.status = 'published'))
  );
drop policy if exists "kb_sections_write" on public.kb_sections;
create policy "kb_sections_write" on public.kb_sections for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

drop policy if exists "kb_section_revisions_editor" on public.kb_section_revisions;
create policy "kb_section_revisions_editor" on public.kb_section_revisions for select to authenticated
  using (public.kb_is_editor());

drop policy if exists "kb_chunks_read" on public.kb_chunks;
create policy "kb_chunks_read" on public.kb_chunks for select to anon, authenticated
  using (
    public.kb_is_editor()
    or exists (
      select 1 from public.kb_sections s join public.kb_chapters c on c.id = s.chapter_id
      where s.id = section_id and s.status = 'published' and c.status = 'published')
  );
-- Chunk writes go through kb_replace_section_chunks() / Edge Functions only.

drop policy if exists "kb_sources_read" on public.kb_sources;
create policy "kb_sources_read" on public.kb_sources for select to anon, authenticated using (true);
drop policy if exists "kb_sources_write" on public.kb_sources;
create policy "kb_sources_write" on public.kb_sources for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

drop policy if exists "kb_source_checks_editor" on public.kb_source_checks;
create policy "kb_source_checks_editor" on public.kb_source_checks for select to authenticated
  using (public.kb_is_editor());

drop policy if exists "kb_country_rules_read" on public.kb_country_rules;
create policy "kb_country_rules_read" on public.kb_country_rules for select to anon, authenticated using (true);
drop policy if exists "kb_country_rules_write" on public.kb_country_rules;
create policy "kb_country_rules_write" on public.kb_country_rules for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

drop policy if exists "kb_rule_sources_read" on public.kb_rule_sources;
create policy "kb_rule_sources_read" on public.kb_rule_sources for select to anon, authenticated using (true);
drop policy if exists "kb_rule_sources_write" on public.kb_rule_sources;
create policy "kb_rule_sources_write" on public.kb_rule_sources for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

drop policy if exists "kb_country_sections_read" on public.kb_country_sections;
create policy "kb_country_sections_read" on public.kb_country_sections for select to anon, authenticated using (true);
drop policy if exists "kb_country_sections_write" on public.kb_country_sections;
create policy "kb_country_sections_write" on public.kb_country_sections for all to authenticated
  using (public.kb_is_editor()) with check (public.kb_is_editor());

-- -----------------------------------------------------------------------------
-- Scheduled jobs (pg_cron)
-- -----------------------------------------------------------------------------
-- Before these do anything, set the Edge Functions base URL once:
--   insert into kb_private.settings (key, value)
--   values ('functions_url', 'https://<project-ref>.supabase.co/functions/v1')
--   on conflict (key) do update set value = excluded.value;
select cron.schedule('kb-embed-pending', '*/10 * * * *', $$select kb_private.request_embeddings()$$);
-- Each run re-checks up to 10 sources not checked in the last 7 days.
select cron.schedule('kb-verify-sources', '17 * * * *', $$select kb_private.request_source_checks()$$);
