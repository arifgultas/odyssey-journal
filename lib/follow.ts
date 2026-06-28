import { supabase } from './supabase';
import { Post } from './posts';
import { captureError } from './sentry';

export interface UserProfile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    followers_count: number;
    following_count: number;
    created_at?: string;
    // Client-side state
    isFollowing?: boolean;
}

/**
 * Follow a user
 */
export async function followUser(userId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        if (user.id === userId) {
            throw new Error('Cannot follow yourself');
        }

        const { error } = await supabase
            .from('follows')
            .insert({
                follower_id: user.id,
                following_id: userId,
            });

        if (error) {
            // If it's a duplicate error, it means already following
            if (error.code === '23505') {
                return false;
            }
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error following user:', error);
        captureError(error as Error, { context: 'followUser', userId });
        throw error;
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', userId);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error unfollowing user:', error);
        captureError(error as Error, { context: 'unfollowUser', userId });
        throw error;
    }
}

/**
 * Check if current user is following another user
 */
export async function checkIfFollowing(userId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return false;
        }

        const { data, error } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking follow status:', error);
        captureError(error as Error, { context: 'checkIfFollowing', userId });
        return false;
    }
}

/**
 * Get user's followers
 */
export async function getFollowers(
    userId: string,
    page: number = 0,
    pageSize: number = 20
): Promise<UserProfile[]> {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('follows')
            .select(`
                follower_id,
                profiles!follows_follower_id_fkey (
                    id,
                    username,
                    full_name,
                    avatar_url,
                    bio,
                    followers_count,
                    following_count
                )
            `)
            .eq('following_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data?.map((follow: any) => follow.profiles) || [];
    } catch (error) {
        console.error('Error fetching followers:', error);
        captureError(error as Error, { context: 'getFollowers', userId });
        throw error;
    }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(
    userId: string,
    page: number = 0,
    pageSize: number = 20
): Promise<UserProfile[]> {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('follows')
            .select(`
                following_id,
                profiles!follows_following_id_fkey (
                    id,
                    username,
                    full_name,
                    avatar_url,
                    bio,
                    followers_count,
                    following_count
                )
            `)
            .eq('follower_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data?.map((follow: any) => follow.profiles) || [];
    } catch (error) {
        console.error('Error fetching following:', error);
        captureError(error as Error, { context: 'getFollowing', userId });
        throw error;
    }
}

/**
 * Get follow suggestions for current user
 */
export async function getFollowSuggestions(limit: number = 10): Promise<UserProfile[]> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Get users that current user is not following
        const { data: followingIds } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

        const excludeIds = [user.id, ...(followingIds?.map(f => f.following_id) || [])];

        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio, website, followers_count, following_count')
            .not('id', 'in', `(${excludeIds.join(',')})`)
            .order('followers_count', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching follow suggestions:', error);
        captureError(error as Error, { context: 'getFollowSuggestions' });
        throw error;
    }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        captureError(error as Error, { context: 'getUserProfile', userId });
        return null;
    }
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return null;
        }

        return getUserProfile(user.id);
    } catch (error) {
        console.error('Error fetching current user profile:', error);
        captureError(error as Error, { context: 'getCurrentUserProfile' });
        return null;
    }
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        captureError(error as Error, { context: 'updateUserProfile', updates });
        throw error;
    }
}

/**
 * Get posts from users that current user is following (Following Feed)
 */
export async function getFollowingFeed(
    page: number = 0,
    pageSize: number = 10,
    sortBy: 'date' | 'popularity' | 'location' = 'date'
): Promise<Post[]> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const from = page * pageSize;
        const to = from + pageSize - 1;

        // Get IDs of users that current user is following
        const { data: followingData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

        const followingIds = followingData?.map(f => f.following_id) || [];

        if (followingIds.length === 0) {
            return [];
        }

        // Get posts from followed users
        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .in('user_id', followingIds);

        if (sortBy === 'popularity') {
            query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
        } else if (sortBy === 'location') {
            query = query.not('location_name', 'is', null).order('created_at', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query.range(from, to);

        if (error) {
            throw error;
        }

        return (data as unknown as Post[]) || [];
    } catch (error) {
        console.error('Error fetching following feed:', error);
        captureError(error as Error, { context: 'getFollowingFeed' });
        throw error;
    }
}
