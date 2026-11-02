-- =============================================================================
-- Rollback for supabase/consultation_requests.sql
-- =============================================================================
-- Site editors lose access to other users' requests. The requests themselves
-- stay, and each user can still see and cancel their own.
-- =============================================================================

drop policy if exists "consultations_update_editor" on public.consultations;
drop policy if exists "consultations_select_editor" on public.consultations;

comment on table public.consultations is
  'Demo specialists and time slots only — no real availability or payment system behind this table yet.';
