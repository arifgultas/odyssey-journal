-- Law 5651 art. 5/3 (Türkiye): a hosting provider keeps traffic data on user-hosted content for at
-- least one and at most two years. Posts, comments, messages, public profile fields and public
-- collections are content we host for users. Until now nothing recorded who changed them, when
-- or from which IP (the database stores no IPs, the Supabase dashboard logs last about a week).
-- Requested by the site session (SITE_SYNC_2026-10-06b).
--
-- Every write reaches these tables through PostgREST (supabase-js), so a trigger can read the
-- client's address from the request headers. No app change is needed and older builds are covered
-- the moment this runs.
--
-- Rows are kept 365 days, then a daily job deletes them. The table has no foreign key to the user:
-- the law asks for the record to outlive the account, so delete_user_account (030) leaves it alone.
BEGIN;

-- =============================================================================================
-- Table: readable and writable only by the service role / SQL editor
-- =============================================================================================
CREATE TABLE IF NOT EXISTS public.traffic_log (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    user_id uuid,
    ip inet,
    action text NOT NULL,
    table_name text NOT NULL,
    row_id text,
    user_agent text
);

CREATE INDEX IF NOT EXISTS idx_traffic_log_occurred_at ON public.traffic_log (occurred_at);
CREATE INDEX IF NOT EXISTS idx_traffic_log_user_id ON public.traffic_log (user_id);

-- RLS on with no policy: anon and authenticated can neither read nor write
ALTER TABLE public.traffic_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.traffic_log FROM anon, authenticated;

-- =============================================================================================
-- Trigger function
-- =============================================================================================
-- TG_ARGV holds the columns whose change alone is not a content change (counters, read flags,
-- push tokens, timestamps), so an UPDATE that only touches them is not logged: a like bumps
-- posts.likes_count, a follow bumps profiles.followers_count, opening a chat sets is_read.
-- Service-role writes (moderation function, admin RPCs, cron) are logged too, with user_id NULL.
-- Nothing in here may fail the user's write: any error is swallowed.
CREATE OR REPLACE FUNCTION public.log_traffic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _headers json;
    _forwarded text;
    _ip inet;
    _row jsonb;
    _old jsonb;
BEGIN
    BEGIN
        IF TG_OP = 'UPDATE' THEN
            _row := to_jsonb(NEW) - TG_ARGV;
            _old := to_jsonb(OLD) - TG_ARGV;
            IF _row IS NOT DISTINCT FROM _old THEN
                RETURN NULL;
            END IF;
        END IF;

        -- Private collections are visible to their owner only, so they are not hosted content
        IF TG_TABLE_NAME = 'collections'
           AND COALESCE((to_jsonb(NEW) ->> 'is_private')::boolean, true)
           AND COALESCE((to_jsonb(OLD) ->> 'is_private')::boolean, true) THEN
            RETURN NULL;
        END IF;

        _headers := NULLIF(current_setting('request.headers', true), '')::json;

        -- The first X-Forwarded-For entry is the client; the rest are proxies
        _forwarded := COALESCE(
            NULLIF(btrim(split_part(_headers ->> 'x-forwarded-for', ',', 1)), ''),
            NULLIF(btrim(_headers ->> 'cf-connecting-ip'), '')
        );
        BEGIN
            _ip := _forwarded::inet;
        EXCEPTION WHEN others THEN
            _ip := NULL;
        END;

        INSERT INTO public.traffic_log (user_id, ip, action, table_name, row_id, user_agent)
        VALUES (
            auth.uid(),
            _ip,
            lower(TG_OP),
            TG_TABLE_NAME,
            COALESCE(to_jsonb(NEW) ->> 'id', to_jsonb(OLD) ->> 'id'),
            left(_headers ->> 'user-agent', 512)
        );
    EXCEPTION WHEN others THEN
        NULL;
    END;
    RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.log_traffic() FROM PUBLIC, anon, authenticated;

-- =============================================================================================
-- Tables: content other people can see. Likes, follows, bookmarks, search history and
-- notifications are not content and are left out (KVKK: no more data than needed).
-- =============================================================================================
DROP TRIGGER IF EXISTS traffic_log_posts ON public.posts;
CREATE TRIGGER traffic_log_posts
    AFTER INSERT OR UPDATE OR DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.log_traffic(
        'likes_count', 'comments_count', 'updated_at', 'inserted_at', 'place_key');

DROP TRIGGER IF EXISTS traffic_log_comments ON public.comments;
CREATE TRIGGER traffic_log_comments
    AFTER INSERT OR UPDATE OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.log_traffic('updated_at');

DROP TRIGGER IF EXISTS traffic_log_messages ON public.messages;
CREATE TRIGGER traffic_log_messages
    AFTER INSERT OR UPDATE OR DELETE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.log_traffic('is_read', 'deleted_by', 'updated_at');

-- Username, name, bio and avatar are public; the rest of the row is settings and counters
DROP TRIGGER IF EXISTS traffic_log_profiles ON public.profiles;
CREATE TRIGGER traffic_log_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_traffic(
        'followers_count', 'following_count', 'posts_count', 'updated_at', 'expo_push_token',
        'notification_preferences', 'preferred_language', 'home_location',
        'is_admin', 'is_banned', 'banned_at');

DROP TRIGGER IF EXISTS traffic_log_collections ON public.collections;
CREATE TRIGGER traffic_log_collections
    AFTER INSERT OR UPDATE OR DELETE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.log_traffic('post_count', 'updated_at', 'cover_image_url');

-- =============================================================================================
-- Retention: delete after a year, daily at 03:47 (purge-push-queue runs at 03:17)
-- =============================================================================================
-- cron.schedule replaces a job with the same name, so running this again is harmless.
SELECT cron.schedule(
    'purge-traffic-log',
    '47 3 * * *',
    $$DELETE FROM public.traffic_log WHERE occurred_at < now() - interval '365 days';$$
);

COMMIT;
