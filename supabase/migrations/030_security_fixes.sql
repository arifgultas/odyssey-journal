-- Pre-release security review fixes (19 September). Findings are listed in FINALIZE.md under
-- "Review bulguları"; the IDs below (K1, Y1, ...) refer to that list.
--
-- Several guards below compare current_user against the API roles. PostgREST runs a client
-- request as 'authenticated' (or 'anon'); SECURITY DEFINER functions and the triggers they fire
-- run as the function owner. So a guard that only acts for the API roles leaves the counter
-- triggers and the admin functions alone, and stops the same change coming from a client.
-- The guard functions are SECURITY INVOKER on purpose: as definers they would always see the owner.

BEGIN;

-- =============================================================================================
-- K1: clients may not write privileged or derived profile columns
-- =============================================================================================
-- The profiles UPDATE policy only checks that the row is yours, so any user could set
-- is_admin = true on their own row, lift their own ban, or rewrite their follower counts.
-- The old values are put back instead of raising, so a build that sends a whole profile object
-- keeps working.

CREATE OR REPLACE FUNCTION public.guard_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF current_user NOT IN ('authenticated', 'anon') THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.is_admin := false;
        NEW.is_banned := false;
        NEW.banned_at := NULL;
        NEW.followers_count := 0;
        NEW.following_count := 0;
    ELSE
        NEW.is_admin := OLD.is_admin;
        NEW.is_banned := OLD.is_banned;
        NEW.banned_at := OLD.banned_at;
        NEW.followers_count := OLD.followers_count;
        NEW.following_count := OLD.following_count;
    END IF;

    -- posts_count came from 004 and may be missing on a project built from FULL_SETUP.sql,
    -- so it is set through jsonb rather than by name.
    IF to_jsonb(NEW) ? 'posts_count' THEN
        NEW := jsonb_populate_record(NEW, jsonb_build_object(
            'posts_count',
            CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(0) ELSE to_jsonb(OLD) -> 'posts_count' END
        ));
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_columns ON public.profiles;
CREATE TRIGGER guard_profile_columns
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_columns();

-- =============================================================================================
-- O7 + O4: post counters, and a server-side insert time for the rate limit
-- =============================================================================================
-- Owners could write likes_count / comments_count on their own posts (trend manipulation).
--
-- The post rate limit counted rows by created_at, which the client sends (it is the travel date
-- picked in the app), so a backdated post never counted. inserted_at is set by the server only.
-- It is added without a default first so existing rows stay NULL: a default of now() would stamp
-- every existing post with the migration time and rate-limit everyone for the next hour.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS inserted_at timestamptz;
ALTER TABLE public.posts ALTER COLUMN inserted_at SET DEFAULT now();

CREATE OR REPLACE FUNCTION public.guard_post_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.inserted_at := now();
    ELSE
        NEW.inserted_at := OLD.inserted_at;
    END IF;

    IF current_user NOT IN ('authenticated', 'anon') THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.likes_count := 0;
        NEW.comments_count := 0;
    ELSE
        NEW.likes_count := OLD.likes_count;
        NEW.comments_count := OLD.comments_count;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_post_columns ON public.posts;
CREATE TRIGGER guard_post_columns
    BEFORE INSERT OR UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.guard_post_columns();

-- Same limits as 016 (stricter for accounts under a day old), counted by inserted_at
CREATE OR REPLACE FUNCTION public.check_post_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    post_count INT;
    max_posts_per_hour INT := 10;
    user_created_at TIMESTAMPTZ;
BEGIN
    SELECT created_at INTO user_created_at FROM public.profiles WHERE id = NEW.user_id;
    IF user_created_at >= NOW() - INTERVAL '24 hours' THEN
        max_posts_per_hour := 3;
    END IF;

    SELECT COUNT(*) INTO post_count
    FROM public.posts
    WHERE user_id = NEW.user_id
      AND inserted_at >= NOW() - INTERVAL '1 hour';

    IF post_count >= max_posts_per_hour THEN
        RAISE EXCEPTION 'Rate limit exceeded: You can only create % posts per hour.', max_posts_per_hour;
    END IF;

    RETURN NEW;
END;
$$;

-- Comments have no backdating feature, so their created_at is simply pinned to the server clock,
-- which keeps the comment rate limit (016) honest.
CREATE OR REPLACE FUNCTION public.pin_comment_created_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := now();
    ELSE
        NEW.created_at := OLD.created_at;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pin_comment_created_at ON public.comments;
CREATE TRIGGER pin_comment_created_at
    BEFORE INSERT OR UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.pin_comment_created_at();

-- =============================================================================================
-- K2: account deletion
-- =============================================================================================
-- 011 deletes from public.interactions, which does not exist on the hosted project, so the RPC
-- failed on every call. Messages, approvals, blocks, search history and push tokens go with the
-- profile row through ON DELETE CASCADE. Storage objects cannot be deleted from SQL on Supabase;
-- the app removes the user's own files through the Storage API before calling this.

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    _user_id uuid;
BEGIN
    _user_id := auth.uid();
    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    DELETE FROM public.notifications WHERE user_id = _user_id OR actor_id = _user_id;
    DELETE FROM public.reports WHERE reporter_id = _user_id;
    DELETE FROM public.comments WHERE user_id = _user_id;
    DELETE FROM public.likes WHERE user_id = _user_id;
    DELETE FROM public.bookmarks WHERE user_id = _user_id;
    DELETE FROM public.collections WHERE user_id = _user_id;
    DELETE FROM public.follows WHERE follower_id = _user_id OR following_id = _user_id;

    DELETE FROM public.likes WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.comments WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.bookmarks WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.posts WHERE user_id = _user_id;

    DELETE FROM public.profiles WHERE id = _user_id;
    DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- =============================================================================================
-- Y1 + Y2: storage
-- =============================================================================================
-- FIX_AVATAR_UPLOAD.sql let every signed-in user update or delete any avatar, because the app
-- stored avatars as 'avatars/<uid>-<time>' and the owner check on the first folder never matched.
-- The app now uploads to '<uid>/<time>.jpg'; the legacy name is still accepted for update/delete
-- so people can replace or remove their existing avatar.
-- The posts bucket accepted uploads to any path.
--
-- Policy names differ between the files that have been run on this project over time, and
-- permissive policies are OR'ed together, so every policy that mentions these two buckets is
-- dropped and the set is rebuilt from scratch.

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND (
              COALESCE(qual, '') || ' ' || COALESCE(with_check, '')
          ) ~ '''(avatars|posts)''::text'
    LOOP
        EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Avatars are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users upload avatars into their own folder"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update their own avatars"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars'
        AND ((storage.foldername(name))[1] = auth.uid()::text
             OR name LIKE 'avatars/' || auth.uid()::text || '-%')
    )
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete their own avatars"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars'
        AND ((storage.foldername(name))[1] = auth.uid()::text
             OR name LIKE 'avatars/' || auth.uid()::text || '-%')
    );

CREATE POLICY "Post images are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'posts');

CREATE POLICY "Users upload post images into their own folder"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete their own post images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Images only, 10 MB (the app compresses to a 1080 px JPEG well under that)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
    file_size_limit = 10485760
WHERE id IN ('avatars', 'posts', 'collection-covers');

-- =============================================================================================
-- Y3 + O5: messages
-- =============================================================================================
-- Blocking did not cover direct messages: a blocked user could keep writing to the person who
-- blocked them.

DROP POLICY IF EXISTS "Users can insert messages as themselves" ON public.messages;
CREATE POLICY "Users can insert messages as themselves" ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND NOT public.is_blocked_by(sender_id, receiver_id)
    );

-- The receiver's UPDATE policy exists to mark messages read, but it let them rewrite the text
-- or the sender of a message. deleted_by is changed by delete_conversation_for_user (a definer).
CREATE OR REPLACE FUNCTION public.guard_message_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF current_user NOT IN ('authenticated', 'anon') THEN
        RETURN NEW;
    END IF;

    NEW.sender_id := OLD.sender_id;
    NEW.receiver_id := OLD.receiver_id;
    NEW.content := OLD.content;
    NEW.created_at := OLD.created_at;
    NEW.deleted_by := OLD.deleted_by;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_message_columns ON public.messages;
CREATE TRIGGER guard_message_columns
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.guard_message_columns();

-- =============================================================================================
-- Y4: notifications are created only by the database triggers
-- =============================================================================================
-- The INSERT policy let any user create a notification (and a push) for any other user, past
-- blocks and notification preferences. The app never inserts notifications itself; every one
-- comes from a SECURITY DEFINER trigger, which does not need a policy.

DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications." ON public.notifications;

-- =============================================================================================
-- Y5: push tokens are no longer readable by other users
-- =============================================================================================
-- expo_push_token sat on profiles, which every signed-in user can read, and Expo's push API
-- accepts a token with no credentials. Tokens move to a table nobody else can read.
--
-- Builds already in testers' hands still write profiles.expo_push_token. A trigger moves such a
-- write into push_tokens and blanks the column, so those builds keep receiving pushes and the
-- token never becomes readable again.

CREATE TABLE IF NOT EXISTS public.push_tokens (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- One device, one account: saving a token takes it away from whoever had it before
    token text NOT NULL UNIQUE,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own push token" ON public.push_tokens;
CREATE POLICY "Users can read their own push token"
    ON public.push_tokens FOR SELECT
    USING (auth.uid() = user_id);
-- Writes go through set_push_token / clear_push_token only.

REVOKE ALL ON public.push_tokens FROM anon;
GRANT SELECT ON public.push_tokens TO authenticated;

-- Existing tokens; when two accounts share a device the most recently updated profile keeps it
INSERT INTO public.push_tokens (user_id, token)
SELECT DISTINCT ON (expo_push_token) id, expo_push_token
FROM public.profiles
WHERE expo_push_token IS NOT NULL AND expo_push_token <> ''
ORDER BY expo_push_token, updated_at DESC NULLS LAST
ON CONFLICT DO NOTHING;

-- Runs before the move trigger below exists, so it does not undo the copy above
UPDATE public.profiles SET expo_push_token = NULL WHERE expo_push_token IS NOT NULL;

CREATE OR REPLACE FUNCTION public.store_push_token(p_user_id uuid, p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF p_token IS NULL OR p_token = '' THEN
        DELETE FROM public.push_tokens WHERE user_id = p_user_id;
        RETURN;
    END IF;

    DELETE FROM public.push_tokens WHERE token = p_token AND user_id <> p_user_id;
    INSERT INTO public.push_tokens (user_id, token, updated_at)
    VALUES (p_user_id, p_token, now())
    ON CONFLICT (user_id) DO UPDATE SET token = EXCLUDED.token, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.store_push_token(uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_push_token(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    PERFORM public.store_push_token(auth.uid(), p_token);
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_push_token()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN;
    END IF;
    DELETE FROM public.push_tokens WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.set_push_token(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.clear_push_token() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_push_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_push_token() TO authenticated;

-- Older builds: a write to profiles.expo_push_token becomes a push_tokens write. RLS has already
-- limited the statement to the caller's own row by the time this BEFORE trigger sees it.
CREATE OR REPLACE FUNCTION public.move_profile_push_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    PERFORM public.store_push_token(NEW.id, NEW.expo_push_token);
    NEW.expo_push_token := NULL;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS move_profile_push_token ON public.profiles;
CREATE TRIGGER move_profile_push_token
    BEFORE UPDATE OF expo_push_token ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.move_profile_push_token();

-- Same as 028, reading the token from push_tokens
CREATE OR REPLACE FUNCTION public.notify_push_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_token TEXT;
    target_lang TEXT;
    actor_name TEXT;
    template TEXT;
BEGIN
    SELECT token INTO target_token
    FROM public.push_tokens
    WHERE user_id = NEW.user_id;

    IF target_token IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(preferred_language, 'en') INTO target_lang
    FROM public.profiles
    WHERE id = NEW.user_id;
    target_lang := COALESCE(target_lang, 'en');

    SELECT COALESCE(full_name, username) INTO actor_name
    FROM public.profiles
    WHERE id = NEW.actor_id;

    IF actor_name IS NULL OR actor_name = '' THEN
        SELECT body_template INTO actor_name
        FROM public.push_notification_texts
        WHERE lang = target_lang AND type = 'actor_fallback';
        actor_name := COALESCE(actor_name, 'Someone');
    END IF;

    SELECT body_template INTO template
    FROM public.push_notification_texts
    WHERE lang = target_lang AND type = NEW.type;

    IF template IS NULL THEN
        SELECT body_template INTO template
        FROM public.push_notification_texts
        WHERE lang = target_lang AND type = 'default';
    END IF;

    IF template IS NULL THEN
        SELECT body_template INTO template
        FROM public.push_notification_texts
        WHERE lang = 'en' AND type = 'default';
    END IF;

    INSERT INTO public.push_notification_queue (token, title, body, data, created_at)
    VALUES (
        target_token,
        'Odyssey Journal',
        replace(COALESCE(template, '{{actor}}'), '{{actor}}', actor_name),
        jsonb_build_object(
            'notification_id', NEW.id,
            'type', NEW.type,
            'post_id', NEW.post_id,
            'actor_id', NEW.actor_id
        ),
        NOW()
    );

    RETURN NEW;
END;
$$;

COMMIT;
