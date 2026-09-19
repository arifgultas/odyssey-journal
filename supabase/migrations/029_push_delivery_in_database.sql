-- Deliver queued push notifications from the database itself.
--
-- Until now a pg_cron job (013) called the send-push-notifications Edge Function with
-- current_setting('app.settings.service_role_key'). That setting was never present on the
-- hosted project, so the call never authenticated and nothing was ever delivered: every row in
-- push_notification_queue was still sent = false when this was written (the oldest from June).
--
-- It also tied push to the legacy service_role JWT, which has to be switched off before release
-- (the key was exposed). Posting to Expo straight from Postgres with pg_net removes both
-- problems: no Edge Function hop and no API key at all. Expo's push endpoint needs no
-- credentials unless enhanced push security is turned on for the Expo project.

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.flush_push_queue()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    batch_ids uuid[];
    messages jsonb;
BEGIN
    -- SKIP LOCKED keeps two overlapping runs from sending the same row twice.
    WITH batch AS (
        SELECT id, token, title, body, data
        FROM public.push_notification_queue
        WHERE sent = false
        ORDER BY created_at
        LIMIT 100
        FOR UPDATE SKIP LOCKED
    )
    SELECT
        array_agg(id),
        jsonb_agg(jsonb_build_object(
            'to', token,
            'title', title,
            'body', body,
            'data', COALESCE(data, '{}'::jsonb),
            'sound', 'default',
            'priority', 'high',
            'channelId', 'default'
        ))
    INTO batch_ids, messages
    FROM batch;

    IF batch_ids IS NULL THEN
        RETURN 0;
    END IF;

    -- Expo accepts up to 100 messages per request, which is the batch size above.
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        body := messages,
        headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
    );

    UPDATE public.push_notification_queue SET sent = true WHERE id = ANY (batch_ids);
    RETURN array_length(batch_ids, 1);
END;
$$;

REVOKE ALL ON FUNCTION public.flush_push_queue() FROM PUBLIC, anon, authenticated;

-- Rows that piled up while delivery was broken are stale; sending a months-old "liked your
-- post" now would only confuse. Anything older than a day is retired unsent.
UPDATE public.push_notification_queue
SET sent = true
WHERE sent = false AND created_at < NOW() - INTERVAL '1 day';

-- Same job name as 013: cron.schedule replaces the existing job's command in place.
SELECT cron.schedule(
    'process-push-notifications',
    '* * * * *',
    $$SELECT public.flush_push_queue();$$
);
