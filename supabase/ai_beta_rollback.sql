-- Rollback for supabase/ai_beta.sql: removes the AI beta tables and helper.
-- Deletes beta membership, usage records and voice session history.
drop table if exists public.voice_sessions;
drop table if exists public.ai_usage;
drop table if exists public.ai_settings;
drop table if exists public.ai_beta_users;
drop function if exists public.ai_beta_users_cap();
