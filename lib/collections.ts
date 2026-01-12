import { supabase } from './supabase';

// Collection type
export interface Collection {
    id: string;
    user_id: string;
    name: string;
    cover_image_url: string | null;
    color: string;
    is_private: boolean;
    post_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateCollectionData {
    name: string;
    cover_image_url?: string;
    color?: string;
    is_private?: boolean;
}

export interface UpdateCollectionData {
    name?: string;
    cover_image_url?: string;
    color?: string;
    is_private?: boolean;
}

/**
 * Create a new collection
 */
export async function createCollection(data: CreateCollectionData): Promise<Collection> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: collection, error } = await supabase
            .from('collections')
            .insert({
                user_id: user.id,
                name: data.name,
                cover_image_url: data.cover_image_url || null,
                color: data.color || '#D4A574',
                is_private: data.is_private || false,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return collection;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

/**
 * Update an existing collection
 */
export async function updateCollection(
    collectionId: string,
    data: UpdateCollectionData
): Promise<Collection> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: collection, error } = await supabase
            .from('collections')
            .update(data)
            .eq('id', collectionId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return collection;
    } catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // First, remove collection_id from all bookmarks in this collection
        await supabase
            .from('bookmarks')
            .update({ collection_id: null })
            .eq('collection_id', collectionId);

        // Then delete the collection
        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionId)
            .eq('user_id', user.id);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error deleting collection:', error);
        throw error;
    }
}

/**
 * Get all collections for the current user
 */
export async function getCollections(): Promise<Collection[]> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching collections:', error);
        throw error;
    }
}

/**
 * Get a single collection by ID
 */
export async function getCollectionById(collectionId: string): Promise<Collection | null> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('id', collectionId)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
}

/**
 * Get posts in a specific collection
 */
export async function getCollectionPosts(
    collectionId: string,
    page: number = 0,
    pageSize: number = 20
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
            .eq('collection_id', collectionId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data?.map((bookmark: any) => bookmark.posts) || [];
    } catch (error) {
        console.error('Error fetching collection posts:', error);
        throw error;
    }
}

/**
 * Add a post to a collection (updates bookmark)
 */
export async function addPostToCollection(
    postId: string,
    collectionId: string
): Promise<boolean> {
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
            .update({ collection_id: collectionId })
            .eq('user_id', user.id)
            .eq('post_id', postId);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error adding post to collection:', error);
        throw error;
    }
}

/**
 * Remove a post from a collection (keeps bookmark, removes collection association)
 */
export async function removePostFromCollection(postId: string): Promise<boolean> {
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
            .update({ collection_id: null })
            .eq('user_id', user.id)
            .eq('post_id', postId);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error removing post from collection:', error);
        throw error;
    }
}

/**
 * Get the first image from a collection for cover (if no cover set)
 */
export async function getCollectionFirstImage(collectionId: string): Promise<string | null> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return null;
        }

        const { data, error } = await supabase
            .from('bookmarks')
            .select(`
                posts (images)
            `)
            .eq('user_id', user.id)
            .eq('collection_id', collectionId)
            .limit(1)
            .single();

        if (error) {
            return null;
        }

        const images = (data?.posts as any)?.images;
        return images?.[0] || null;
    } catch (error) {
        console.error('Error fetching collection first image:', error);
        return null;
    }
}

/**
 * Upload collection cover image
 */
export async function uploadCollectionCover(
    collectionId: string,
    imageUri: string
): Promise<string> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Fetch the image
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Generate filename
        const fileExt = 'jpg';
        const fileName = `${user.id}/${collectionId}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('collection-covers')
            .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('collection-covers')
            .getPublicUrl(fileName);

        // Update collection with cover URL
        await updateCollection(collectionId, {
            cover_image_url: urlData.publicUrl,
        });

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading collection cover:', error);
        throw error;
    }
}
