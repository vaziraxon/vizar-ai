-- =============================================================================
-- Rollback for supabase/kb_i18n.sql
-- =============================================================================
-- Restores the Uzbek-only outline RPCs from kb_library_access.sql and drops
-- the translation tables (their data is generated from supabase/i18n/*.json,
-- so it can be loaded again). The Uzbek book is not touched.
-- =============================================================================

drop function if exists public.kb_i18n_stats();
drop function if exists public.kb_library_outline(text);
drop function if exists public.kb_section_preview(text, text, text);
drop function if exists public.kb_library_countries(text);
drop function if exists public.kb_country_outline(text, text);

drop table if exists public.kb_rule_i18n;
drop table if exists public.kb_country_i18n;
drop table if exists public.kb_section_i18n;
drop table if exists public.kb_chapter_i18n;

-- Then re-run the "Public outline" part of supabase/kb_library_access.sql to
-- recreate kb_library_outline(), kb_section_preview(text, text),
-- kb_library_countries() and kb_country_outline(text).
