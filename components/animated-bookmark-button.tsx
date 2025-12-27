/**
 * Animated Bookmark Button with ribbon fold and gradient wipe effects
 * Features:
 * - Tap: Ribbon fold animation (scale + rotation)
 * - Color fill: Gradient wipe from bottom to top
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

interface AnimatedBookmarkButtonProps {
    isBookmarked: boolean;
    onToggle: () => void;
    size?: number;
}

export const AnimatedBookmarkButton: React.FC<AnimatedBookmarkButtonProps> = ({
    isBookmarked,
    onToggle,
    size = 24,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const fillHeightAnim = useRef(new Animated.Value(isBookmarked ? 1 : 0)).current;
    const foldAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate fill based on isBookmarked state
        Animated.timing(fillHeightAnim, {
            toValue: isBookmarked ? 1 : 0,
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
        }).start();
    }, [isBookmarked]);

    const handlePress = () => {
        // Ribbon fold animation sequence
        if (!isBookmarked) {
            // Bookmark: Fold down then up
            Animated.sequence([
                // Initial scale down with slight rotation (fold effect)
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 0.85,
                        duration: 100,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(foldAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]),
                // Bounce back with ribbon wave
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(rotationAnim, {
                            toValue: 15,
                            duration: 100,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotationAnim, {
                            toValue: -10,
                            duration: 100,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.spring(rotationAnim, {
                            toValue: 0,
                            friction: 4,
                            tension: 200,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.spring(scaleAnim, {
                        toValue: 1.2,
                        friction: 3,
                        tension: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(foldAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
                // Settle back to normal
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Unbookmark: Simple scale animation
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 80,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        onToggle();
    };

    const rotationInterpolate = rotationAnim.interpolate({
        inputRange: [-10, 0, 15],
        outputRange: ['-10deg', '0deg', '15deg'],
    });

    // Fold effect for ribbon
    const foldInterpolate = foldAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.9],
    });

    // Color interpolation for gradient wipe effect
    const bookmarkColor = fillHeightAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['#64748B', '#B8860B', '#D4AF37'],
    });

    return (
        <Pressable onPress={handlePress} style={styles.container}>
            {/* Ribbon background fill animation */}
            <View style={styles.ribbonContainer}>
                <Animated.View
                    style={[
                        styles.fillOverlay,
                        {
                            height: fillHeightAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: '#D4AF37',
                        },
                    ]}
                />
            </View>

            {/* Main bookmark icon */}
            <Animated.View
                style={[
                    styles.ribbon,
                    {
                        transform: [
                            { scale: scaleAnim },
                            { scaleY: foldInterpolate },
                            { rotate: rotationInterpolate },
                        ],
                    },
                ]}
            >
                <Animated.Text style={{ color: bookmarkColor }}>
                    <Ionicons
                        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={size}
                        color={isBookmarked ? '#D4AF37' : '#64748B'}
                    />
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    ribbonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        opacity: 0, // Hidden, just for effect reference
    },
    fillOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    ribbon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
