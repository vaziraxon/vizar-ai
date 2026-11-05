-- =============================================================================
-- VIZAR AI — real numbers for the admin home (/admin)
-- =============================================================================
-- The admin home showed sample figures. This returns live counts, for site
-- editors only (is_site_editor()), in one call. Counts only — no personal data.
--
-- Rollback: drop function if exists public.admin_site_stats();
-- =============================================================================
create or replace function public.admin_site_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_site_editor() then
    raise exception 'site editors only' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'users_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'applications', (select count(*) from public.visa_applications),
    'documents', (select count(*) from public.documents),
    'consultations_open', (select count(*) from public.consultations where status = 'booked'),
    'subscription_requests_pending', (select count(*) from public.subscription_requests where status = 'pending'),
    'subscriptions_active', (
      select count(*) from public.subscriptions
      where status = 'active' and starts_at <= now() and expires_at > now()
    ),
    'testimonials_published', (select count(*) from public.testimonials where published),
    'testimonials_total', (select count(*) from public.testimonials)
  );
end;
$$;
revoke all on function public.admin_site_stats() from public, anon;
grant execute on function public.admin_site_stats() to authenticated;
