-- =============================================================================
-- VIZAR AI — who signed up and how far they got (/admin/users)
-- =============================================================================
-- auth.users is not readable from the app, so site editors read this list
-- through a SECURITY DEFINER function. Per user: email, name, when they
-- signed up and last signed in, and counts of what they did (applications,
-- visa assessments, documents, interview practice, tasks, consultation
-- requests) plus the active plan. No document contents, answers or contacts.
--
-- Rollback: drop function if exists public.admin_list_users(integer);
-- =============================================================================
create or replace function public.admin_list_users(p_limit integer default 300)
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed boolean,
  applications integer,
  latest_destination text,
  latest_visa_type text,
  assessments integer,
  documents integer,
  interview_sessions integer,
  tasks_done integer,
  tasks_total integer,
  consultations integer,
  active_plan text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_site_editor() then
    raise exception 'site editors only' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.first_name,
    p.last_name,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at is not null,
    (select count(*)::integer from public.visa_applications a where a.user_id = u.id),
    (select a.destination_country from public.visa_applications a where a.user_id = u.id order by a.created_at desc limit 1),
    (select a.visa_type from public.visa_applications a where a.user_id = u.id order by a.created_at desc limit 1),
    (select count(*)::integer from public.assessments s where s.user_id = u.id),
    (select count(*)::integer from public.documents d where d.user_id = u.id),
    (select count(*)::integer from public.interview_sessions i where i.user_id = u.id),
    (select count(*)::integer from public.recommendations r where r.user_id = u.id and r.status = 'done'),
    (select count(*)::integer from public.recommendations r where r.user_id = u.id),
    (select count(*)::integer from public.consultations c where c.user_id = u.id),
    (
      select s.plan from public.subscriptions s
      where s.user_id = u.id and s.status = 'active' and s.starts_at <= now() and s.expires_at > now()
      order by s.expires_at desc limit 1
    )
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by coalesce(u.last_sign_in_at, u.created_at) desc
  limit least(greatest(coalesce(p_limit, 300), 1), 1000);
end;
$$;
revoke all on function public.admin_list_users(integer) from public, anon;
grant execute on function public.admin_list_users(integer) to authenticated;
