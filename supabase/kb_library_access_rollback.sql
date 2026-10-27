-- =============================================================================
-- Rollback for supabase/kb_library_access.sql
-- =============================================================================
-- Re-opens the knowledge-base text to everyone (the state before the premium
-- library) and removes the library RPCs. It keeps public.subscriptions and
-- its rows — drop that table by hand only if you are sure no paid periods
-- need to be kept.
-- =============================================================================

drop policy if exists "kb_sections_read" on public.kb_sections;
create policy "kb_sections_read" on public.kb_sections for select to anon, authenticated
  using (
    public.kb_is_editor()
    or (status = 'published' and exists (
      select 1 from public.kb_chapters c where c.id = chapter_id and c.status = 'published'))
  );

drop policy if exists "kb_chunks_read" on public.kb_chunks;
create policy "kb_chunks_read" on public.kb_chunks for select to anon, authenticated
  using (
    public.kb_is_editor()
    or exists (
      select 1 from public.kb_sections s join public.kb_chapters c on c.id = s.chapter_id
      where s.id = section_id and s.status = 'published' and c.status = 'published')
  );

drop policy if exists "kb_country_rules_read" on public.kb_country_rules;
create policy "kb_country_rules_read" on public.kb_country_rules for select to anon, authenticated using (true);

alter function public.kb_stats() security invoker;

drop function if exists public.kb_library_outline();
drop function if exists public.kb_section_preview(text, text);
drop function if exists public.kb_library_countries();
drop function if exists public.kb_country_outline(text);
drop function if exists public.my_active_subscription();
drop function if exists public.grant_subscription(text, text, timestamptz, text);
-- kb_has_access() and subscription_plan_days() are harmless to keep.
