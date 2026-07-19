-- =============================================================================
-- VIZAR AI — Stage 6 database schema
-- =============================================================================
-- Run this in the Supabase SQL Editor for a fresh project (see
-- SUPABASE_SETUP.md for the full walkthrough). This file is idempotent
-- where practical (uses IF NOT EXISTS / OR REPLACE) so it can be
-- re-run safely during setup.
--
-- SENSITIVE DATA NOTE (read before adding new columns):
-- This schema deliberately does NOT store passport numbers, passport
-- scan contents, bank account numbers, or other sensitive identity
-- data as plain columns anywhere. `documents.storage_path` only points
-- to a file in private Storage (see supabase/storage.sql) — the
-- actual bytes never touch Postgres. `assessments.answers` and
-- `documents.analysis_summary` are JSONB "demo" fields and must stay
-- limited to non-sensitive, coarse-grained values (e.g. "bank balance
-- range: high/medium/low", not an actual account number). Before
-- storing anything more sensitive than that, get a privacy review —
-- see the TODOs in Section 16 of the Stage 6 brief and in
-- SUPABASE_SETUP.md.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  preferred_language text not null default 'uz' check (preferred_language in ('uz','ru','en')),
  account_type text not null default 'individual' check (account_type in ('individual','agency')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth.users row. Never add passport numbers, scan contents, or bank account numbers here.';

-- -----------------------------------------------------------------------------
-- visa_applications
-- -----------------------------------------------------------------------------
create table if not exists public.visa_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_country text not null,
  visa_type text not null,
  travel_purpose text,
  travel_date date,
  status text not null default 'draft'
    check (status in ('draft','in_review','ready','needs_consultation','completed')),
  readiness_score integer check (readiness_score is null or readiness_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_visa_applications_user_id on public.visa_applications(user_id);
create index if not exists idx_visa_applications_status on public.visa_applications(status);

-- -----------------------------------------------------------------------------
-- assessments
-- -----------------------------------------------------------------------------
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.visa_applications(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score integer check (score is null or score between 0 and 100),
  risk_level text check (risk_level is null or risk_level in ('Past','O''rta','Yuqori')),
  result_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.assessments.answers is
  'Demo assessment answers as coarse-grained JSON only — no raw sensitive identifiers.';

create index if not exists idx_assessments_user_id on public.assessments(user_id);
create index if not exists idx_assessments_application_id on public.assessments(application_id);

-- -----------------------------------------------------------------------------
-- documents  (metadata only — file bytes live in Storage, see storage.sql)
-- -----------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.visa_applications(id) on delete cascade,
  document_type text not null,
  original_filename text,
  storage_path text,
  mime_type text,
  file_size bigint check (file_size is null or file_size <= 6291456), -- 6 MB
  status text not null default 'uploaded'
    check (status in ('uploaded','analyzing','issue_found','verified','expired')),
  analysis_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.documents is
  'Metadata only. storage_path points into the private visa-documents bucket — never store file bytes here.';
comment on column public.documents.analysis_summary is
  'Simulated/demo AI analysis output only, for the current MVP. Must stay clearly labeled as demo in the UI.';

create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_application_id on public.documents(application_id);

-- -----------------------------------------------------------------------------
-- interview_sessions
-- -----------------------------------------------------------------------------
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.visa_applications(id) on delete cascade,
  country text,
  visa_type text,
  difficulty text check (difficulty is null or difficulty in ('Oson','O''rtacha','Qiyin')),
  answers jsonb not null default '[]'::jsonb,
  score integer check (score is null or score between 0 and 100),
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_interview_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_interview_sessions_application_id on public.interview_sessions(application_id);

-- -----------------------------------------------------------------------------
-- recommendations
-- -----------------------------------------------------------------------------
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.visa_applications(id) on delete cascade,
  title text not null,
  description text,
  priority text check (priority is null or priority in ('Muhim','O''rtacha','Past')),
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recommendations_user_id on public.recommendations(user_id);
create index if not exists idx_recommendations_application_id on public.recommendations(application_id);

-- -----------------------------------------------------------------------------
-- consultations
-- -----------------------------------------------------------------------------
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.visa_applications(id) on delete set null,
  specialist_name text,
  scheduled_at timestamptz,
  status text not null default 'booked'
    check (status in ('booked','cancelled','completed')),
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.consultations is
  'Demo specialists and time slots only — no real availability or payment system behind this table yet.';

create index if not exists idx_consultations_user_id on public.consultations(user_id);

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_user_unread
  on public.notifications(user_id) where is_read = false;

-- -----------------------------------------------------------------------------
-- reports
-- -----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.visa_applications(id) on delete cascade,
  report_type text,
  title text,
  report_data jsonb not null default '{}'::jsonb,
  status text not null default 'ready' check (status in ('ready','generating')),
  created_at timestamptz not null default now()
);

comment on column public.reports.report_data is
  'Demo report content (JSON). No real PDF generation backs this yet — the UI renders it as a printable HTML preview.';

create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_application_id on public.reports(application_id);

-- -----------------------------------------------------------------------------
-- agency_members  (kept minimal on purpose — see RLS notes below)
-- -----------------------------------------------------------------------------
create table if not exists public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_owner_id uuid not null references auth.users(id) on delete cascade,
  member_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'specialist' check (role in ('owner','specialist')),
  created_at timestamptz not null default now(),
  unique (agency_owner_id, member_user_id)
);

create index if not exists idx_agency_members_owner on public.agency_members(agency_owner_id);
create index if not exists idx_agency_members_member on public.agency_members(member_user_id);

-- -----------------------------------------------------------------------------
-- agency_clients
-- -----------------------------------------------------------------------------
create table if not exists public.agency_clients (
  id uuid primary key default gen_random_uuid(),
  agency_owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  destination_country text,
  visa_type text,
  readiness_score integer check (readiness_score is null or readiness_score between 0 and 100),
  status text not null default 'active'
    check (status in ('active','needs_consultation','completed')),
  assigned_specialist text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.agency_clients is
  'Agency-owned client records. Distinct from auth.users — an agency client is not necessarily a platform user.';

create index if not exists idx_agency_clients_owner on public.agency_clients(agency_owner_id);

-- =============================================================================
-- updated_at triggers
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'visa_applications', 'assessments', 'documents',
    'recommendations', 'agency_clients'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; ' ||
      'create trigger set_updated_at before update on public.%I ' ||
      'for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- =============================================================================
-- auto-create a profile row when a new auth user signs up
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================
-- Every table below is owner-scoped: a row is only visible/writable by
-- the auth.uid() that owns it (via user_id, or agency_owner_id for the
-- agency tables). There is intentionally no `using (true)` /
-- `with check (true)` policy anywhere in this file, and no anonymous
-- (anon-role, unauthenticated) access to any of these tables.

alter table public.profiles enable row level security;
alter table public.visa_applications enable row level security;
alter table public.assessments enable row level security;
alter table public.documents enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.recommendations enable row level security;
alter table public.consultations enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.agency_members enable row level security;
alter table public.agency_clients enable row level security;

-- profiles: a user can read/update only their own row. No insert/delete
-- policy is defined for normal users — rows are created only by the
-- handle_new_user() trigger (which runs as security definer).
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- visa_applications
create policy "visa_applications_select_own" on public.visa_applications
  for select using (auth.uid() = user_id);
create policy "visa_applications_insert_own" on public.visa_applications
  for insert with check (auth.uid() = user_id);
create policy "visa_applications_update_own" on public.visa_applications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "visa_applications_delete_own" on public.visa_applications
  for delete using (auth.uid() = user_id);

-- assessments
create policy "assessments_select_own" on public.assessments
  for select using (auth.uid() = user_id);
create policy "assessments_insert_own" on public.assessments
  for insert with check (auth.uid() = user_id);
create policy "assessments_update_own" on public.assessments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessments_delete_own" on public.assessments
  for delete using (auth.uid() = user_id);

-- documents
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- interview_sessions
create policy "interview_sessions_select_own" on public.interview_sessions
  for select using (auth.uid() = user_id);
create policy "interview_sessions_insert_own" on public.interview_sessions
  for insert with check (auth.uid() = user_id);
create policy "interview_sessions_update_own" on public.interview_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interview_sessions_delete_own" on public.interview_sessions
  for delete using (auth.uid() = user_id);

-- recommendations
create policy "recommendations_select_own" on public.recommendations
  for select using (auth.uid() = user_id);
create policy "recommendations_insert_own" on public.recommendations
  for insert with check (auth.uid() = user_id);
create policy "recommendations_update_own" on public.recommendations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recommendations_delete_own" on public.recommendations
  for delete using (auth.uid() = user_id);

-- consultations
create policy "consultations_select_own" on public.consultations
  for select using (auth.uid() = user_id);
create policy "consultations_insert_own" on public.consultations
  for insert with check (auth.uid() = user_id);
create policy "consultations_update_own" on public.consultations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "consultations_delete_own" on public.consultations
  for delete using (auth.uid() = user_id);

-- notifications (no delete policy — notifications are cleared by
-- marking read, not by client-initiated deletion)
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_insert_own" on public.notifications
  for insert with check (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reports
create policy "reports_select_own" on public.reports
  for select using (auth.uid() = user_id);
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = user_id);
create policy "reports_update_own" on public.reports
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- agency_members: intentionally narrow. A membership row is visible to
-- the agency owner (to manage their team) and to the member themself
-- (to see which agency they belong to). Only the owner may create or
-- remove memberships. This does NOT grant members access to
-- agency_clients — see the note below.
create policy "agency_members_select_owner_or_self" on public.agency_members
  for select using (auth.uid() = agency_owner_id or auth.uid() = member_user_id);
create policy "agency_members_insert_owner_only" on public.agency_members
  for insert with check (auth.uid() = agency_owner_id);
create policy "agency_members_delete_owner_only" on public.agency_members
  for delete using (auth.uid() = agency_owner_id);

-- agency_clients: scoped strictly to the agency owner. We deliberately
-- do NOT extend this to agency_members in this stage — granting
-- members broad client access requires a reviewed, explicit policy
-- (e.g. checked against agency_members.role) which is left as a TODO
-- rather than shipped as a broad "any member can see everything" rule.
create policy "agency_clients_select_owner" on public.agency_clients
  for select using (auth.uid() = agency_owner_id);
create policy "agency_clients_insert_owner" on public.agency_clients
  for insert with check (auth.uid() = agency_owner_id);
create policy "agency_clients_update_owner" on public.agency_clients
  for update using (auth.uid() = agency_owner_id) with check (auth.uid() = agency_owner_id);
create policy "agency_clients_delete_owner" on public.agency_clients
  for delete using (auth.uid() = agency_owner_id);

-- TODO (future stage, requires explicit review before shipping):
--   create policy "agency_clients_select_member" on public.agency_clients
--     for select using (
--       exists (
--         select 1 from public.agency_members m
--         where m.agency_owner_id = agency_clients.agency_owner_id
--           and m.member_user_id = auth.uid()
--       )
--     );
-- Left commented out deliberately — do not enable without deciding
-- exactly which member roles should see which client fields.
