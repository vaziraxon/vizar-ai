-- =============================================================================
-- Rollback for supabase/avatars.sql
-- =============================================================================
-- Empty the "avatars" bucket first (Dashboard → Storage), otherwise deleting
-- the bucket fails. Profiles keep their avatar_url, which then points nowhere;
-- the app falls back to initials.
-- =============================================================================

drop policy if exists "avatars_select_own_folder" on storage.objects;
drop policy if exists "avatars_insert_own_folder" on storage.objects;
drop policy if exists "avatars_update_own_folder" on storage.objects;
drop policy if exists "avatars_delete_own_folder" on storage.objects;
delete from storage.buckets where id = 'avatars';
