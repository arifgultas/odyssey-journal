import { supabase } from './supabase';
import type { Post } from './posts';

/**
 * Fill isLiked / isBookmarked for the signed-in user. Every list of posts needs it: without it a post
 * the user already liked shows an empty heart, and tapping it counts the like a second time.
 */
export async function populateInteractions(postsData: any[]): Promise<Post[]> {
    if (!postsData || postsData.length === 0) {
        return [];
    }

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return postsData.map(post => ({
                ...post,
                isLiked: false,
                isBookmarked: false,
            }));
        }

        const postIds = postsData.map(post => post.id);
        const [likesResult, bookmarksResult] = await Promise.all([
            supabase
                .from('likes')
                .select('post_id')
                .eq('user_id', user.id)
                .in('post_id', postIds),
            supabase
                .from('bookmarks')
                .select('post_id')
                .eq('user_id', user.id)
                .in('post_id', postIds),
        ]);

        const likedPostIds = new Set((likesResult.data || []).map(l => l.post_id));
        const bookmarkedPostIds = new Set((bookmarksResult.data || []).map(b => b.post_id));

        return postsData.map(post => ({
            ...post,
            isLiked: likedPostIds.has(post.id),
            isBookmarked: bookmarkedPostIds.has(post.id),
        }));
    } catch (error) {
        console.error('Error populating post interactions:', error);
        return postsData.map(post => ({
            ...post,
            isLiked: false,
            isBookmarked: false,
        }));
    }
}
