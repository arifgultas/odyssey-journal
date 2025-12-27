/**
 * Animated Loading Spinner with vintage compass needle rotation
 * Features:
 * - Spinner: Vintage compass needle rotation with wobble
 * - Skeleton: Shimmer effect (left to right) - enhanced from existing
 */

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface CompassSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

export function CompassSpinner({ size = 'medium', color }: CompassSpinnerProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const spinnerColor = color ?? theme.accent;

    // Animation values
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const wobbleAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const sizes = {
        small: { icon: 24, container: 40 },
        medium: { icon: 36, container: 56 },
        large: { icon: 48, container: 72 },
    };

    const currentSize = sizes[size];

    useEffect(() => {
        // Main rotation animation
        const rotateAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        // Wobble animation - needle swinging effect
        const wobbleAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(wobbleAnim, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(wobbleAnim, {
                    toValue: -1,
                    duration: 150,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(wobbleAnim, {
                    toValue: 0.5,
                    duration: 100,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(wobbleAnim, {
                    toValue: -0.5,
                    duration: 100,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(wobbleAnim, {
                    toValue: 0,
                    duration: 100,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.delay(500),
            ])
        );

        // Pulse animation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        rotateAnimation.start();
        wobbleAnimation.start();
        pulseAnimation.start();

        return () => {
            rotateAnimation.stop();
            wobbleAnimation.stop();
            pulseAnimation.stop();
        };
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const wobble = wobbleAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-5deg', '0deg', '5deg'],
    });

    return (
        <View style={[styles.spinnerContainer, { width: currentSize.container, height: currentSize.container }]}>
            {/* Background circle */}
            <Animated.View
                style={[
                    styles.spinnerBackground,
                    {
                        width: currentSize.container,
                        height: currentSize.container,
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        transform: [{ scale: pulseAnim }],
                    },
                ]}
            />

            {/* Rotating compass */}
            <Animated.View
                style={[
                    styles.compassNeedle,
                    {
                        transform: [
                            { rotate: rotation },
                            { rotate: wobble },
                        ],
                    },
                ]}
            >
                <MaterialIcons name="explore" size={currentSize.icon} color={spinnerColor} />
            </Animated.View>
        </View>
    );
}

/**
 * Enhanced Shimmer Skeleton Loader
 * Shimmer effect moves from left to right
 */
interface ShimmerSkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

export function ShimmerSkeleton({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
}: ShimmerSkeletonProps) {
    const colorScheme = useColorScheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    const bgColor = colorScheme === 'dark' ? '#3D2F20' : '#E8DCC8';
    const shimmerColor = colorScheme === 'dark' ? '#4D3F30' : '#F5F1E8';

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        shimmerAnimation.start();

        return () => shimmerAnimation.stop();
    }, []);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    return (
        <View
            style={[
                styles.skeletonContainer,
                {
                    width,
                    height: height as number,
                    borderRadius,
                    backgroundColor: bgColor,
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    {
                        backgroundColor: shimmerColor,
                        transform: [{ translateX }],
                    },
                ]}
            />
        </View>
    );
}

/**
 * Loading Dots Animation
 */
interface LoadingDotsProps {
    count?: number;
    color?: string;
    size?: number;
}

export function LoadingDots({ count = 3, color, size = 8 }: LoadingDotsProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const dotColor = color ?? theme.accent;

    const dots = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;

    useEffect(() => {
        const animations = dots.map((dot, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 150),
                    Animated.sequence([
                        Animated.timing(dot, {
                            toValue: 1,
                            duration: 300,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0,
                            duration: 300,
                            easing: Easing.in(Easing.quad),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.delay((count - index - 1) * 150),
                ])
            )
        );

        animations.forEach((anim) => anim.start());

        return () => animations.forEach((anim) => anim.stop());
    }, [count]);

    return (
        <View style={styles.dotsContainer}>
            {dots.map((dot, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: dotColor,
                            opacity: dot.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1],
                            }),
                            transform: [
                                {
                                    scale: dot.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1.2],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    spinnerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerBackground: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 2,
    },
    compassNeedle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    skeletonContainer: {
        overflow: 'hidden',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 200,
        opacity: 0.6,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    dot: {
        // Individual dot styles applied inline
    },
});
