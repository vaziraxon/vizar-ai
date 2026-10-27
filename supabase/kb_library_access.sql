-- =============================================================================
-- VIZAR AI — Premium "Viza ma'lumotlar bazasi" library: subscriptions + access
-- =============================================================================
-- Run AFTER supabase/knowledge.sql. Nothing is deleted or re-imported.
--
-- What it does
--   * public.subscriptions — Standard (7 days), Premium (30), Pro (45),
--     VIP (explicit end date). Users can read only their own rows; rows are
--     written by the service role (future payment webhook) or by
--     grant_subscription() from the SQL Editor.
--   * public.kb_has_access() — true for knowledge-base editors and for users
--     with an active subscription whose period covers now(). Evaluated on
--     every query, so access closes the moment expires_at passes; no cron.
--   * Full text (kb_sections.content_md, kb_chunks, kb_country_rules) is
--     readable only when kb_has_access(). Everyone can still see the library
--     outline (chapter/section titles, countries, topics, a short preview)
--     through the security-definer RPCs below, which never return full text.
--   * kb_stats() becomes security definer (counts only) so the public
--     /api/knowledge/status endpoint keeps working.
--
-- The kb-search Edge Function uses the service role and applies the same
-- rule itself: full passages for kb_has_access() callers, previews otherwise.
-- Rollback (policies only, keeps subscription data): kb_library_access_rollback.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Subscriptions
-- -----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade deferrable initially immediate,
  plan text not null check (plan in ('standard','premium','pro','vip')),
  status text not null default 'active' check (status in ('active','canceled','refunded')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  source text not null default 'manual' check (source in ('manual','payment','promo')),
  payment_ref text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_period check (expires_at > starts_at)
);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id, expires_at desc);

comment on table public.subscriptions is
  'Paid access periods. Written only by the service role / grant_subscription(); users read their own rows.';

alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
-- No insert/update/delete policies on purpose, and no table privileges either.
revoke insert, update, delete, truncate on public.subscriptions from anon, authenticated;

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated before update on public.subscriptions
  for each row execute function kb_private.touch_updated_at();

create or replace function public.subscription_plan_days(p_plan text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_plan when 'standard' then 7 when 'premium' then 30 when 'pro' then 45 else null end;
$$;

-- -----------------------------------------------------------------------------
-- Access check
-- -----------------------------------------------------------------------------
create or replace function public.kb_has_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.kb_is_editor() or exists (
    select 1
    from public.subscriptions s
    where s.user_id = auth.uid()
      and s.status = 'active'
      and s.starts_at <= now()
      and s.expires_at > now()
  );
$$;
revoke all on function public.kb_has_access() from public;
grant execute on function public.kb_has_access() to anon, authenticated;

-- The caller's subscription that is active right now (null when none).
create or replace function public.my_active_subscription()
returns table (plan text, starts_at timestamptz, expires_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select s.plan, s.starts_at, s.expires_at
  from public.subscriptions s
  where s.user_id = auth.uid() and s.status = 'active' and s.starts_at <= now() and s.expires_at > now()
  order by s.expires_at desc
  limit 1;
$$;
revoke all on function public.my_active_subscription() from public, anon;
grant execute on function public.my_active_subscription() to authenticated;

-- Manual activation until online payments exist (SQL Editor / service role only):
--   select public.grant_subscription('user@example.com', 'premium');
--   select public.grant_subscription('vip@example.com', 'vip', '2027-03-01');
-- A new period starts when the current one ends, so renewals don't lose days.
create or replace function public.grant_subscription(
  p_email text,
  p_plan text,
  p_expires_at timestamptz default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_start timestamptz := now();
  v_end timestamptz;
  v_id uuid;
begin
  if p_plan not in ('standard','premium','pro','vip') then
    raise exception 'Unknown plan %', p_plan;
  end if;
  select id into v_user from auth.users where lower(email) = lower(p_email);
  if v_user is null then
    raise exception 'No user with email %', p_email;
  end if;

  if p_expires_at is null then
    select greatest(now(), coalesce(max(s.expires_at), now())) into v_start
    from public.subscriptions s
    where s.user_id = v_user and s.status = 'active' and s.expires_at > now();
    v_end := v_start + make_interval(days => public.subscription_plan_days(p_plan));
  else
    v_end := p_expires_at;
  end if;
  if v_end is null then
    raise exception 'Plan % needs an explicit end date (p_expires_at)', p_plan;
  end if;

  insert into public.subscriptions (user_id, plan, starts_at, expires_at, source, note)
  values (v_user, p_plan, v_start, v_end, 'manual', p_note)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.grant_subscription(text, text, timestamptz, text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Full text: subscribers and editors only
-- -----------------------------------------------------------------------------
drop policy if exists "kb_sections_read" on public.kb_sections;
create policy "kb_sections_read" on public.kb_sections for select to anon, authenticated
  using (
    (select public.kb_is_editor())
    or (
      (select public.kb_has_access())
      and status = 'published'
      and exists (select 1 from public.kb_chapters c where c.id = chapter_id and c.status = 'published')
    )
  );

drop policy if exists "kb_chunks_read" on public.kb_chunks;
create policy "kb_chunks_read" on public.kb_chunks for select to anon, authenticated
  using (
    (select public.kb_is_editor())
    or (
      (select public.kb_has_access())
      and exists (
        select 1 from public.kb_sections s join public.kb_chapters c on c.id = s.chapter_id
        where s.id = section_id and s.status = 'published' and c.status = 'published')
    )
  );

drop policy if exists "kb_country_rules_read" on public.kb_country_rules;
create policy "kb_country_rules_read" on public.kb_country_rules for select to anon, authenticated
  using ((select public.kb_has_access()));

-- Counts only — safe to expose; keeps /api/knowledge/status working.
alter function public.kb_stats() security definer;

-- -----------------------------------------------------------------------------
-- Public outline (never full text)
-- -----------------------------------------------------------------------------
create or replace function public.kb_library_outline()
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
  is_intro boolean,
  char_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.slug, c.position, c.kind, c.number, c.label, c.display_title,
         s.slug, s.position, s.number, s.title, s.is_intro, length(s.content_md)
  from public.kb_chapters c
  join public.kb_sections s on s.chapter_id = c.id
  where c.status = 'published' and s.status = 'published'
  order by c.position, s.position;
$$;
revoke all on function public.kb_library_outline() from public;
grant execute on function public.kb_library_outline() to anon, authenticated;

-- One section's metadata plus a ~320-character plain-text preview and its
-- neighbours. The full text is read separately through RLS.
create or replace function public.kb_section_preview(p_chapter_slug text, p_section_slug text)
returns table (
  chapter_slug text,
  chapter_kind text,
  chapter_label text,
  chapter_title text,
  section_id uuid,
  section_slug text,
  section_number text,
  section_title text,
  is_intro boolean,
  char_count integer,
  preview text,
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
    select c.slug as chapter_slug, c.kind, c.label, c.display_title, s.id, s.slug, s.number, s.title,
           s.is_intro, s.content_md,
           lag(s.slug) over w as prev_slug, lag(coalesce(s.number || '. ', '') || s.title) over w as prev_title,
           lead(s.slug) over w as next_slug, lead(coalesce(s.number || '. ', '') || s.title) over w as next_title
    from public.kb_chapters c
    join public.kb_sections s on s.chapter_id = c.id
    where c.slug = p_chapter_slug and c.status = 'published' and s.status = 'published'
    window w as (order by s.position)
  )
  select o.chapter_slug, o.kind, o.label, o.display_title, o.id, o.slug, o.number, o.title, o.is_intro,
         length(o.content_md),
         left(btrim(regexp_replace(regexp_replace(regexp_replace(o.content_md,
               '^(\|.*|#{1,6} .*)$', '', 'gn'), '[*>]', '', 'g'), '\s+', ' ', 'g')), 320),
         o.prev_slug, o.prev_title, o.next_slug, o.next_title
  from ordered o
  where o.slug = p_section_slug;
$$;
revoke all on function public.kb_section_preview(text, text) from public;
grant execute on function public.kb_section_preview(text, text) to anon, authenticated;

-- Countries with how many rules and which topics they cover (no rule text).
create or replace function public.kb_library_countries()
returns table (
  country_code text,
  country_name text,
  region text,
  rule_count integer,
  topics text[],
  needs_review integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.country_code, min(r.country_name), min(r.region), count(*)::integer,
         array_agg(distinct r.topic order by r.topic),
         (count(*) filter (where r.status = 'needs_review'))::integer
  from public.kb_country_rules r
  where r.status <> 'outdated'
  group by r.country_code
  order by min(r.region), min(r.country_name);
$$;
revoke all on function public.kb_library_countries() from public;
grant execute on function public.kb_library_countries() to anon, authenticated;

-- Book sections that discuss a country (titles only).
create or replace function public.kb_country_outline(p_country_code text)
returns table (
  chapter_slug text,
  chapter_label text,
  section_slug text,
  section_number text,
  section_title text,
  anchor text
)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct c.slug, c.label, s.slug, s.number, s.title, cs.anchor
  from public.kb_country_sections cs
  join public.kb_sections s on s.id = cs.section_id and s.status = 'published'
  join public.kb_chapters c on c.id = s.chapter_id and c.status = 'published'
  where cs.country_code = upper(p_country_code)
  order by c.slug, s.number;
$$;
revoke all on function public.kb_country_outline(text) from public;
grant execute on function public.kb_country_outline(text) to anon, authenticated;
