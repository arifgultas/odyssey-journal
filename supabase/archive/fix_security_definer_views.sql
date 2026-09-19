-- Fix SECURITY DEFINER Views Migration
-- This migration fixes the security issue where views are using SECURITY DEFINER
-- Views should use SECURITY INVOKER to respect RLS policies of the querying user

-- ============================================
-- 1. Fix follow_suggestions view
-- ============================================
DROP VIEW IF EXISTS public.follow_suggestions;

CREATE VIEW public.follow_suggestions
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.followers_count,
    p.following_count,
    p.updated_at
FROM public.profiles p
WHERE p.id != auth.uid()
AND p.id NOT IN (
    SELECT following_id 
    FROM public.follows 
    WHERE follower_id = auth.uid()
)
ORDER BY p.followers_count DESC, p.updated_at DESC
LIMIT 20;

-- Grant access to authenticated users
GRANT SELECT ON public.follow_suggestions TO authenticated;

-- ============================================
-- 2. Fix notifications_with_actors view
-- ============================================
DROP VIEW IF EXISTS public.notifications_with_actors;

CREATE VIEW public.notifications_with_actors
WITH (security_invoker = true)
AS
SELECT 
    n.id,
    n.user_id,
    n.actor_id,
    n.type,
    n.post_id,
    n.read,
    n.created_at,
    p.username as actor_username,
    p.full_name as actor_full_name,
    p.avatar_url as actor_avatar_url,
    posts.title as post_title,
    posts.images as post_images
FROM public.notifications n
LEFT JOIN public.profiles p ON n.actor_id = p.id
LEFT JOIN public.posts ON n.post_id = posts.id
ORDER BY n.created_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON public.notifications_with_actors TO authenticated;

-- ============================================
-- 3. Fix comments_with_users view
-- ============================================
DROP VIEW IF EXISTS public.comments_with_users;

CREATE VIEW public.comments_with_users
WITH (security_invoker = true)
AS
SELECT 
    c.id,
    c.post_id,
    c.user_id,
    c.content,
    c.created_at,
    p.username,
    p.full_name,
    p.avatar_url
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON public.comments_with_users TO authenticated;

-- ============================================
-- Verification Comment
-- ============================================
-- After running this migration, verify that the views are using SECURITY INVOKER:
-- 
-- SELECT schemaname, viewname, definition 
-- FROM pg_views 
-- WHERE schemaname = 'public' 
-- AND viewname IN ('follow_suggestions', 'notifications_with_actors', 'comments_with_users');
--
-- You can also check security properties with:
-- SELECT c.relname, c.relrowsecurity 
-- FROM pg_class c 
-- JOIN pg_namespace n ON n.oid = c.relnamespace 
-- WHERE n.nspname = 'public' 
-- AND c.relname IN ('follow_suggestions', 'notifications_with_actors', 'comments_with_users');
