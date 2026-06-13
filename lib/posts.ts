import { getBlockedUsers } from './block';
import { getModerationMessage, moderatePost, moderateText } from './content-moderation';
import { deleteImage, uploadMultipleImages, uploadImage } from './image-upload';
import { LIMITS, sanitizePostContent, sanitizePostTitle, sanitizeText } from './sanitize';
import { supabase } from './supabase';
import { WeatherData } from './weather';
import { captureError } from './sentry';

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

        // Format location_name for legacy/search column compatibility
        let locationName: string | null = null;
        if (data.location) {
            if (data.location.city && data.location.country) {
                locationName = `${data.location.city}, ${data.location.country}`;
            } else if (data.location.city) {
                locationName = data.location.city;
            } else if (data.location.country) {
                locationName = data.location.country;
            } else if (data.location.address) {
                locationName = data.location.address;
            }
        }

        // Create post in database
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                user_id: user.id,
                title: sanitizedTitle,
                content: sanitizedContent,
                location: data.location,
                location_name: locationName,
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
        captureError(error as Error, { context: 'createPost' });
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

        // Fetch the old post to see if any images were removed during editing
        let oldPostImages: string[] = [];
        try {
            const { data: oldPost } = await supabase
                .from('posts')
                .select('images')
                .eq('id', postId)
                .single();
            if (oldPost && oldPost.images) {
                oldPostImages = oldPost.images;
            }
        } catch (fetchOldError) {
            console.error('Error fetching old post images for cleanup:', fetchOldError);
        }

        // Upload new (local) images, keeping existing remote ones
        let imageUrls: string[] | undefined;
        if (data.images) {
            const uploadPromises = data.images.map(async (uri) => {
                if (uri.startsWith('http://') || uri.startsWith('https://')) {
                    return uri; // Already uploaded remote image
                }
                return await uploadImage(uri, 'posts', user.id);
            });
            imageUrls = await Promise.all(uploadPromises);

            // Clean up removed images from storage in background
            const removedImages = oldPostImages.filter((url) => !imageUrls?.includes(url));
            if (removedImages.length > 0) {
                for (const url of removedImages) {
                    try {
                        await deleteImage(url, 'posts');
                    } catch (deleteError) {
                        console.error('Error deleting removed post image from storage:', deleteError);
                    }
                }
            }
        }

        const updateData: {
            updated_at: string;
            title?: string;
            content?: string;
            location?: CreatePostData['location'];
            location_name?: string | null;
            images?: string[];
            categories?: string[];
            image_captions?: string[];
            weather_data?: CreatePostData['weatherData'];
        } = {
            updated_at: new Date().toISOString(),
        };

        if (data.title !== undefined) updateData.title = sanitizePostTitle(data.title);
        if (data.content !== undefined) updateData.content = sanitizePostContent(data.content);
        if (data.location !== undefined) {
            updateData.location = data.location;
            if (data.location) {
                if (data.location.city && data.location.country) {
                    updateData.location_name = `${data.location.city}, ${data.location.country}`;
                } else if (data.location.city) {
                    updateData.location_name = data.location.city;
                } else if (data.location.country) {
                    updateData.location_name = data.location.country;
                } else if (data.location.address) {
                    updateData.location_name = data.location.address;
                }
            } else {
                updateData.location_name = null;
            }
        }
        if (imageUrls !== undefined) updateData.images = imageUrls;
        if (data.categories !== undefined) updateData.categories = data.categories;
        if (data.imageCaptions !== undefined) {
            updateData.image_captions = data.imageCaptions.map(
                (c) => sanitizeText(c, LIMITS.POST_TITLE)
            );
        }
        if (data.weatherData !== undefined) updateData.weather_data = data.weatherData;

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
        captureError(error as Error, { context: 'updatePost' });
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
        captureError(error as Error, { context: 'deletePost' });
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
        const blockedUsers = await getBlockedUsers();
        const from = page * pageSize;
        const to = from + pageSize - 1;

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
            `);

        if (blockedUsers.length > 0) {
            query = query.not('user_id', 'in', `(${blockedUsers.join(',')})`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        captureError(error as Error, { context: 'fetchPosts' });
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
        captureError(error as Error, { context: 'fetchPostById' });
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
        captureError(error as Error, { context: 'fetchPostsByUser' });
        throw error;
    }
}
