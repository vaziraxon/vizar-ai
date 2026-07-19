-- =============================================================================
-- VIZAR AI — Stage 6 storage setup
-- =============================================================================
-- Run this after supabase/schema.sql. Creates a PRIVATE bucket for visa
-- documents and RLS policies scoping every file to the uploading
-- user's own folder.
--
-- Path convention enforced by these policies:
--   visa-documents/{user_id}/{application_id}/{timestamp}-{sanitized_filename}
--
-- File type and size limits (PDF/JPG/JPEG/PNG, max 6 MB) are enforced
-- both at the bucket level (below) and again in application code
-- before upload (see src/lib/data/documents.ts) — never rely on only
-- one layer for user-supplied files.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'visa-documents',
  'visa-documents',
  false, -- PRIVATE bucket — never make this true
  6291456, -- 6 MB
  array['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 6291456,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

-- storage.objects RLS is enabled by default on Supabase projects. The
-- policies below scope every operation to the first path segment
-- (foldername[1]) matching the caller's own auth.uid() — i.e. a user
-- can only touch objects under visa-documents/{their-own-user-id}/...

create policy "visa_documents_select_own_folder"
  on storage.objects for select
  using (
    bucket_id = 'visa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "visa_documents_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'visa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "visa_documents_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'visa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'visa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "visa_documents_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'visa-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- No policy grants access to the `anon` role, and no policy uses
-- `using (true)` — every operation requires a matching authenticated
-- auth.uid() folder segment.
--
-- Viewing a file in the app must go through a short-lived signed URL
-- (supabase.storage.from('visa-documents').createSignedUrl(path, seconds))
-- generated server-side — never construct or expose a public URL for
-- this bucket.
