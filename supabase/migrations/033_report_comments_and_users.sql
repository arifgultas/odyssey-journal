-- Build 8, second pass (4 October): users can report comments and other users, not only posts
-- (App Store 1.2: a way to flag objectionable content and abusive users), post owners can remove
-- comments on their own posts, and moderators can delete a reported comment.
BEGIN;

-- =============================================================================================
-- Reports: a post, a comment or a user
-- =============================================================================================
ALTER TABLE public.reports ALTER COLUMN post_id DROP NOT NULL;
ALTER TABLE public.reports
    ADD COLUMN IF NOT EXISTS comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS reported_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_has_target;
ALTER TABLE public.reports ADD CONSTRAINT reports_has_target
    CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL OR reported_user_id IS NOT NULL);

-- UNIQUE(reporter_id, post_id) stays for posts (NULLs never collide). One report per comment and
-- per user-only report, per reporter. A user's several posts can each be reported, so the user
-- uniqueness applies to profile reports only.
CREATE UNIQUE INDEX IF NOT EXISTS reports_one_per_comment
    ON public.reports (reporter_id, comment_id) WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS reports_one_per_user
    ON public.reports (reporter_id, reported_user_id) WHERE post_id IS NULL AND comment_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports (reported_user_id);

-- reported_user_id is always the author of the reported post or comment, set here rather than
-- trusted from the client. It is what the moderator bans, and it stays usable when the post itself
-- is hidden from the moderator (author banned or blocked: the posts SELECT policy, 018).
CREATE OR REPLACE FUNCTION public.set_report_target_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.comment_id IS NOT NULL THEN
        SELECT c.user_id INTO NEW.reported_user_id
        FROM public.comments c WHERE c.id = NEW.comment_id;
        -- A comment report is about the comment, not its post (the comment row still points to
        -- the post); a post_id here would also make the reporter's own post uniqueness collide
        NEW.post_id := NULL;
    ELSIF NEW.post_id IS NOT NULL THEN
        SELECT p.user_id INTO NEW.reported_user_id FROM public.posts p WHERE p.id = NEW.post_id;
    END IF;

    IF NEW.reported_user_id IS NULL THEN
        RAISE EXCEPTION 'Nothing to report';
    END IF;
    IF NEW.reported_user_id = NEW.reporter_id THEN
        RAISE EXCEPTION 'You cannot report yourself';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_report_target_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS set_report_target_user ON public.reports;
CREATE TRIGGER set_report_target_user
    BEFORE INSERT ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.set_report_target_user();

-- Existing post reports get their author
UPDATE public.reports r
SET reported_user_id = p.user_id
FROM public.posts p
WHERE r.post_id = p.id AND r.reported_user_id IS NULL;

-- =============================================================================================
-- Comments: the post's owner can remove other people's comments on it
-- =============================================================================================
DROP POLICY IF EXISTS "Post owners can delete comments on their posts" ON public.comments;
CREATE POLICY "Post owners can delete comments on their posts"
    ON public.comments FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND p.user_id = auth.uid()
    ));

-- =============================================================================================
-- Moderators: delete a reported comment (bypasses the owner-only DELETE policies)
-- =============================================================================================
CREATE OR REPLACE FUNCTION public.admin_delete_comment(target_comment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    DELETE FROM public.comments WHERE id = target_comment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_comment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_comment(uuid) TO authenticated;

COMMIT;
