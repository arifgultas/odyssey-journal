-- ============================================================
-- Migration 020: Bookmarks Update RLS Policy
-- Adds UPDATE policy for bookmarks to allow updating collection_id
-- ============================================================

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'bookmarks'
          AND policyname = 'Users can update their own bookmarks'
    ) THEN
        CREATE POLICY "Users can update their own bookmarks"
            ON public.bookmarks FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

COMMIT;
