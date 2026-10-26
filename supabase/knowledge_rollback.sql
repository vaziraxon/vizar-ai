-- =============================================================================
-- Rollback for supabase/knowledge.sql
-- =============================================================================
-- Removes ONLY the knowledge-base objects that knowledge.sql created. It does
-- not touch profiles, visa applications, documents, auth users, storage or
-- any other existing table. The book text can be re-imported at any time
-- with scripts/knowledge/import-book.mjs, but editor changes made in
-- /admin/knowledge (and kb_section_revisions) are lost, so export them first.
--
-- Extensions (vector, pg_net, pg_cron) are left installed: other features may
-- rely on them, and leaving them costs nothing.
-- =============================================================================

select cron.unschedule(jobname) from cron.job where jobname in ('kb-embed-pending', 'kb-verify-sources');

drop function if exists public.kb_admin_import(text, text, jsonb);
drop function if exists public.kb_search(text[], extensions.vector, integer, double precision, double precision, integer);
drop function if exists public.kb_search_rules(text, text[], integer);
drop function if exists public.kb_stats();
drop function if exists public.kb_replace_section_chunks(uuid, jsonb);

drop table if exists public.kb_country_sections;
drop table if exists public.kb_rule_sources;
drop table if exists public.kb_country_rules;
drop table if exists public.kb_source_checks;
drop table if exists public.kb_sources;
drop table if exists public.kb_chunks;
drop table if exists public.kb_section_revisions;
drop table if exists public.kb_sections;
drop table if exists public.kb_chapters;
drop table if exists public.kb_books;
drop table if exists public.kb_editors;

drop function if exists public.kb_is_editor();
drop function if exists public.kb_normalize(text);
drop schema if exists kb_private cascade;
