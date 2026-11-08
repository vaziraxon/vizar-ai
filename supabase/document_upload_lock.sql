-- Document upload lock (owner's decision, 2026-11-08).
--
-- Real passports, bank statements and other visa documents can't be uploaded
-- until the document service runs on a protected server. The site checks
-- DOCUMENT_UPLOAD_ENABLED too, but that only covers the site's own code: a
-- signed-in user could still call Storage or the documents table directly with
-- their own token. These rules close those paths for everyone, admins included
-- (the app never uploads with the service role).
--
-- Kept on purpose: users can still see and delete what they uploaded before
-- (select/delete policies stay). Profile photos ("avatars") are not affected.
-- Undo with document_upload_lock_rollback.sql.

-- Storage: no new files in, and no overwriting existing ones
drop policy if exists "visa_documents_insert_own_folder" on storage.objects;
drop policy if exists "visa_documents_update_own_folder" on storage.objects;

-- Table: no new document rows (the row is what makes a file appear on the site)
drop policy if exists "documents_insert_own" on public.documents;
