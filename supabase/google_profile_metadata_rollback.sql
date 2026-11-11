-- Rollback for supabase/google_profile_metadata.sql (part 1): the signup trigger
-- goes back to copying only first_name / last_name. Profiles already filled by
-- part 2 keep their values; users can edit them in Profil.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
