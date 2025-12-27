/**
 * Animated Floating Action Button with breathing, shrink, and ripple effects
 * Features:
 * - Idle: Subtle breathing animation
 * - Scroll down: Shrink to icon only (using scale)
 * - Tap: Ripple + scale feedback
 */

import { Colors, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

interface AnimatedFABProps {
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
    backgroundColor?: string;
    style?: ViewStyle;
    isScrollingDown?: boolean;
}

export function AnimatedFAB({
    onPress,
    icon = 'add',
    size = 24,
    color,
    backgroundColor,
    style,
    isScrollingDown = false,
}: AnimatedFABProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const finalColor = color ?? theme.surface;
    const finalBgColor = backgroundColor ?? theme.accent;

    // Animation values - all using useNativeDriver: true compatible props
    const breathingAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shrinkScale = useRef(new Animated.Value(isScrollingDown ? 0.85 : 1)).current;
    const rippleScale = useRef(new Animated.Value(0)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;

    // Breathing animation - subtle scale oscillation
    useEffect(() => {
        const breathingAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(breathingAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(breathingAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        breathingAnimation.start();

        return () => breathingAnimation.stop();
    }, []);

    // Scroll shrink animation - using scale instead of width/height
    useEffect(() => {
        Animated.spring(shrinkScale, {
            toValue: isScrollingDown ? 0.85 : 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, [isScrollingDown]);

    const handlePressIn = () => {
        // Scale down on press
        Animated.timing(scaleAnim, {
            toValue: 0.92,
            duration: 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();

        // Start ripple
        rippleScale.setValue(0);
        rippleOpacity.setValue(0.4);

        Animated.parallel([
            Animated.timing(rippleScale, {
                toValue: 2.5,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(rippleOpacity, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        // Spring back
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 200,
            useNativeDriver: true,
        }).start();
    };

    // Combined scale - breathing * press * shrink
    const combinedScale = Animated.multiply(
        Animated.multiply(breathingAnim, scaleAnim),
        shrinkScale
    );

    return (
        <Animated.View
            style={[
                styles.fabContainer,
                {
                    transform: [{ scale: combinedScale }],
                },
                style,
            ]}
        >
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <View
                    style={[
                        styles.fab,
                        {
                            backgroundColor: finalBgColor,
                        },
                    ]}
                >
                    {/* Ripple effect */}
                    <Animated.View
                        style={[
                            styles.ripple,
                            {
                                backgroundColor: 'white',
                                transform: [{ scale: rippleScale }],
                                opacity: rippleOpacity,
                            },
                        ]}
                    />

                    <View style={styles.content}>
                        <Ionicons name={icon} size={size} color={finalColor} />
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...Shadows.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
    },
});
