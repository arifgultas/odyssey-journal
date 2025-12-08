import { deleteMultipleImages } from './image-upload';
import { supabase } from './supabase';

export type Post = {
    id: string;
    user_id: string;
    created_at: string;
    content: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    image_urls: string[];
    // Joined data
    profiles?: {
        username: string;
        full_name: string;
        avatar_url: string;
    };
};

export type CreatePostInput = {
    content: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    image_urls: string[];
};

export type UpdatePostInput = {
    content?: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    image_urls?: string[];
};

/**
 * Create a new post
 * @param input - Post data
 * @returns Created post
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({
                user_id: user.id,
                content: input.content,
                location_name: input.location_name,
                latitude: input.latitude,
                longitude: input.longitude,
                image_urls: input.image_urls,
            })
            .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
            .single();

        if (error) {
            throw error;
        }

        return data as Post;
    } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post');
    }
}

/**
 * Update an existing post
 * @param postId - Post ID
 * @param input - Updated post data
 * @returns Updated post
 */
export async function updatePost(
    postId: string,
    input: UpdatePostInput
): Promise<Post> {
    try {
        const { data, error } = await supabase
            .from('posts')
            .update(input)
            .eq('id', postId)
            .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
            .single();

        if (error) {
            throw error;
        }

        return data as Post;
    } catch (error) {
        console.error('Error updating post:', error);
        throw new Error('Failed to update post');
    }
}

/**
 * Delete a post and its images
 * @param postId - Post ID
 */
export async function deletePost(postId: string): Promise<void> {
    try {
        // 1. Get post to retrieve image URLs
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('image_urls')
            .eq('id', postId)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // 2. Delete images from storage
        if (post?.image_urls && post.image_urls.length > 0) {
            await deleteMultipleImages(post.image_urls, 'posts');
        }

        // 3. Delete post from database
        const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (deleteError) {
            throw deleteError;
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('Failed to delete post');
    }
}

/**
 * Fetch posts with pagination
 * @param page - Page number (0-indexed)
 * @param limit - Number of posts per page
 * @returns Array of posts
 */
export async function fetchPosts(
    page: number = 0,
    limit: number = 10
): Promise<Post[]> {
    try {
        const from = page * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from('posts')
            .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data as Post[];
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error('Failed to fetch posts');
    }
}

/**
 * Fetch a single post by ID
 * @param postId - Post ID
 * @returns Post details
 */
export async function fetchPostById(postId: string): Promise<Post> {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
            .eq('id', postId)
            .single();

        if (error) {
            throw error;
        }

        return data as Post;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error('Failed to fetch post');
    }
}

/**
 * Fetch posts by user ID
 * @param userId - User ID
 * @param page - Page number
 * @param limit - Posts per page
 * @returns Array of posts
 */
export async function fetchPostsByUser(
    userId: string,
    page: number = 0,
    limit: number = 10
): Promise<Post[]> {
    try {
        const from = page * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from('posts')
            .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data as Post[];
    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw new Error('Failed to fetch user posts');
    }
}
