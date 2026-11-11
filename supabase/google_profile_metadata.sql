-- =============================================================================
-- VIZAR AI — fill new profiles from Google sign-in data too
-- =============================================================================
-- The signup trigger only copied `first_name` / `last_name` (the email form's
-- fields), so Google sign-ups got a profile with no name and no photo.
-- This keeps the same trigger (one profile per user, `on conflict do nothing`
-- — never a duplicate) and also reads Google's `given_name` / `family_name` /
-- `full_name` / `name`, and the Google photo (`avatar_url` / `picture`, only
-- from lh3.googleusercontent.com — the one photo host next.config allows).
--
-- Part 2 backfills existing Google users. It only fills fields that are still
-- empty — it never overwrites a name or photo the user set — and changes no
-- ids. Rollback: supabase/google_profile_metadata_rollback.sql (part 2 needs no
-- rollback: the user can edit or clear the filled fields in Profil).
-- =============================================================================

-- Part 1: the signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := nullif(btrim(coalesce(meta ->> 'full_name', meta ->> 'name', '')), '');
  photo text := coalesce(meta ->> 'avatar_url', meta ->> 'picture');
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(btrim(meta ->> 'first_name'), ''),
      nullif(btrim(meta ->> 'given_name'), ''),
      nullif(split_part(full_name, ' ', 1), '')
    ),
    coalesce(
      nullif(btrim(meta ->> 'last_name'), ''),
      nullif(btrim(meta ->> 'family_name'), '')
    ),
    case when photo like 'https://lh3.googleusercontent.com/%' then photo end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Part 2: existing Google users — fill only what is still empty
update public.profiles p
set
  first_name = coalesce(
    nullif(btrim(p.first_name), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'given_name'), ''),
    nullif(split_part(nullif(btrim(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')), ''), ' ', 1), '')
  ),
  last_name = coalesce(
    nullif(btrim(p.last_name), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'family_name'), '')
  ),
  avatar_url = coalesce(
    p.avatar_url,
    case
      when coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture') like 'https://lh3.googleusercontent.com/%'
      then coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
    end
  ),
  updated_at = now()
from auth.users u
where u.id = p.id
  and exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'google')
  and (nullif(btrim(p.first_name), '') is null or nullif(btrim(p.last_name), '') is null or p.avatar_url is null);
