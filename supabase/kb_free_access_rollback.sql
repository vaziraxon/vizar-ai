-- Rollback for kb_free_access.sql: the full library for editors and active
-- subscriptions only (as in kb_library_access.sql). Run when online payment is live.
create or replace function public.kb_has_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.kb_is_editor() or exists (
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
