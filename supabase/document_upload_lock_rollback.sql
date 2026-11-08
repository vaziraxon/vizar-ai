-- Re-opens document uploads (undoes document_upload_lock.sql).
-- Same definitions as before the lock (supabase/storage.sql, schema.sql).

create policy "visa_documents_insert_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'visa-documents' and (auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "visa_documents_update_own_folder" on storage.objects
  for update using (
    bucket_id = 'visa-documents' and (auth.uid())::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'visa-documents' and (auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
