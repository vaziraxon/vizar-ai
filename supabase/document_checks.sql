-- Document readiness test results (owner approved, 2026-11-08).
--
-- One row per saved test: the destination and visa type, the user's own
-- answer for each document (A–D) and the counts computed from them on the
-- server. No files, no document contents, no personal identifiers.
-- Each user sees, saves and deletes only their own rows; a row can point only
-- at the user's own application.

create table if not exists public.document_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  application_id uuid references public.visa_applications (id) on delete set null,
  destination text not null check (char_length(destination) between 1 and 40),
  visa_kind text not null check (visa_kind in ('tourist', 'student', 'work', 'business')),
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  ready_count smallint not null check (ready_count >= 0),
  partial_count smallint not null check (partial_count >= 0),
  preparing_count smallint not null check (preparing_count >= 0),
  missing_count smallint not null check (missing_count >= 0),
  total_count smallint not null check (total_count between 1 and 60),
  readiness_percent smallint not null check (readiness_percent between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists document_checks_user_created_idx on public.document_checks (user_id, created_at desc);

alter table public.document_checks enable row level security;

drop policy if exists "document_checks_select_own" on public.document_checks;
create policy "document_checks_select_own" on public.document_checks
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "document_checks_insert_own" on public.document_checks;
create policy "document_checks_insert_own" on public.document_checks
  for insert to authenticated with check (
    auth.uid() = user_id
    and (
      application_id is null
      or exists (select 1 from public.visa_applications a where a.id = application_id and a.user_id = auth.uid())
    )
  );

drop policy if exists "document_checks_delete_own" on public.document_checks;
create policy "document_checks_delete_own" on public.document_checks
  for delete to authenticated using (auth.uid() = user_id);

-- No update policy: a saved result is a snapshot; a new test saves a new row.
