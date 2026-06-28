-- Update notification trigger functions to respect user notification_preferences

-- 1. Like notifications
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id uuid;
    likes_enabled boolean := true;
BEGIN
    target_user_id := (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
    
    -- Check if notifications are enabled for likes in target user's preferences
    SELECT COALESCE((notification_preferences->>'likes')::boolean, true) 
    INTO likes_enabled 
    FROM public.profiles 
    WHERE id = target_user_id;

    -- Don't create notification if user likes their own post or has disabled like notifications
    IF target_user_id != NEW.user_id AND likes_enabled THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (target_user_id, NEW.user_id, 'like', NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. Comment notifications
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id uuid;
    comments_enabled boolean := true;
BEGIN
    target_user_id := (SELECT user_id FROM public.posts WHERE id = NEW.post_id);

    -- Check if notifications are enabled for comments in target user's preferences
    SELECT COALESCE((notification_preferences->>'comments')::boolean, true) 
    INTO comments_enabled 
    FROM public.profiles 
    WHERE id = target_user_id;

    -- Don't create notification if user comments on their own post or has disabled comment notifications
    IF target_user_id != NEW.user_id AND comments_enabled THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (target_user_id, NEW.user_id, 'comment', NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. Follow notifications
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
    follows_enabled boolean := true;
BEGIN
    -- Check if notifications are enabled for follows in target user's preferences
    SELECT COALESCE((notification_preferences->>'follows')::boolean, true) 
    INTO follows_enabled 
    FROM public.profiles 
    WHERE id = NEW.following_id;

    IF follows_enabled THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (NEW.following_id, NEW.follower_id, 'follow', NULL);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
