-- Rollback for supabase/payments.sql. Deletes payment orders and transactions;
-- subscriptions already granted by payments stay (source = 'payment').
drop function if exists public.revoke_paid_subscription(uuid);
drop function if exists public.grant_paid_subscription(uuid, text);
drop table if exists public.payment_transactions;
drop table if exists public.payment_orders;
