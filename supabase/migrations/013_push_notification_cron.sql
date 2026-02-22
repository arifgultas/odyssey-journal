-- Migration: Schedule push notification processing
-- This creates a cron job that calls the Edge Function every minute
-- to process the push notification queue.
--
-- Prerequisites:
-- 1. Deploy the Edge Function: supabase functions deploy send-push-notifications
-- 2. Enable pg_cron extension in Supabase Dashboard (Database > Extensions)
-- 3. Run this migration

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the Edge Function to run every minute
SELECT cron.schedule(
    'process-push-notifications',  -- job name
    '* * * * *',                   -- every minute
    $$
    SELECT net.http_post(
        url := (SELECT current_setting('app.settings.supabase_url') || '/functions/v1/send-push-notifications'),
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || (SELECT current_setting('app.settings.service_role_key')),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    ) AS request_id;
    $$
);
