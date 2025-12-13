import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ImageCarouselProps {
    images: string[];
    style?: any;
}

/**
 * ImageCarousel Component
 * 
 * A horizontal scrollable carousel for displaying multiple images.
 * Features:
 * - Smooth horizontal scrolling
 * - Pagination dots
 * - Optimized image loading
 * - Premium Polaroid-style frames
 */
export function ImageCarousel({ images, style }: ImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Calculate actual image width accounting for parent padding
    // polaroidContainer padding: 16px (Spacing.md)
    // polaroidFrame padding: 8px
    // Total padding to subtract: (16 + 8) * 2 = 48px
    const CAROUSEL_WIDTH = width - (Spacing.md * 2) - 48;

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
            >
                {images.map((imageUrl, index) => (
                    <View key={index} style={[styles.imageContainer, { width: CAROUSEL_WIDTH }]}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                            transition={200}
                        />
                    </View>
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            {images.length > 1 && (
                <View style={styles.pagination}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === activeIndex && styles.activeDot,
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
    imageContainer: {
        height: 280,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.xs,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.light.border,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.primary,
    },
});
