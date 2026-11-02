-- =============================================================================
-- Account deletion
-- =============================================================================
-- Lets a signed-in user delete their own account from Sozlamalar. The app
-- never holds a service-role key, so this SECURITY DEFINER function does the
-- one thing that needs it: deleting the caller's own auth.users row. Every
-- public table that points at auth.users cascades (profiles, applications,
-- documents, recommendations, …) or is set to null (editor history).
--
-- Storage files can't be deleted from SQL, so the app removes the user's
-- files through the Storage API first (src/lib/actions/account.ts).
--
-- Rollback: supabase/account_deletion_rollback.sql
-- =============================================================================

create or replace function public.delete_my_account(p_confirm text)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  -- A fixed word, so a stray call can't delete an account by accident.
  if p_confirm is distinct from 'DELETE' then
    raise exception 'confirmation does not match' using errcode = '22023';
  end if;
  delete from auth.users where id = v_user;
end;
$fn$;

revoke all on function public.delete_my_account(text) from public, anon;
grant execute on function public.delete_my_account(text) to authenticated;
