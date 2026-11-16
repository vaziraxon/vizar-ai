-- =============================================================================
-- VIZAR AI — online payments (Payme Merchant API, Click Shop API)
-- =============================================================================
-- Prepared for later; payments stay OFF until PAYMENTS_ENABLED=true and the
-- provider keys are set (docs/payments-setup.md). Apply only with the
-- owner's approval.
--
-- payment_orders       — one order per checkout: plan, amount (tiyin), status
-- payment_transactions — the provider's transactions for an order. The bigint
--                        id doubles as Click's merchant_prepare_id.
-- grant_paid_subscription()  — marks an order paid and opens the library for
--                              the plan's days (same rules as the editor
--                              approval: a renewal starts when the current
--                              period ends). Idempotent.
-- revoke_paid_subscription() — refund: order refunded, subscription closed.
--
-- Only the server writes (service role); users read their own orders.
-- Needs: kb_library_access.sql (subscriptions, subscription_plan_days),
--        testimonials.sql (is_site_editor), schema.sql (notifications).
-- Rollback: supabase/payments_rollback.sql
-- =============================================================================

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('standard', 'premium', 'pro')),
  amount_tiyin bigint not null check (amount_tiyin > 0),
  provider text not null check (provider in ('payme', 'click')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  subscription_id uuid references public.subscriptions (id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_payment_orders_user on public.payment_orders (user_id, created_at desc);

create table if not exists public.payment_transactions (
  id bigint generated always as identity primary key,
  provider text not null check (provider in ('payme', 'click')),
  provider_txn_id text not null check (char_length(provider_txn_id) between 1 and 100),
  order_id uuid not null references public.payment_orders (id) on delete cascade,
  amount_tiyin bigint not null check (amount_tiyin > 0),
  -- Payme states: 1 created, 2 performed, -1 cancelled, -2 cancelled after perform
  state smallint not null check (state in (1, 2, -1, -2)),
  reason smallint,
  provider_time bigint not null default 0,
  create_time bigint not null,
  perform_time bigint not null default 0,
  cancel_time bigint not null default 0,
  created_at timestamptz not null default now(),
  unique (provider, provider_txn_id)
);
-- A one-time order can have only one live (created or performed) transaction
create unique index if not exists payment_transactions_one_live
  on public.payment_transactions (order_id) where state in (1, 2);
create index if not exists idx_payment_transactions_time on public.payment_transactions (provider, provider_time);

drop trigger if exists trg_payment_orders_updated on public.payment_orders;
create trigger trg_payment_orders_updated before update on public.payment_orders
  for each row execute function public.set_updated_at();

alter table public.payment_orders enable row level security;
alter table public.payment_transactions enable row level security;

drop policy if exists "payment_orders_select" on public.payment_orders;
create policy "payment_orders_select" on public.payment_orders
  for select to authenticated using ((select auth.uid()) = user_id or (select public.is_site_editor()));

drop policy if exists "payment_transactions_select_editor" on public.payment_transactions;
create policy "payment_transactions_select_editor" on public.payment_transactions
  for select to authenticated using ((select public.is_site_editor()));

revoke all on public.payment_orders, public.payment_transactions from anon, authenticated;
grant select on public.payment_orders, public.payment_transactions to authenticated;

-- -----------------------------------------------------------------------------
-- Paid → library opens. Called by the server (service role) only.
-- -----------------------------------------------------------------------------
create or replace function public.grant_paid_subscription(p_order_id uuid, p_payment_ref text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.payment_orders;
  v_start timestamptz;
  v_id uuid;
begin
  select * into v_order from public.payment_orders where id = p_order_id for update;
  if not found then
    raise exception 'payment order % not found', p_order_id;
  end if;
  if v_order.status = 'paid' then
    return v_order.subscription_id;
  end if;
  if v_order.status <> 'pending' then
    raise exception 'payment order is %', v_order.status;
  end if;

  select greatest(now(), coalesce(max(s.expires_at), now())) into v_start
  from public.subscriptions s
  where s.user_id = v_order.user_id and s.status = 'active' and s.expires_at > now();

  insert into public.subscriptions (user_id, plan, starts_at, expires_at, source, payment_ref, note)
  values (
    v_order.user_id, v_order.plan, v_start,
    v_start + make_interval(days => public.subscription_plan_days(v_order.plan)),
    'payment', left(p_payment_ref, 200), 'payment order ' || v_order.id
  )
  returning id into v_id;

  update public.payment_orders set status = 'paid', paid_at = now(), subscription_id = v_id where id = v_order.id;

  insert into public.notifications (user_id, type, title, message)
  values (v_order.user_id, 'subscription', 'To‘lov qabul qilindi', 'Obuna faollashtirildi: kitobning to‘liq matni obuna muddati davomida ochiq.');

  return v_id;
end;
$$;

create or replace function public.revoke_paid_subscription(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.payment_orders;
begin
  select * into v_order from public.payment_orders where id = p_order_id for update;
  if not found or v_order.status = 'refunded' then
    return;
  end if;
  if v_order.subscription_id is not null then
    update public.subscriptions set status = 'refunded' where id = v_order.subscription_id;
  end if;
  update public.payment_orders set status = case when v_order.status = 'paid' then 'refunded' else 'cancelled' end
  where id = v_order.id;
end;
$$;

revoke all on function public.grant_paid_subscription(uuid, text) from public, anon, authenticated;
revoke all on function public.revoke_paid_subscription(uuid) from public, anon, authenticated;
grant execute on function public.grant_paid_subscription(uuid, text) to service_role;
grant execute on function public.revoke_paid_subscription(uuid) to service_role;
