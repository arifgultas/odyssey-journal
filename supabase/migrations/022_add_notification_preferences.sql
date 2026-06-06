-- Add notification_preferences column to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"likes": true, "comments": true, "follows": true}'::jsonb;
