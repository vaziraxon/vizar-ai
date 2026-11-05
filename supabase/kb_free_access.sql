-- =============================================================================
-- VIZAR AI — library free for every signed-in user (until online payment)
-- =============================================================================
-- Until Payme, Click and Upay are connected, any signed-in user reads the full
-- book and country rules (the library lives in /dashboard/library). Guests
-- still get only what kb_has_access() = false allows (titles and previews).
-- Everything that checks access — the RLS policies on kb_sections /
-- kb_chunks / kb_country_rules and the kb-search Edge Function — calls this
-- function, so this one change covers them all.
--
-- When payment is live, restore the subscription check:
--   supabase/kb_free_access_rollback.sql
-- =============================================================================
create or replace function public.kb_has_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    or public.kb_is_editor()
    or exists (
      select 1
      from public.subscriptions s
      where s.user_id = auth.uid()
        and s.status = 'active'
        and s.starts_at <= now()
        and s.expires_at > now()
    );
$$;
revoke all on function public.kb_has_access() from public;
grant execute on function public.kb_has_access() to anon, authenticated;
