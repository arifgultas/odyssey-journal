-- Enhanced Comment System Schema
-- Adds automatic comment count updates and additional features

-- Function to update comment counts on posts table
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET comments_count = GREATEST(0, comments_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update comments_count
DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.comments;
CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- Add update policy for comment editing (optional)
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance (if not already created)
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- View for comments with user info
CREATE OR REPLACE VIEW comments_with_users AS
SELECT 
    c.id,
    c.post_id,
    c.user_id,
    c.content,
    c.created_at,
    p.username,
    p.full_name,
    p.avatar_url
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC;
