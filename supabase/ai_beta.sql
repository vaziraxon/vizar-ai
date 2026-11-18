-- Free AI beta for up to 25 invited users (owner approved, 2026-11-11):
--   * Claude written visa adviser — 20 requests per user per day (Asia/Tashkent)
--   * OpenAI live voice interview — 15 minutes per user per week, reset every
--     Monday 00:00 Asia/Tashkent, unused minutes do not carry over
--   * a monthly API budget the admin sets; new AI work stops when it is reached
--
-- Adds tables and one helper only; nothing existing changes.
-- All accounting is written by the server with the service role key; signed-in
-- users can only read their own rows. No audio and no transcripts are stored:
-- a voice session keeps its times, settings, cost and the final evaluation.
-- Rollback: supabase/ai_beta_rollback.sql

-- Who is in the beta (at most 25)
create table if not exists public.ai_beta_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text check (note is null or char_length(note) <= 200),
  added_at timestamptz not null default now()
);

create or replace function public.ai_beta_users_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.ai_beta_users) >= 25 then
    raise exception 'AI beta is limited to 25 users' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists ai_beta_users_cap on public.ai_beta_users;
create trigger ai_beta_users_cap before insert on public.ai_beta_users
  for each row execute function public.ai_beta_users_cap();

-- One row of settings the admin controls
create table if not exists public.ai_settings (
  id smallint primary key default 1 check (id = 1),
  monthly_budget_usd numeric(10, 2) not null default 5 check (monthly_budget_usd between 0 and 1000),
  claude_enabled boolean not null default true,
  voice_enabled boolean not null default true,
  voice_model text not null default 'gpt-realtime-2.1-mini'
    check (voice_model in ('gpt-realtime-2.1-mini', 'gpt-live-1')),
  sweep_token uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);
insert into public.ai_settings (id) values (1) on conflict (id) do nothing;

-- Every paid call: who, which provider and feature, how much
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  provider text not null check (provider in ('anthropic', 'openai')),
  feature text not null check (feature in ('kb_answer', 'doc_advice', 'voice_session', 'voice_eval')),
  model text not null check (char_length(model) <= 60),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  seconds integer not null default 0 check (seconds >= 0),
  cost_usd numeric(12, 6) not null default 0 check (cost_usd >= 0),
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_created_idx on public.ai_usage (created_at);
create index if not exists ai_usage_user_created_idx on public.ai_usage (user_id, created_at);

-- Voice interview sessions (times are the server's clock, never the browser's)
create table if not exists public.voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  model text not null check (model in ('gpt-realtime-2.1-mini', 'gpt-live-1')),
  remote_id text check (remote_id is null or char_length(remote_id) <= 200),
  destination text not null check (char_length(destination) between 1 and 40),
  visa_kind text not null check (visa_kind in ('tourist', 'student', 'work', 'business')),
  language text not null check (language in ('uz', 'ru', 'en')),
  level text not null check (level in ('easy', 'medium', 'hard')),
  started_at timestamptz not null default now(),
  deadline_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz,
  end_reason text check (end_reason is null or char_length(end_reason) <= 40),
  seconds_used integer check (seconds_used is null or seconds_used >= 0),
  cost_usd numeric(12, 6),
  evaluation jsonb check (evaluation is null or octet_length(evaluation::text) <= 20000),
  check (deadline_at > started_at)
);
-- One active session per user, enforced by the database
create unique index if not exists voice_sessions_one_active
  on public.voice_sessions (user_id) where ended_at is null;
create index if not exists voice_sessions_user_started_idx on public.voice_sessions (user_id, started_at desc);

-- Row level security: users read their own rows, editors read everything.
-- No insert/update/delete policies: only the server (service role) writes.
alter table public.ai_beta_users enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ai_usage enable row level security;
alter table public.voice_sessions enable row level security;

drop policy if exists "ai_beta_users_select" on public.ai_beta_users;
create policy "ai_beta_users_select" on public.ai_beta_users
  for select to authenticated using ((select auth.uid()) = user_id or (select public.is_site_editor()));

drop policy if exists "ai_usage_select" on public.ai_usage;
create policy "ai_usage_select" on public.ai_usage
  for select to authenticated using ((select auth.uid()) = user_id or (select public.is_site_editor()));

drop policy if exists "voice_sessions_select" on public.voice_sessions;
create policy "voice_sessions_select" on public.voice_sessions
  for select to authenticated using ((select auth.uid()) = user_id or (select public.is_site_editor()));

-- ai_settings holds the sweep token: no policy at all, server only.

-- Supabase grants everything (TRUNCATE included, which RLS doesn't cover) by
-- default: take it all back, then give signed-in users reads only.
revoke all on public.ai_beta_users, public.ai_settings, public.ai_usage, public.voice_sessions from anon, authenticated;
grant select on public.ai_beta_users, public.ai_usage to authenticated;
-- Every column except remote_id: the OpenAI call id stays on the server
grant select (id, user_id, model, destination, visa_kind, language, level, started_at, deadline_at,
  last_seen_at, ended_at, end_reason, seconds_used, cost_usd, evaluation)
  on public.voice_sessions to authenticated;
revoke execute on function public.ai_beta_users_cap() from public, anon, authenticated;
