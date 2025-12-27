/**
 * Animated Pull to Refresh with compass rotation animation
 * Features:
 * - Pull: Compass rotates based on pull distance
 * - Release: Compass completes a full rotation and stops
 */

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface AnimatedPullRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    pullThreshold?: number;
    maxPullDistance?: number;
}

export function AnimatedPullRefresh({
    onRefresh,
    children,
    pullThreshold = 80,
    maxPullDistance = 120,
}: AnimatedPullRefreshProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [canRefresh, setCanRefresh] = useState(false);
    const [currentRotation, setCurrentRotation] = useState(0);

    // Animation values
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const pullAnim = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const scrollViewRef = useRef<ScrollView>(null);

    // Continuous spin animation during refresh
    useEffect(() => {
        if (isRefreshing) {
            const spinAnimation = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            spinAnimation.start();

            return () => spinAnimation.stop();
        } else {
            spinAnim.setValue(0);
        }
    }, [isRefreshing]);

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;

            if (offsetY < 0 && !isRefreshing) {
                const distance = Math.abs(offsetY);
                setPullDistance(distance);

                // Update pull animation value
                pullAnim.setValue(Math.min(distance / maxPullDistance, 1));

                // Update rotation based on pull distance (multiple rotations)
                const rotationProgress = (distance / maxPullDistance) * 4; // 4 full rotations at max pull
                rotationAnim.setValue(rotationProgress);
                setCurrentRotation(rotationProgress);

                // Scale and opacity based on pull
                const progress = Math.min(distance / pullThreshold, 1);
                scaleAnim.setValue(0.5 + progress * 0.5);
                opacityAnim.setValue(progress);

                // Check if can trigger refresh
                setCanRefresh(distance >= pullThreshold);
            } else if (offsetY >= 0) {
                setPullDistance(0);
                pullAnim.setValue(0);
                if (!isRefreshing) {
                    scaleAnim.setValue(0.5);
                    opacityAnim.setValue(0);
                }
            }
        },
        [isRefreshing, maxPullDistance, pullThreshold]
    );

    const handleScrollEndDrag = useCallback(async () => {
        if (canRefresh && !isRefreshing) {
            setIsRefreshing(true);

            // Complete rotation animation on release
            Animated.sequence([
                Animated.timing(rotationAnim, {
                    toValue: Math.ceil(currentRotation) + 1, // Complete to next full rotation
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();

            try {
                await onRefresh();
            } finally {
                // Finish animation
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 0.5,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setIsRefreshing(false);
                    setCanRefresh(false);
                    rotationAnim.setValue(0);
                });
            }
        }
    }, [canRefresh, isRefreshing, onRefresh]);

    // Rotation transform
    const rotation = Animated.add(
        rotationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 360],
        }),
        spinAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 360],
        })
    ).interpolate({
        inputRange: [0, 720],
        outputRange: ['0deg', '720deg'],
    });

    return (
        <View style={styles.container}>
            {/* Pull to refresh indicator */}
            <Animated.View
                style={[
                    styles.refreshContainer,
                    {
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.compassContainer,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                            transform: [{ rotate: rotation }],
                        },
                    ]}
                >
                    <MaterialIcons name="explore" size={32} color={theme.accent} />
                </Animated.View>
                <Text style={[styles.refreshText, { color: theme.textSecondary }]}>
                    {isRefreshing
                        ? 'Refreshing...'
                        : canRefresh
                            ? 'Release to refresh'
                            : 'Pull to refresh'}
                </Text>
            </Animated.View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                onScroll={handleScroll}
                onScrollEndDrag={handleScrollEndDrag}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    refreshContainer: {
        position: 'absolute',
        top: Spacing.lg,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    compassContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    refreshText: {
        marginTop: Spacing.sm,
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: Spacing.md,
    },
});
