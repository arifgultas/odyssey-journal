import { supabase } from './supabase';

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('likes')
            .insert({
                user_id: user.id,
                post_id: postId,
            });

        if (error) {
            // If it's a duplicate error, it means already liked
            if (error.code === '23505') {
                return false;
            }
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error liking post:', error);
        throw error;
    }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error unliking post:', error);
        throw error;
    }
}

/**
 * Check if user has liked a post
 */
export async function checkIfLiked(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return false;
        }

        const { data, error } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking like status:', error);
        return false;
    }
}

/**
 * Bookmark/Save a post (optionally to a specific collection)
 */
export async function bookmarkPost(postId: string, collectionId?: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('bookmarks')
            .insert({
                user_id: user.id,
                post_id: postId,
                collection_id: collectionId || null,
            });

        if (error) {
            // If it's a duplicate error, it means already bookmarked
            if (error.code === '23505') {
                return false;
            }
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error bookmarking post:', error);
        throw error;
    }
}

/**
 * Remove bookmark from a post
 */
export async function unbookmarkPost(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error removing bookmark:', error);
        throw error;
    }
}

/**
 * Check if user has bookmarked a post
 */
export async function checkIfBookmarked(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return false;
        }

        const { data, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return false;
    }
}

/**
 * Get user's bookmarked posts
 */
export async function getBookmarkedPosts(
    page: number = 0,
    pageSize: number = 10
): Promise<any[]> {
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

        const { data, error } = await supabase
            .from('bookmarks')
            .select(`
                created_at,
                posts (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data?.map((bookmark: any) => bookmark.posts) || [];
    } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
        throw error;
    }
}

/**
 * Get like count for a post
 */
export async function getLikeCount(postId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (error) {
            throw error;
        }

        return count || 0;
    } catch (error) {
        console.error('Error getting like count:', error);
        return 0;
    }
}
