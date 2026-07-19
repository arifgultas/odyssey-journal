-- SQL Migration for Message Requests, Blocked Profiles, Conversation Deletion and Trigger Fixes
BEGIN;

-- 1. Create the message_approvals table
CREATE TABLE IF NOT EXISTS public.message_approvals (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    approved_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, approved_user_id)
);

-- 2. Enable RLS on message_approvals
ALTER TABLE public.message_approvals ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for message_approvals
DROP POLICY IF EXISTS "Users can view their own message approvals" ON public.message_approvals;
CREATE POLICY "Users can view their own message approvals" ON public.message_approvals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own message approvals" ON public.message_approvals;
CREATE POLICY "Users can insert their own message approvals" ON public.message_approvals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own message approvals" ON public.message_approvals;
CREATE POLICY "Users can update their own message approvals" ON public.message_approvals
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own message approvals" ON public.message_approvals;
CREATE POLICY "Users can delete their own message approvals" ON public.message_approvals
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable Realtime for message_approvals
ALTER TABLE public.message_approvals REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'message_approvals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_approvals;
  END IF;
END $$;

-- 5. Add Delete policy to messages if missing
DROP POLICY IF EXISTS "Users can delete messages in their own chats" ON public.messages;
CREATE POLICY "Users can delete messages in their own chats" ON public.messages
    FOR DELETE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 6. Add deleted_by array column to messages to support "delete for me"
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_by UUID[] DEFAULT '{}';

-- 7. Create RPC function to get blocked users' profiles (bypassing profiles RLS select policy)
CREATE OR REPLACE FUNCTION public.get_blocked_users_profiles()
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.full_name, p.avatar_url
  FROM public.profiles p
  JOIN public.user_blocks b ON b.blocked_id = p.id
  WHERE b.blocker_id = auth.uid();
END;
$$;

-- 8. Create RPC function to delete a conversation for the calling user only (delete for me)
CREATE OR REPLACE FUNCTION public.delete_conversation_for_user(other_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete explicit approval if any
  DELETE FROM public.message_approvals
  WHERE user_id = auth.uid() AND approved_user_id = other_user_id;

  -- Append auth.uid() to deleted_by array for all messages in the conversation
  -- Using COALESCE to handle any existing NULL values safely
  UPDATE public.messages
  SET deleted_by = array_append(COALESCE(deleted_by, '{}'::uuid[]), auth.uid())
  WHERE (sender_id = auth.uid() AND receiver_id = other_user_id)
     OR (sender_id = other_user_id AND receiver_id = auth.uid());
END;
$$;

-- 9. Fix search path and schema qualification for update_follower_counts
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following_count for follower
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    
    -- Increment followers_count for following
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following_count for follower
    UPDATE public.profiles
    SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = OLD.follower_id;
    
    -- Decrement followers_count for following
    UPDATE public.profiles
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.following_id;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 10. Fix search path and schema qualification for update_post_counts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET posts_count = posts_count + 1
    WHERE id = NEW.user_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET posts_count = GREATEST(posts_count - 1, 0)
    WHERE id = OLD.user_id;
  END IF;
  
  RETURN NULL;
END;
$$;

COMMIT;
