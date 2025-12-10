-- Enhanced Notification System Schema
-- Adds automatic notification creation triggers and additional features

-- Function to create notification for new like
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Don't create notification if user likes their own post
    IF (SELECT user_id FROM public.posts WHERE id = NEW.post_id) != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (
            (SELECT user_id FROM public.posts WHERE id = NEW.post_id),
            NEW.user_id,
            'like',
            NEW.post_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for new comment
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Don't create notification if user comments on their own post
    IF (SELECT user_id FROM public.posts WHERE id = NEW.post_id) != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (
            (SELECT user_id FROM public.posts WHERE id = NEW.post_id),
            NEW.user_id,
            'comment',
            NEW.post_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for new follow
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    VALUES (
        NEW.following_id,
        NEW.follower_id,
        'follow',
        NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic notification creation
DROP TRIGGER IF EXISTS trigger_like_notification ON public.likes;
CREATE TRIGGER trigger_like_notification
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION create_like_notification();

DROP TRIGGER IF EXISTS trigger_comment_notification ON public.comments;
CREATE TRIGGER trigger_comment_notification
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION create_comment_notification();

DROP TRIGGER IF EXISTS trigger_follow_notification ON public.follows;
CREATE TRIGGER trigger_follow_notification
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION create_follow_notification();

-- Function to delete notifications when action is undone
CREATE OR REPLACE FUNCTION delete_like_notification()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE type = 'like'
    AND post_id = OLD.post_id
    AND actor_id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE type = 'follow'
    AND user_id = OLD.following_id
    AND actor_id = OLD.follower_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for notification cleanup
DROP TRIGGER IF EXISTS trigger_unlike_notification ON public.likes;
CREATE TRIGGER trigger_unlike_notification
    AFTER DELETE ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION delete_like_notification();

DROP TRIGGER IF EXISTS trigger_unfollow_notification ON public.follows;
CREATE TRIGGER trigger_unfollow_notification
    AFTER DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION delete_follow_notification();

-- View for notifications with actor info
CREATE OR REPLACE VIEW notifications_with_actors AS
SELECT 
    n.id,
    n.user_id,
    n.actor_id,
    n.type,
    n.post_id,
    n.read,
    n.created_at,
    p.username as actor_username,
    p.full_name as actor_full_name,
    p.avatar_url as actor_avatar_url,
    posts.title as post_title,
    posts.images as post_images
FROM public.notifications n
LEFT JOIN public.profiles p ON n.actor_id = p.id
LEFT JOIN public.posts ON n.post_id = posts.id
ORDER BY n.created_at DESC;

-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
