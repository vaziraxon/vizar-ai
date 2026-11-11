-- Rollback for supabase/prep_states.sql. Drops only the new table; the
-- checklist and test keep working from the browser's own storage.
drop table if exists public.prep_states;
