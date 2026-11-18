-- Backstop for the voice interview limit: every minute, ask the site to close
-- voice sessions whose browser went silent or whose time ran out (and hang up
-- their OpenAI calls). Every voice request already does this; the job covers a
-- browser that keeps a call open without checking in.
--
-- Apply ONLY together with the production launch of the AI beta (owner's
-- approval), after supabase/ai_beta.sql. Needs the pg_cron and pg_net
-- extensions (both available on the Supabase Free plan).
-- Rollback: select cron.unschedule('vizar-voice-sweep');

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'vizar-voice-sweep',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://vizarai.com/api/voice/sweep',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sweep-token', (select sweep_token::text from public.ai_settings where id = 1)
    ),
    body := '{}'::jsonb
  )
  where exists (select 1 from public.voice_sessions where ended_at is null);
  $$
);
