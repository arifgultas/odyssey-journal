-- Migration: Add push notification token to profiles
-- This allows storing the Expo Push Token for each user

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Create index for efficient token lookup
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token
ON public.profiles(expo_push_token)
WHERE expo_push_token IS NOT NULL;

-- Function to send push notification when a new notification is created
-- This is a placeholder - actual push sending should be done via Edge Function or backend
CREATE OR REPLACE FUNCTION public.notify_push_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_token TEXT;
    actor_name TEXT;
BEGIN
    -- Get the push token for the target user
    SELECT expo_push_token INTO target_token
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Get actor name
    SELECT COALESCE(full_name, username, 'Someone') INTO actor_name
    FROM public.profiles
    WHERE id = NEW.actor_id;

    -- If user has a push token, insert into push queue for processing
    IF target_token IS NOT NULL THEN
        INSERT INTO public.push_notification_queue (
            token,
            title,
            body,
            data,
            created_at
        ) VALUES (
            target_token,
            'Odyssey Journal',
            actor_name || CASE NEW.type
                WHEN 'like' THEN ' liked your post'
                WHEN 'comment' THEN ' commented on your post'
                WHEN 'follow' THEN ' started following you'
                WHEN 'mention' THEN ' mentioned you'
                ELSE ' interacted with you'
            END,
            jsonb_build_object(
                'notification_id', NEW.id,
                'type', NEW.type,
                'post_id', NEW.post_id,
                'actor_id', NEW.actor_id
            ),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Push notification queue table
CREATE TABLE IF NOT EXISTS public.push_notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on push queue
ALTER TABLE public.push_notification_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access push queue
CREATE POLICY "Service role can manage push queue"
ON public.push_notification_queue
FOR ALL
USING (auth.role() = 'service_role');

-- Trigger to queue push notifications
DROP TRIGGER IF EXISTS trigger_push_notification ON public.notifications;
CREATE TRIGGER trigger_push_notification
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_push_on_insert();

-- Index for unprocessed notifications
CREATE INDEX IF NOT EXISTS idx_push_queue_unsent
ON public.push_notification_queue(sent, created_at)
WHERE sent = false;
