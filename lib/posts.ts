import { getModerationMessage, moderatePost, moderateText } from './content-moderation';
import { deleteImage, uploadMultipleImages } from './image-upload';
import { LIMITS, sanitizePostContent, sanitizePostTitle, sanitizeText } from './sanitize';
import { supabase } from './supabase';
import { WeatherData } from './weather';

export interface CreatePostData {
    title: string;
    content: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
        city?: string;
        country?: string;
    };
    images?: string[]; // URIs of local images
    imageCaptions?: string[]; // Captions for each image
    weatherData?: WeatherData; // Weather at time of post creation
    categories?: string[]; // Category IDs (e.g., ['nature', 'city'])
}

export interface Post {
    id: string;
    user_id: string;
    title: string;
    content: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
        city?: string;
        country?: string;
    };
    images?: string[];
    image_captions?: string[]; // Captions for each image
    weather_data?: WeatherData; // Weather at time of post creation
    categories?: string[]; // Category IDs
    created_at: string;
    updated_at: string;
    likes_count: number;
    comments_count: number;
    // User profile data (from join)
    profiles?: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
    // Client-side state
    isLiked?: boolean;
    isBookmarked?: boolean;
}

/**
 * Create a new post with images
 */
export async function createPost(data: CreatePostData): Promise<Post> {
    try {
        // Get current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Upload images if provided
        let imageUrls: string[] = [];
        if (data.images && data.images.length > 0) {
            imageUrls = await uploadMultipleImages(data.images, 'posts', user.id);
        }

        // Sanitize text fields
        const sanitizedTitle = sanitizePostTitle(data.title);
        const sanitizedContent = sanitizePostContent(data.content);
        const sanitizedCaptions = (data.imageCaptions || []).map(
            (c) => sanitizeText(c, LIMITS.POST_TITLE)
        );

        // AI Content Moderation — check text before publishing
        const textModeration = await moderateText(`${sanitizedTitle}\n\n${sanitizedContent}`);
        if (!textModeration.approved) {
            throw new Error(getModerationMessage(textModeration.flaggedCategories));
        }

        // Create post in database
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                user_id: user.id,
                title: sanitizedTitle,
                content: sanitizedContent,
                location: data.location,
                images: imageUrls,
                image_captions: sanitizedCaptions,
                weather_data: data.weatherData || null,
                categories: data.categories || [],
            })
            .select()
            .single();

        if (postError) {
            // If post creation fails, delete uploaded images
            if (imageUrls.length > 0) {
                await Promise.all(imageUrls.map((url) => deleteImage(url, 'posts')));
            }
            throw postError;
        }

        // AI Content Moderation — check images after upload (needs public URLs)
        if (imageUrls.length > 0) {
            const imageModeration = await moderatePost('', '', imageUrls);
            if (!imageModeration.approved) {
                // Delete the post and images if flagged
                await supabase.from('posts').delete().eq('id', post.id);
                await Promise.all(imageUrls.map((url) => deleteImage(url, 'posts')));
                throw new Error(getModerationMessage(imageModeration.flaggedCategories));
            }
        }

        return post;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

/**
 * Update an existing post
 */
export async function updatePost(
    postId: string,
    data: Partial<CreatePostData>
): Promise<Post> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Upload new images if provided
        let imageUrls: string[] | undefined;
        if (data.images && data.images.length > 0) {
            imageUrls = await uploadMultipleImages(data.images, 'posts', user.id);
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (data.title !== undefined) updateData.title = sanitizePostTitle(data.title);
        if (data.content !== undefined) updateData.content = sanitizePostContent(data.content);
        if (data.location !== undefined) updateData.location = data.location;
        if (imageUrls !== undefined) updateData.images = imageUrls;

        const { data: post, error: postError } = await supabase
            .from('posts')
            .update(updateData)
            .eq('id', postId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (postError) {
            throw postError;
        }

        return post;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

/**
 * Delete a post and its images
 */
export async function deletePost(postId: string): Promise<void> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Get post to retrieve image URLs
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('images')
            .eq('id', postId)
            .eq('user_id', user.id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // Delete images from storage
        if (post.images && post.images.length > 0) {
            await Promise.all(post.images.map((url: string) => deleteImage(url, 'posts')));
        }

        // Delete post from database
        const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', user.id);

        if (deleteError) {
            throw deleteError;
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}

/**
 * Fetch posts with pagination
 */
export async function fetchPosts(
    page: number = 0,
    pageSize: number = 10
): Promise<Post[]> {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
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
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

/**
 * Fetch a single post by ID
 */
export async function fetchPostById(postId: string): Promise<Post> {
    try {
        const { data, error } = await supabase
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
            .eq('id', postId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
}

/**
 * Fetch posts by user ID
 */
export async function fetchPostsByUser(
    userId: string,
    page: number = 0,
    pageSize: number = 10
): Promise<Post[]> {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw error;
    }
}
