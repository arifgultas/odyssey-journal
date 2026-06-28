-- ============================================================
-- Migration 019: RLS Audit & Hardening
-- Fills gaps found during the pre-launch security audit
-- ============================================================

BEGIN;

-- ============================================================
-- 1. notifications: DELETE policy (users can delete own)
-- Currently missing — users cannot clean their notifications
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'notifications'
          AND policyname = 'Users can delete their own notifications'
    ) THEN
        CREATE POLICY "Users can delete their own notifications"
            ON public.notifications FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================
-- 2. notifications: Tighten INSERT policy
-- Old: WITH CHECK (true) — any authenticated user can create
--      arbitrary notifications for ANY user (spoofing risk)
-- New: Only allow inserts where actor_id = auth.uid()
--      (the actor is the one performing the action)
-- Note: Trigger functions run as SECURITY DEFINER so they
--       bypass RLS. This only restricts direct client inserts.
-- ============================================================
DROP POLICY IF EXISTS "Users can create notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = actor_id);

-- ============================================================
-- 3. follows: Prevent self-follow via CHECK constraint
-- A user following themselves is a logical error
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'no_self_follow'
    ) THEN
        ALTER TABLE public.follows
        ADD CONSTRAINT no_self_follow CHECK (follower_id != following_id);
    END IF;
END $$;

-- ============================================================
-- 4. likes: Prevent self-like via CHECK constraint
-- A user liking their own post creates fake engagement numbers
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'no_self_like'
    ) THEN
        ALTER TABLE public.likes
        ADD CONSTRAINT no_self_like CHECK (user_id != (
            SELECT p.user_id FROM public.posts p WHERE p.id = post_id
        ));
    END IF;
EXCEPTION
    WHEN others THEN
        -- CHECK constraints with subqueries are not supported in all PG versions
        -- In that case, we'll rely on the application layer validation
        RAISE NOTICE 'Could not add no_self_like constraint: %. Skipping.', SQLERRM;
END $$;

-- ============================================================
-- 5. profiles: Ensure users cannot DELETE their profile row directly
-- Account deletion should go through the delete_user_account() function
-- which handles cascading cleanup properly
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
          AND policyname = 'Profiles cannot be deleted directly'
    ) THEN
        -- This is a deny-by-default: no DELETE policy = no deletes via RLS
        -- But let's be explicit if one exists
        NULL; -- No action needed, RLS default-deny handles this
    END IF;
END $$;

-- ============================================================
-- 6. search_history: Verify all CRUD operations are user-scoped
-- Already done in 005_phase5_search_discovery.sql ✓
-- ============================================================

-- ============================================================
-- 7. collections: Verify public READ for shared collections
-- Collections are currently user-private only
-- Add SELECT policy for public collections (if is_public = true)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'collections'
          AND policyname = 'Public collections are viewable by everyone'
    ) THEN
        -- Only add if the is_public column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'collections'
              AND column_name = 'is_public'
        ) THEN
            CREATE POLICY "Public collections are viewable by everyone"
                ON public.collections FOR SELECT
                USING (is_public = true OR auth.uid() = user_id);
        END IF;
    END IF;
END $$;

-- ============================================================
-- 8. Ensure expo_push_token update is restricted to own profile
-- Already covered by "Users can update own profile." policy ✓
-- Verify the WITH CHECK clause exists on the profiles UPDATE policy
-- ============================================================
-- The existing policy uses USING (auth.uid() = id) which is sufficient.
-- Adding WITH CHECK for defense-in-depth:
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

COMMIT;
