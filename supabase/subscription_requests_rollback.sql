-- Rollback for subscription_requests.sql. Subscriptions already granted stay
-- (their rows only point back to a request in their note).
drop function if exists public.approve_subscription_request(uuid, timestamptz);
drop table if exists public.subscription_requests;
