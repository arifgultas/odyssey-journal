-- Missing RLS Policies Migration
-- Fixes critical gaps: posts UPDATE/DELETE, comments DELETE, notifications UPDATE

BEGIN;

-- ============================================
-- 1. Posts: UPDATE policy (only own posts)
-- ============================================
CREATE POLICY "Users can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. Posts: DELETE policy (only own posts)
-- ============================================
CREATE POLICY "Users can delete their own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. Comments: DELETE policy (only own comments)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'comments'
          AND policyname = 'Users can delete their own comments'
    ) THEN
        CREATE POLICY "Users can delete their own comments"
            ON public.comments FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- 4. Notifications: UPDATE policy (mark as read)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'notifications'
          AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications"
            ON public.notifications FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END $$;

COMMIT;
