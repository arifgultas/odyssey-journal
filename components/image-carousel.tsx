import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageCarouselProps {
    images: string[];
    style?: any;
    aspectRatio?: number; // Default is 1 (square)
}

/**
 * ImageCarousel Component
 * 
 * A horizontal scrollable carousel for displaying multiple images.
 * Features:
 * - Smooth horizontal scrolling with snap
 * - Pagination dots
 * - Optimized image loading
 * - Polaroid-style square format (default)
 * - Subtle grayscale effect that removes on active
 */
export function ImageCarousel({ images, style, aspectRatio = 1 }: ImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Calculate carousel width based on container
    // Account for card padding: container (Spacing.sm * 2) = 16px
    const CAROUSEL_WIDTH = SCREEN_WIDTH - (Spacing.md * 2) - (Spacing.sm * 2);

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / CAROUSEL_WIDTH);
        setActiveIndex(index);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, style]}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                snapToInterval={CAROUSEL_WIDTH}
                decelerationRate="fast"
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {images.map((imageUrl, index) => (
                    <View
                        key={index}
                        style={[
                            styles.imageContainer,
                            {
                                width: CAROUSEL_WIDTH,
                                aspectRatio,
                            }
                        ]}
                    >
                        <Image
                            source={{ uri: imageUrl }}
                            style={[
                                styles.image,
                                // Subtle grayscale effect for inactive images
                                index !== activeIndex && styles.inactiveImage,
                            ]}
                            contentFit="cover"
                            transition={200}
                            cachePolicy="memory-disk"
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Pagination Dots - Only show if multiple images */}
            {images.length > 1 && (
                <View style={styles.pagination}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: theme.border },
                                index === activeIndex && [
                                    styles.activeDot,
                                    { backgroundColor: theme.accent }
                                ],
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
    },
    scrollView: {
        width: '100%',
    },
    scrollContent: {
        // No gap between images for cleaner look
    },
    imageContainer: {
        overflow: 'hidden',
        backgroundColor: '#f0ebe4',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.xs,
    },
    inactiveImage: {
        // Very subtle grayscale for travel/vintage feel
        opacity: 0.95,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        gap: 6,
        position: 'absolute',
        bottom: Spacing.sm,
        left: 0,
        right: 0,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.accent,
        // Add subtle shadow for better visibility
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
});
