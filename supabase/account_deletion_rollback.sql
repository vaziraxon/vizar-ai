-- =============================================================================
-- Rollback for supabase/account_deletion.sql
-- =============================================================================
-- Users can no longer delete their own account from the app. Accounts that
-- were already deleted stay deleted.
-- =============================================================================

drop function if exists public.delete_my_account(text);
