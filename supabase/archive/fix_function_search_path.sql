-- Fix Function Search Path Mutable Security Issues
-- This migration fixes all functions that don't have search_path set
-- Setting search_path = '' prevents potential schema injection attacks
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- ============================================
-- 1. Fix update_post_likes_count
-- ============================================
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET likes_count = GREATEST(0, likes_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- ============================================
-- 2. Fix update_follower_counts (from schema-follow-system)
-- ============================================
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

-- ============================================
-- 3. Fix update_post_counts
-- ============================================
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

-- ============================================
-- 4. Fix update_follow_counts (from schema-follow-system)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment following count for follower
        UPDATE public.profiles
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;
        
        -- Increment followers count for following
        UPDATE public.profiles
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement following count for follower
        UPDATE public.profiles
        SET following_count = GREATEST(0, following_count - 1)
        WHERE id = OLD.follower_id;
        
        -- Decrement followers count for following
        UPDATE public.profiles
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = OLD.following_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- ============================================
-- 5. Fix get_trending_locations
-- ============================================
CREATE OR REPLACE FUNCTION public.get_trending_locations(limit_count INT DEFAULT 10)
RETURNS TABLE (
  location_name TEXT,
  post_count BIGINT,
  recent_post_count BIGINT,
  trend_score NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.location_name,
    COUNT(*)::BIGINT as post_count,
    COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '7 days')::BIGINT as recent_post_count,
    (COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '7 days') * 2 + 
     COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '3 days') * 3)::NUMERIC as trend_score
  FROM public.posts p
  WHERE p.location_name IS NOT NULL
    AND p.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY p.location_name
  ORDER BY trend_score DESC, recent_post_count DESC
  LIMIT limit_count;
END;
$$;

-- ============================================
-- 6. Fix get_recommended_places
-- ============================================
CREATE OR REPLACE FUNCTION public.get_recommended_places(limit_count INT DEFAULT 10)
RETURNS TABLE (
  location_name TEXT,
  post_count BIGINT,
  avg_likes NUMERIC,
  first_image TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.location_name,
    COUNT(*)::BIGINT as post_count,
    AVG(p.likes_count)::NUMERIC as avg_likes,
    (ARRAY_AGG(p.images[1] ORDER BY p.likes_count DESC))[1] as first_image
  FROM public.posts p
  WHERE p.location_name IS NOT NULL
    AND p.images IS NOT NULL
    AND array_length(p.images, 1) > 0
  GROUP BY p.location_name
  HAVING COUNT(*) >= 2
  ORDER BY post_count DESC, avg_likes DESC
  LIMIT limit_count;
END;
$$;

-- ============================================
-- 7. Fix update_post_comments_count
-- ============================================
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET comments_count = GREATEST(0, comments_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- ============================================
-- 8. Fix update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- ============================================
-- 9. Fix create_like_notification
-- ============================================
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Don't create notification if user likes their own post
    IF (SELECT user_id FROM public.posts WHERE id = NEW.post_id) != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (
            (SELECT user_id FROM public.posts WHERE id = NEW.post_id),
            NEW.user_id,
            'like',
            NEW.post_id
        );
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================
-- 10. Fix create_comment_notification
-- ============================================
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Don't create notification if user comments on their own post
    IF (SELECT user_id FROM public.posts WHERE id = NEW.post_id) != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, actor_id, type, post_id)
        VALUES (
            (SELECT user_id FROM public.posts WHERE id = NEW.post_id),
            NEW.user_id,
            'comment',
            NEW.post_id
        );
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================
-- 11. Fix create_follow_notification
-- ============================================
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    VALUES (
        NEW.following_id,
        NEW.follower_id,
        'follow',
        NULL
    );
    RETURN NEW;
END;
$$;

-- ============================================
-- 12. Fix delete_like_notification
-- ============================================
CREATE OR REPLACE FUNCTION public.delete_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE type = 'like'
    AND post_id = OLD.post_id
    AND actor_id = OLD.user_id;
    RETURN OLD;
END;
$$;

-- ============================================
-- 13. Fix delete_follow_notification
-- ============================================
CREATE OR REPLACE FUNCTION public.delete_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE type = 'follow'
    AND user_id = OLD.following_id
    AND actor_id = OLD.follower_id;
    RETURN OLD;
END;
$$;

-- ============================================
-- 14. Fix update_reports_updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- ============================================
-- 15. Fix handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- ============================================
-- Verification Query
-- ============================================
-- After running this migration, you can verify with:
-- 
-- SELECT 
--   n.nspname as schema,
--   p.proname as function_name,
--   p.proconfig as config
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
-- AND p.proname IN (
--   'update_post_likes_count',
--   'update_follower_counts', 
--   'update_post_counts',
--   'update_follow_counts',
--   'get_trending_locations',
--   'get_recommended_places',
--   'update_post_comments_count',
--   'update_updated_at_column',
--   'create_like_notification',
--   'create_comment_notification',
--   'create_follow_notification',
--   'delete_like_notification',
--   'delete_follow_notification',
--   'update_reports_updated_at',
--   'handle_new_user'
-- );
