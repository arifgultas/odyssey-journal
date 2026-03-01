import { decode } from 'base64-arraybuffer';
import * as ExpoFileSystem from 'expo-file-system';
import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

// Image upload limits
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES_PER_POST = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * Upload an image to Supabase Storage
 * @param uri - Local file URI
 * @param bucket - Storage bucket name ('avatars' or 'posts')
 * @param userId - User ID for folder organization
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
    uri: string,
    bucket: 'avatars' | 'posts',
    userId: string
): Promise<string> {
    try {
        // 0. Validate file size before processing (best-effort)
        try {
            const fileInfo = await ExpoFileSystem.getInfoAsync(uri);
            if (fileInfo.exists && 'size' in fileInfo && fileInfo.size && fileInfo.size > MAX_FILE_SIZE_BYTES) {
                throw new Error(`Image file is too large (max ${MAX_FILE_SIZE_MB}MB)`);
            }
        } catch (sizeError: any) {
            // Only re-throw if it's our own size limit error
            if (sizeError?.message?.includes('too large')) throw sizeError;
            // Otherwise ignore — some URI formats don't support getInfoAsync
        }

        // 1. Compress and resize image
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1080 } }], // Max width 1080px
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // 2. Read file as base64 using new File API
        const file = new File(manipulatedImage.uri);
        const base64 = await file.base64();

        // 3. Generate unique filename
        const fileExt = 'jpg';
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // 4. Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, decode(base64), {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) {
            throw error;
        }

        // 5. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}

/**
 * Delete an image from Supabase Storage
 * @param url - Public URL of the image
 * @param bucket - Storage bucket name
 */
export async function deleteImage(
    url: string,
    bucket: 'avatars' | 'posts'
): Promise<void> {
    try {
        // Extract file path from URL
        const urlParts = url.split(`/${bucket}/`);
        if (urlParts.length < 2) {
            throw new Error('Invalid image URL');
        }
        const filePath = urlParts[1];

        // Delete from storage
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        throw new Error('Failed to delete image');
    }
}

/**
 * Get public URL for an image in storage
 * @param path - File path in storage
 * @param bucket - Storage bucket name
 * @returns Public URL
 */
export function getImageUrl(
    path: string,
    bucket: 'avatars' | 'posts'
): string {
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

    return publicUrl;
}

/**
 * Upload multiple images
 * @param uris - Array of local file URIs
 * @param bucket - Storage bucket name
 * @param userId - User ID for folder organization
 * @returns Array of public URLs
 */
export async function uploadMultipleImages(
    uris: string[],
    bucket: 'avatars' | 'posts',
    userId: string
): Promise<string[]> {
    try {
        // Validate image count
        if (uris.length > MAX_IMAGES_PER_POST) {
            throw new Error(`Maximum ${MAX_IMAGES_PER_POST} images allowed per post`);
        }

        const uploadPromises = uris.map(uri => uploadImage(uri, bucket, userId));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw new Error('Failed to upload images');
    }
}

/**
 * Delete multiple images
 * @param urls - Array of public URLs
 * @param bucket - Storage bucket name
 */
export async function deleteMultipleImages(
    urls: string[],
    bucket: 'avatars' | 'posts'
): Promise<void> {
    try {
        const deletePromises = urls.map(url => deleteImage(url, bucket));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting multiple images:', error);
        throw new Error('Failed to delete images');
    }
}
