import { supabase } from './supabase';

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    // User info (from join)
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
}

export interface CreateCommentData {
    post_id: string;
    content: string;
}

/**
 * Add a comment to a post
 */
export async function addComment(data: CreateCommentData): Promise<Comment> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        if (!data.content.trim()) {
            throw new Error('Comment content cannot be empty');
        }

        const { data: comment, error } = await supabase
            .from('comments')
            .insert({
                post_id: data.post_id,
                user_id: user.id,
                content: data.content.trim(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return comment;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

/**
 * Get comments for a post
 */
export async function getComments(
    postId: string,
    page: number = 0,
    pageSize: number = 20
): Promise<Comment[]> {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('comments')
            .select(`
                id,
                post_id,
                user_id,
                content,
                created_at,
                profiles:user_id (
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        // Flatten the nested profiles data
        return (data || []).map((comment: any) => ({
            id: comment.id,
            post_id: comment.post_id,
            user_id: comment.user_id,
            content: comment.content,
            created_at: comment.created_at,
            username: comment.profiles?.username,
            full_name: comment.profiles?.full_name,
            avatar_url: comment.profiles?.avatar_url,
        }));
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user.id);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
}

/**
 * Update a comment
 */
export async function updateComment(
    commentId: string,
    content: string
): Promise<Comment> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        if (!content.trim()) {
            throw new Error('Comment content cannot be empty');
        }

        const { data: comment, error } = await supabase
            .from('comments')
            .update({ content: content.trim() })
            .eq('id', commentId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return comment;
    } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
    }
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (error) {
            throw error;
        }

        return count || 0;
    } catch (error) {
        console.error('Error getting comment count:', error);
        return 0;
    }
}

/**
 * Check if user owns a comment
 */
export async function isCommentOwner(commentId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return false;
        }

        const { data, error } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', commentId)
            .single();

        if (error) {
            return false;
        }

        return data?.user_id === user.id;
    } catch (error) {
        console.error('Error checking comment ownership:', error);
        return false;
    }
}
