import { Image, ImageContentFit, ImageContentPosition } from 'expo-image';
import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';

/**
 * Optimized Image component with aggressive caching
 * Uses expo-image with memory and disk caching enabled
 */

interface OptimizedImageProps {
    source: { uri: string } | number;
    style?: StyleProp<ImageStyle>;
    contentFit?: ImageContentFit;
    contentPosition?: ImageContentPosition;
    placeholder?: string;
    placeholderContentFit?: ImageContentFit;
    transition?: number;
    priority?: 'low' | 'normal' | 'high';
    cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
    onLoad?: () => void;
    onError?: (error: any) => void;
    accessible?: boolean;
    accessibilityLabel?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    source,
    style,
    contentFit = 'cover',
    contentPosition = 'center',
    placeholder,
    placeholderContentFit = 'cover',
    transition = 300,
    priority = 'normal',
    cachePolicy = 'memory-disk',
    onLoad,
    onError,
    accessible = true,
    accessibilityLabel,
}) => {
    return (
        <Image
            source={source}
            style={style}
            contentFit={contentFit}
            contentPosition={contentPosition}
            placeholder={placeholder}
            placeholderContentFit={placeholderContentFit}
            transition={transition}
            priority={priority}
            cachePolicy={cachePolicy}
            onLoad={onLoad}
            onError={onError}
            accessible={accessible}
            accessibilityLabel={accessibilityLabel}
            // Aggressive caching settings
            recyclingKey={typeof source === 'object' ? source.uri : undefined}
            allowDownscaling={true}
        />
    );
};

/**
 * Avatar Image with optimized caching
 */
export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'contentFit' | 'cachePolicy'>> = (props) => {
    return (
        <OptimizedImage
            {...props}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
            transition={200}
        />
    );
};

/**
 * Post Image with optimized caching
 */
export const PostImage: React.FC<Omit<OptimizedImageProps, 'cachePolicy'>> = (props) => {
    return (
        <OptimizedImage
            {...props}
            cachePolicy="memory-disk"
            priority="normal"
            transition={300}
        />
    );
};

/**
 * Thumbnail Image with optimized caching
 */
export const ThumbnailImage: React.FC<Omit<OptimizedImageProps, 'cachePolicy' | 'priority'>> = (props) => {
    return (
        <OptimizedImage
            {...props}
            cachePolicy="memory-disk"
            priority="low"
            transition={200}
        />
    );
};

/**
 * Preload images for better UX
 */
export const preloadImages = async (uris: string[]) => {
    try {
        await Promise.all(
            uris.map((uri) =>
                Image.prefetch(uri, {
                    cachePolicy: 'memory-disk',
                })
            )
        );
    } catch (error) {
        console.error('Failed to preload images:', error);
    }
};

/**
 * Clear image cache
 */
export const clearImageCache = async () => {
    try {
        await Image.clearMemoryCache();
        await Image.clearDiskCache();
        console.log('Image cache cleared successfully');
    } catch (error) {
        console.error('Failed to clear image cache:', error);
    }
};

/**
 * Get cache size
 */
export const getImageCacheSize = async () => {
    try {
        // Note: expo-image doesn't provide a direct API to get cache size
        // This is a placeholder for future implementation
        console.log('Cache size check not available in expo-image');
        return null;
    } catch (error) {
        console.error('Failed to get cache size:', error);
        return null;
    }
};
