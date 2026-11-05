-- =============================================================================
-- VIZAR AI — fixes for the Supabase security advisor (2026-11-05)
-- =============================================================================
-- 1. Trigger functions are not API endpoints. handle_new_user (SECURITY
--    DEFINER, fills profiles on sign-up) and set_updated_at were callable at
--    /rest/v1/rpc/… by anyone. Triggers keep working without EXECUTE.
-- 2. set_updated_at had a role-mutable search_path; it only calls now().
-- 3. The library is read in the dashboard now (signed-in users only), so its
--    content functions no longer need the anon key: outline, section
--    previews, country lists and translation stats.
--    Kept for anon on purpose: kb_has_access and kb_is_editor (the library's
--    read policies call them for every role, so revoking them would turn an
--    empty result into an error) and kb_stats (counts only,
--    /api/knowledge/status).
--
-- Rollback: supabase/security_hardening_rollback.sql
-- =============================================================================

-- 1–2. Trigger functions
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
alter function public.set_updated_at() set search_path = '';

-- 3. Library functions: signed-in users only
revoke execute on function public.kb_library_outline(text) from public, anon;
grant execute on function public.kb_library_outline(text) to authenticated;

revoke execute on function public.kb_section_preview(text, text, text) from public, anon;
grant execute on function public.kb_section_preview(text, text, text) to authenticated;

revoke execute on function public.kb_country_outline(text, text) from public, anon;
grant execute on function public.kb_country_outline(text, text) to authenticated;

revoke execute on function public.kb_library_countries(text) from public, anon;
grant execute on function public.kb_library_countries(text) to authenticated;

revoke execute on function public.kb_i18n_stats() from public, anon;
grant execute on function public.kb_i18n_stats() to authenticated;
