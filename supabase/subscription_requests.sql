-- =============================================================================
-- VIZAR AI — subscription requests (until online payment is connected)
-- =============================================================================
-- A signed-in user picks a plan on /dashboard/subscription and leaves a
-- contact. A site editor takes the payment outside the app, then presses
-- "Faollashtirish" in /admin/subscriptions: approve_subscription_request()
-- adds the public.subscriptions row (same period rules as
-- grant_subscription) and marks the request approved.
--
-- Needs: kb_library_access.sql (subscriptions, subscription_plan_days),
--        testimonials.sql (is_site_editor), schema.sql (set_updated_at).
-- Touches no existing table except inserting rows on approval.
-- Rollback: supabase/subscription_requests_rollback.sql
-- =============================================================================

create table if not exists public.subscription_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('standard','premium','pro','vip')),
  contact text not null check (char_length(contact) between 5 and 100),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'pending' check (status in ('pending','approved','declined','cancelled')),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscription_requests_user on public.subscription_requests(user_id, created_at desc);
create index if not exists idx_subscription_requests_status on public.subscription_requests(status, created_at desc);

comment on table public.subscription_requests is
  'Plan requests: the user asks, a site editor takes payment outside the app and approves with approve_subscription_request().';

drop trigger if exists trg_subscription_requests_updated on public.subscription_requests;
create trigger trg_subscription_requests_updated before update on public.subscription_requests
  for each row execute function public.set_updated_at();

alter table public.subscription_requests enable row level security;

-- Users: create a pending request, read their own, cancel their own pending one.
-- Site editors: read all, decline. Approval goes only through the function below.
drop policy if exists "subscription_requests_insert_own" on public.subscription_requests;
create policy "subscription_requests_insert_own" on public.subscription_requests
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending' and subscription_id is null);

drop policy if exists "subscription_requests_select" on public.subscription_requests;
create policy "subscription_requests_select" on public.subscription_requests
  for select to authenticated
  using ((select auth.uid()) = user_id or public.is_site_editor());

drop policy if exists "subscription_requests_cancel_own" on public.subscription_requests;
create policy "subscription_requests_cancel_own" on public.subscription_requests
  for update to authenticated
  using ((select auth.uid()) = user_id and status = 'pending')
  with check ((select auth.uid()) = user_id and status = 'cancelled');

drop policy if exists "subscription_requests_decline_editor" on public.subscription_requests;
create policy "subscription_requests_decline_editor" on public.subscription_requests
  for update to authenticated
  using (public.is_site_editor() and status = 'pending')
  with check (public.is_site_editor() and status = 'declined');

-- Column privileges: users may only write these columns; status is the only
-- thing an update can change (approved and subscription_id come from the function).
revoke all on public.subscription_requests from anon, authenticated;
grant select on public.subscription_requests to authenticated;
grant insert (user_id, plan, contact, message) on public.subscription_requests to authenticated;
grant update (status) on public.subscription_requests to authenticated;

-- -----------------------------------------------------------------------------
-- Approval: site editors only. A new period starts when the user's current
-- one ends, so renewals don't lose days; VIP needs an explicit end date.
-- -----------------------------------------------------------------------------
create or replace function public.approve_subscription_request(
  p_request_id uuid,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req public.subscription_requests;
  v_start timestamptz := now();
  v_end timestamptz;
  v_id uuid;
begin
  if not public.is_site_editor() then
    raise exception 'only site editors can approve subscription requests' using errcode = '42501';
  end if;

  select * into v_req from public.subscription_requests where id = p_request_id for update;
  if not found then
    raise exception 'subscription request % not found', p_request_id;
  end if;
  if v_req.status <> 'pending' then
    raise exception 'subscription request is already %', v_req.status;
  end if;

  if p_expires_at is null then
    select greatest(now(), coalesce(max(s.expires_at), now())) into v_start
    from public.subscriptions s
    where s.user_id = v_req.user_id and s.status = 'active' and s.expires_at > now();
    v_end := v_start + make_interval(days => public.subscription_plan_days(v_req.plan));
  else
    v_end := p_expires_at;
  end if;
  if v_end is null then
    raise exception 'plan % needs an explicit end date', v_req.plan;
  end if;

  insert into public.subscriptions (user_id, plan, starts_at, expires_at, source, note)
  values (v_req.user_id, v_req.plan, v_start, v_end, 'manual', 'subscription request ' || v_req.id)
  returning id into v_id;

  update public.subscription_requests
  set status = 'approved', subscription_id = v_id
  where id = v_req.id;

  insert into public.notifications (user_id, type, title, message)
  values (v_req.user_id, 'subscription', 'Obuna faollashtirildi', 'Kitobning to‘liq matni obuna muddati davomida ochiq.');

  return v_id;
end;
$$;
revoke all on function public.approve_subscription_request(uuid, timestamptz) from public, anon;
grant execute on function public.approve_subscription_request(uuid, timestamptz) to authenticated;
