-- Direct Messaging system tables, policies, and realtime subscription.

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Select policy: users can view messages they sent or received
DROP POLICY IF EXISTS "Users can read their own sent and received messages" ON public.messages;
CREATE POLICY "Users can read their own sent and received messages" ON public.messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Insert policy: users can send messages as themselves
DROP POLICY IF EXISTS "Users can insert messages as themselves" ON public.messages;
CREATE POLICY "Users can insert messages as themselves" ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Create index on chat streams to optimize conversations query
CREATE INDEX IF NOT EXISTS idx_messages_chat_flow 
ON public.messages (sender_id, receiver_id, created_at DESC);

-- Enable Realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- Update policy: users can update messages they received to mark them as read
DROP POLICY IF EXISTS "Users can update messages they received" ON public.messages;
CREATE POLICY "Users can update messages they received" ON public.messages
    FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- Enable Realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Enable Realtime for posts table
ALTER TABLE public.posts REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
END $$;
