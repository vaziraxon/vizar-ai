-- =============================================================================
-- Rollback for supabase/interview_questions.sql
-- =============================================================================
-- Deletes every interview question. The practice page then shows its loading
-- error until the table is created and loaded again. Practice history is in
-- the user's browser and is not affected.
-- =============================================================================

drop function if exists public.interview_questions_import(text, jsonb);
drop table if exists public.interview_questions;
