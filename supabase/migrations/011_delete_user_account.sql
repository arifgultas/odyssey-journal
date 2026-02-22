-- Account Deletion Function
-- This function deletes all user data and the auth user record.
-- It must be called by the authenticated user who wants to delete their account.
-- Uses SECURITY DEFINER to bypass RLS and access auth.users.

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    _user_id uuid;
BEGIN
    -- Get the current authenticated user's ID
    _user_id := auth.uid();
    
    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete user's notifications (both received and sent)
    DELETE FROM public.notifications WHERE user_id = _user_id OR actor_id = _user_id;

    -- Delete user's reports
    DELETE FROM public.reports WHERE reporter_id = _user_id;

    -- Delete user's comments
    DELETE FROM public.comments WHERE user_id = _user_id;

    -- Delete user's likes
    DELETE FROM public.likes WHERE user_id = _user_id;

    -- Delete user's bookmarks
    DELETE FROM public.bookmarks WHERE user_id = _user_id;

    -- Delete user's collections
    DELETE FROM public.collections WHERE user_id = _user_id;

    -- Delete user's follows (both directions)
    DELETE FROM public.follows WHERE follower_id = _user_id OR following_id = _user_id;

    -- Delete user's interactions (legacy table)
    DELETE FROM public.interactions WHERE user_id = _user_id;

    -- Delete likes/comments/bookmarks on user's posts (cascade should handle this, but be explicit)
    DELETE FROM public.likes WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.comments WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);
    DELETE FROM public.bookmarks WHERE post_id IN (SELECT id FROM public.posts WHERE user_id = _user_id);

    -- Delete user's posts
    DELETE FROM public.posts WHERE user_id = _user_id;

    -- Delete user's profile
    DELETE FROM public.profiles WHERE id = _user_id;

    -- Delete the auth user record
    -- This requires the function to be SECURITY DEFINER
    DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
