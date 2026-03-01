-- Admin System Migration
-- Adds admin/ban functionality for content moderation

BEGIN;

-- 1. Add admin and ban flags to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- 2. Admin RLS: Allow admins to view ALL reports
CREATE POLICY "Admins can view all reports"
    ON public.reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 3. Admin RLS: Allow admins to update report status
CREATE POLICY "Admins can update reports"
    ON public.reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. Prevent banned users from creating posts
CREATE OR REPLACE FUNCTION public.check_user_not_banned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = NEW.user_id AND is_banned = true
    ) THEN
        RAISE EXCEPTION 'Your account has been suspended. You cannot perform this action.';
    END IF;
    RETURN NEW;
END;
$$;

-- 5. Ban check trigger on posts
DROP TRIGGER IF EXISTS enforce_ban_on_posts ON public.posts;
CREATE TRIGGER enforce_ban_on_posts
    BEFORE INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_not_banned();

-- 6. Ban check trigger on comments
DROP TRIGGER IF EXISTS enforce_ban_on_comments ON public.comments;
CREATE TRIGGER enforce_ban_on_comments
    BEFORE INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_not_banned();

-- 7. Hide banned users' posts from public view
DROP POLICY IF EXISTS "Posts are viewable by unblocked users" ON public.posts;
CREATE POLICY "Posts are viewable by unblocked unbanned users"
    ON public.posts FOR SELECT
    USING (
        NOT public.is_blocked_by(auth.uid(), user_id)
        AND NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = posts.user_id AND is_banned = true
        )
    );

-- 8. Admin function to delete a post (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_delete_post(target_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Verify caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Delete the post (cascades to likes, comments, bookmarks)
    DELETE FROM public.posts WHERE id = target_post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_post(UUID) TO authenticated;

-- 9. Admin function to ban a user
CREATE OR REPLACE FUNCTION public.admin_ban_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Verify caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Cannot ban yourself
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot ban yourself';
    END IF;

    -- Ban the user
    UPDATE public.profiles
    SET is_banned = true, banned_at = NOW()
    WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_ban_user(UUID) TO authenticated;

-- 10. Admin function to unban a user
CREATE OR REPLACE FUNCTION public.admin_unban_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Verify caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    UPDATE public.profiles
    SET is_banned = false, banned_at = NULL
    WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_unban_user(UUID) TO authenticated;

COMMIT;
