-- Disable the trigger if needed, but here we just create tables and policies
BEGIN;

-- 1. Create the user_blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id)
);

-- 2. Enable RLS on user_blocks
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- 3. Policies for user_blocks
-- Users can see blocks where they are the blocker or the blocked
CREATE POLICY "Users can view their own blocks"
ON public.user_blocks FOR SELECT
USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

-- Users can only insert blocks for themselves
CREATE POLICY "Users can block others"
ON public.user_blocks FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock (delete) their own blocks
CREATE POLICY "Users can unblock others"
ON public.user_blocks FOR DELETE
USING (auth.uid() = blocker_id);


-- 4. Helper function to check if users are blocking each other
-- Used for efficiency in RLS policies to avoid circular dependencies
CREATE OR REPLACE FUNCTION public.is_blocked_by(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Run as invoker to bypass RLS for this specific check, preventing infinite recursion
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
$$;

-- 5. Update Policies for `profiles`
-- Drop existing select policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
-- Recreate with blocking check
CREATE POLICY "Public profiles are viewable by unblocked users."
ON public.profiles FOR SELECT
USING (
  NOT public.is_blocked_by(auth.uid(), id)
);

-- 6. Update Policies for `posts`
DROP POLICY IF EXISTS "Public posts are viewable by everyone." ON public.posts;
CREATE POLICY "Posts are viewable by unblocked users"
ON public.posts FOR SELECT
USING (
  NOT public.is_blocked_by(auth.uid(), user_id)
);

-- 7. Update Policies for `comments`
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
CREATE POLICY "Comments are viewable by unblocked users"
ON public.comments FOR SELECT
USING (
  NOT public.is_blocked_by(auth.uid(), user_id)
);

-- Note: user_blocks cleanup handled by ON DELETE CASCADE on profiles table.
-- Also, when retrieving notifications, we don't necessarily need to hide old ones, 
-- but future ones won't be created anyway because they can't see the posts/profiles.

-- 8. Add trigger to remove follow relationship if users block each other
CREATE OR REPLACE FUNCTION public.handle_user_block()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If A blocks B, remove any follow relationships between A and B
  DELETE FROM public.follows 
  WHERE (follower_id = NEW.blocker_id AND following_id = NEW.blocked_id)
     OR (follower_id = NEW.blocked_id AND following_id = NEW.blocker_id);
     
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_block
  AFTER INSERT ON public.user_blocks
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_block();

COMMIT;
