BEGIN;

-- 1. Create the new rate limiting function for posts
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
    -- Check when the user account was created
    SELECT created_at INTO user_created_at
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Stricter limits for new accounts (under 24 hours old)
    IF user_created_at >= NOW() - INTERVAL '24 hours' THEN
        max_posts_per_hour := 3;
    END IF;

    SELECT COUNT(*) INTO post_count
    FROM public.posts
    WHERE user_id = NEW.user_id
      AND created_at >= NOW() - INTERVAL '1 hour';

    IF post_count >= max_posts_per_hour THEN
        RAISE EXCEPTION 'Rate limit exceeded: You can only create % posts per hour.', max_posts_per_hour;
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Attach trigger to posts (replacing existing if needed)
DROP TRIGGER IF EXISTS enforce_post_rate_limit ON public.posts;
CREATE TRIGGER enforce_post_rate_limit
    BEFORE INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.check_post_rate_limit();

-- 3. Create the new rate limiting function for comments
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    comment_count INT;
    max_comments_per_hour INT := 30;
    user_created_at TIMESTAMPTZ;
BEGIN
    -- Check when the user account was created
    SELECT created_at INTO user_created_at
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Stricter limits for new accounts (under 24 hours old)
    IF user_created_at >= NOW() - INTERVAL '24 hours' THEN
        max_comments_per_hour := 10;
    END IF;

    SELECT COUNT(*) INTO comment_count
    FROM public.comments
    WHERE user_id = NEW.user_id
      AND created_at >= NOW() - INTERVAL '1 hour';

    IF comment_count >= max_comments_per_hour THEN
        RAISE EXCEPTION 'Rate limit exceeded: You can only post % comments per hour.', max_comments_per_hour;
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Attach trigger to comments
DROP TRIGGER IF EXISTS enforce_comment_rate_limit ON public.comments;
CREATE TRIGGER enforce_comment_rate_limit
    BEFORE INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.check_comment_rate_limit();

COMMIT;
