-- =============================================================================
-- VIZAR AI — customer testimonials (landing page "Mijozlarimizning real hikoyalari")
-- =============================================================================
-- Run after supabase/schema.sql (uses public.set_updated_at()). Safe to re-run.
--
-- Only real reviews published with the customer's consent ever reach the
-- public site:
--  - anon can read a row only when it is published AND consent was given,
--    and only its public columns (column grants below);
--  - a CHECK keeps a row from being published without recorded consent;
--  - how consent was obtained lives in testimonial_consents, editors only.
--
-- Writing is limited to emails in public.site_editors (managed from the SQL
-- Editor, like kb_editors). The /admin area is additionally gated by the
-- ADMIN_EMAILS allowlist in middleware.
--
-- Media: public bucket "testimonials" for avatars and travel photos
-- (≤ 2 MB, JPEG/PNG/WebP). Only editors can upload, replace or delete files.
-- File names are random, but a file's URL works as soon as it is uploaded —
-- upload photos only once the customer has agreed to share them.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Editors
-- -----------------------------------------------------------------------------
create table if not exists public.site_editors (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.site_editors enable row level security;
-- No policies on purpose: rows are added in the SQL Editor, e.g.
--   insert into public.site_editors (email) values ('editor@example.com');

comment on table public.site_editors is
  'Emails allowed to manage site content (customer testimonials). Managed from the SQL Editor only.';

-- People already trusted to edit the knowledge base start as site editors too.
do $$
begin
  if to_regclass('public.kb_editors') is not null then
    insert into public.site_editors (email)
    select email from public.kb_editors
    on conflict (email) do nothing;
  end if;
end $$;

create or replace function public.is_site_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.site_editors e
    join auth.users u on lower(u.email) = e.email
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_site_editor() from public;
revoke execute on function public.is_site_editor() from anon;
grant execute on function public.is_site_editor() to authenticated;

-- -----------------------------------------------------------------------------
-- Testimonials
-- -----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  avatar_url text,
  destination text not null
    check (destination in ('schengen', 'usa', 'uk', 'canada', 'japan', 'south-korea', 'uae', 'turkey')),
  tool text not null
    check (tool in ('readiness', 'documents', 'checklist', 'interview', 'tracker', 'rejection', 'experts')),
  rating smallint check (rating between 1 and 5),
  quote text not null check (char_length(btrim(quote)) between 10 and 600),
  locale text check (locale in ('uz', 'ru', 'en')),
  photo_url text,
  consent_given boolean not null default false,
  consent_at timestamptz,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_media_urls check (
    (avatar_url is null or avatar_url ~ '^https://')
    and (photo_url is null or photo_url ~ '^https://' or photo_url ~ '^/images/destinations/[a-z]+\.webp$')
  ),
  constraint testimonials_publish_needs_consent check (not published or (consent_given and consent_at is not null))
);

comment on table public.testimonials is
  'Customer reviews for the landing page. Public only when published and consented; the quote is the customer''s own words.';

create index if not exists testimonials_public_idx
  on public.testimonials (sort_order, created_at desc)
  where published and consent_given;

drop trigger if exists set_updated_at on public.testimonials;
create trigger set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

drop policy if exists "testimonials_read" on public.testimonials;
drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials for select to anon
  using (published and consent_given);
drop policy if exists "testimonials_member_read" on public.testimonials;
create policy "testimonials_member_read" on public.testimonials for select to authenticated
  using ((published and consent_given) or public.is_site_editor());
drop policy if exists "testimonials_insert" on public.testimonials;
create policy "testimonials_insert" on public.testimonials for insert to authenticated
  with check (public.is_site_editor());
drop policy if exists "testimonials_update" on public.testimonials;
create policy "testimonials_update" on public.testimonials for update to authenticated
  using (public.is_site_editor()) with check (public.is_site_editor());
drop policy if exists "testimonials_delete" on public.testimonials;
create policy "testimonials_delete" on public.testimonials for delete to authenticated
  using (public.is_site_editor());

-- Visitors (anon) see public columns only — not who created the row.
revoke all on public.testimonials from anon;
grant select (id, name, avatar_url, destination, tool, rating, quote, locale, photo_url, consent_given, published, sort_order, created_at)
  on public.testimonials to anon;

-- How consent was obtained (e.g. "Telegram, 2 Nov 2026, agreed to name + photo").
-- Editors only — never exposed to visitors.
create table if not exists public.testimonial_consents (
  testimonial_id uuid primary key references public.testimonials (id) on delete cascade,
  note text not null check (char_length(btrim(note)) between 3 and 300),
  recorded_by uuid default auth.uid() references auth.users (id) on delete set null,
  recorded_at timestamptz not null default now()
);
alter table public.testimonial_consents enable row level security;
revoke all on public.testimonial_consents from anon;

drop policy if exists "testimonial_consents_editor" on public.testimonial_consents;
create policy "testimonial_consents_editor" on public.testimonial_consents for all to authenticated
  using (public.is_site_editor()) with check (public.is_site_editor());

-- -----------------------------------------------------------------------------
-- Media bucket
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('testimonials', 'testimonials', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "testimonials_media_select" on storage.objects;
create policy "testimonials_media_select" on storage.objects for select to authenticated
  using (bucket_id = 'testimonials' and public.is_site_editor());
drop policy if exists "testimonials_media_insert" on storage.objects;
create policy "testimonials_media_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'testimonials' and public.is_site_editor());
drop policy if exists "testimonials_media_update" on storage.objects;
create policy "testimonials_media_update" on storage.objects for update to authenticated
  using (bucket_id = 'testimonials' and public.is_site_editor())
  with check (bucket_id = 'testimonials' and public.is_site_editor());
drop policy if exists "testimonials_media_delete" on storage.objects;
create policy "testimonials_media_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'testimonials' and public.is_site_editor());
