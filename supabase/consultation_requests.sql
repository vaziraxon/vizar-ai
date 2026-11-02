-- =============================================================================
-- Consultation requests
-- =============================================================================
-- Users leave a request in /dashboard/experts: a topic, how to reach them, a
-- preferred time and an optional question, stored as JSON in
-- consultations.notes (src/lib/dashboard/consultation-request.ts). Site editors
-- (public.site_editors, see supabase/testimonials.sql) read every request in
-- /admin/consultations and mark it done. Users keep their own policies from
-- schema.sql. No new columns; run after schema.sql and testimonials.sql.
--
-- Rollback: supabase/consultation_requests_rollback.sql
-- =============================================================================

drop policy if exists "consultations_select_editor" on public.consultations;
create policy "consultations_select_editor" on public.consultations
  for select to authenticated
  using (public.is_site_editor());

drop policy if exists "consultations_update_editor" on public.consultations;
create policy "consultations_update_editor" on public.consultations
  for update to authenticated
  using (public.is_site_editor())
  with check (public.is_site_editor());

comment on table public.consultations is
  'Consultation requests: topic, contact and preferred time are JSON in notes. Site editors read them in /admin/consultations. No booking calendar or payment behind this table.';
