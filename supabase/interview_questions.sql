-- =============================================================================
-- VIZAR AI interview playbook — questions for the dashboard's interview practice
-- =============================================================================
-- 52 countries, 150 questions each (30 easy, 50 medium, 70 hard), in Uzbek,
-- Russian and English. This repository is public, so the questions live only
-- here: signed-in users can read them, and nobody can write them through the
-- API. Rows are loaded with scripts/interview-playbook/import.mjs.
--
-- Rollback: supabase/interview_questions_rollback.sql
-- =============================================================================

create table if not exists public.interview_questions (
  id text primary key,
  country_code text not null,
  level text not null check (level in ('easy', 'medium', 'hard')),
  sort_order integer not null check (sort_order > 0),
  question_uz text not null,
  question_ru text not null,
  question_en text not null,
  -- Samples to adapt: [brackets] mark what the applicant replaces with their own facts.
  answer_uz text not null,
  answer_ru text not null,
  answer_en text not null,
  -- Coaching note; the playbook has it in Uzbek only.
  note text not null,
  unique (country_code, level, sort_order)
);

comment on table public.interview_questions is
  'Interview practice questions from the VIZAR AI playbook. Not official consulate questions. Readable by signed-in users only; loaded with scripts/interview-playbook/import.mjs.';

alter table public.interview_questions enable row level security;

revoke all on table public.interview_questions from public, anon, authenticated;
grant select on table public.interview_questions to authenticated;

drop policy if exists "interview_questions_read" on public.interview_questions;
create policy "interview_questions_read" on public.interview_questions
  for select to authenticated
  using (true);
