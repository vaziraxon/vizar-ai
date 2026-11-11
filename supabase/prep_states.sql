-- Personal checklist ticks and document readiness test answers, saved to the
-- account so they follow the user across devices (owner approved, 2026-11-12).
--
-- One row per user, destination and visa type. Only what the two tools keep
-- in the browser today: ticked checklist item ids, the user's own extra
-- checklist items (title text), and the A–D answer per document. No files,
-- no document contents, no personal identifiers.
-- Each user sees, saves and deletes only their own rows; deleting the account
-- deletes them (on delete cascade). Adds a table only — nothing else changes.
-- Rollback: supabase/prep_states_rollback.sql

create table if not exists public.prep_states (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  destination text not null check (char_length(destination) between 1 and 40),
  visa_kind text not null check (visa_kind in ('tourist', 'student', 'work', 'business')),
  checklist_done text[] not null default '{}' check (cardinality(checklist_done) <= 200),
  checklist_custom jsonb not null default '[]'::jsonb
    check (jsonb_typeof(checklist_custom) = 'array' and octet_length(checklist_custom::text) <= 20000),
  test_answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(test_answers) = 'object' and octet_length(test_answers::text) <= 10000),
  updated_at timestamptz not null default now(),
  primary key (user_id, destination, visa_kind)
);

alter table public.prep_states enable row level security;

drop policy if exists "prep_states_select_own" on public.prep_states;
create policy "prep_states_select_own" on public.prep_states
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "prep_states_insert_own" on public.prep_states;
create policy "prep_states_insert_own" on public.prep_states
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "prep_states_update_own" on public.prep_states;
create policy "prep_states_update_own" on public.prep_states
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "prep_states_delete_own" on public.prep_states;
create policy "prep_states_delete_own" on public.prep_states
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.prep_states from anon;
grant select, insert, update, delete on public.prep_states to authenticated;
