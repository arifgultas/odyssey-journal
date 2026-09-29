-- Follow System Schema
-- This extends the existing follows table with additional features

-- Add follower/following counts and created_at to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment following count for follower
        UPDATE public.profiles
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;
        
        -- Increment followers count for following
        UPDATE public.profiles
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement following count for follower
        UPDATE public.profiles
        SET following_count = GREATEST(0, following_count - 1)
        WHERE id = OLD.follower_id;
        
        -- Decrement followers count for following
        UPDATE public.profiles
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = OLD.following_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update follow counts
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counts();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at DESC);

-- View for follow suggestions (users not followed yet with most followers)
-- Using security_invoker to respect RLS policies of the querying user
DROP VIEW IF EXISTS public.follow_suggestions;
CREATE VIEW public.follow_suggestions
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.followers_count,
    p.following_count,
    p.updated_at
FROM public.profiles p
WHERE p.id != auth.uid()
AND p.id NOT IN (
    SELECT following_id 
    FROM public.follows 
    WHERE follower_id = auth.uid()
)
ORDER BY p.followers_count DESC, p.updated_at DESC
LIMIT 20;

-- Grant access to authenticated users
GRANT SELECT ON public.follow_suggestions TO authenticated;
