/**
 * Animated Follow Button with morph and checkmark draw effects
 * Features:
 * - Tap: Button morph (text change with fade)
 * - Success: Checkmark draw animation
 */

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    UIManager,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AnimatedFollowButtonProps {
    isFollowing: boolean;
    onPress: () => void;
    loading?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function AnimatedFollowButton({
    isFollowing,
    onPress,
    loading = false,
    size = 'medium',
}: AnimatedFollowButtonProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const textOpacity = useRef(new Animated.Value(1)).current;
    const checkmarkProgress = useRef(new Animated.Value(0)).current;
    const checkmarkOpacity = useRef(new Animated.Value(0)).current;
    const buttonWidth = useRef(new Animated.Value(80)).current;
    const backgroundColorAnim = useRef(new Animated.Value(isFollowing ? 1 : 0)).current;

    // For showing checkmark temporarily
    const [showCheckmark, setShowCheckmark] = useState(false);

    const sizeStyles = {
        small: {
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
            fontSize: 12,
            iconSize: 12,
            minWidth: 70,
        },
        medium: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            fontSize: 14,
            iconSize: 14,
            minWidth: 90,
        },
        large: {
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            fontSize: 16,
            iconSize: 16,
            minWidth: 110,
        },
    };

    const currentSize = sizeStyles[size];

    useEffect(() => {
        // Animate background color
        Animated.timing(backgroundColorAnim, {
            toValue: isFollowing ? 1 : 0,
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
        }).start();
    }, [isFollowing]);

    const handlePress = () => {
        if (loading) return;

        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Text fade animation
        Animated.sequence([
            Animated.timing(textOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // If following (success), show checkmark animation
        if (!isFollowing) {
            setShowCheckmark(true);

            // Draw checkmark animation
            Animated.sequence([
                Animated.timing(checkmarkOpacity, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(checkmarkProgress, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                    useNativeDriver: false,
                }),
            ]).start(() => {
                // Hide checkmark after animation
                setTimeout(() => {
                    Animated.timing(checkmarkOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        setShowCheckmark(false);
                        checkmarkProgress.setValue(0);
                    });
                }, 500);
            });
        }

        // Layout animation for button morph
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        onPress();
    };

    const backgroundColor = backgroundColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.accent, theme.surface],
    });

    const borderColor = backgroundColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.accent, theme.border],
    });

    const textColor = isFollowing ? theme.text : theme.surface;

    // Checkmark path length for draw animation
    const strokeDashoffset = checkmarkProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 0],
    });

    return (
        <Pressable onPress={handlePress} disabled={loading}>
            <Animated.View
                style={[
                    styles.button,
                    {
                        paddingHorizontal: currentSize.paddingHorizontal,
                        paddingVertical: currentSize.paddingVertical,
                        minWidth: currentSize.minWidth,
                        backgroundColor,
                        borderColor,
                        borderWidth: isFollowing ? 1 : 0,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={isFollowing ? theme.text : theme.surface}
                    />
                ) : (
                    <View style={styles.buttonContent}>
                        {/* Checkmark overlay */}
                        {showCheckmark && (
                            <Animated.View style={[styles.checkmarkContainer, { opacity: checkmarkOpacity }]}>
                                <Svg width={currentSize.iconSize} height={currentSize.iconSize} viewBox="0 0 24 24">
                                    <AnimatedPath
                                        d="M5 12l5 5L19 7"
                                        stroke={textColor}
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        strokeDasharray={24}
                                        strokeDashoffset={strokeDashoffset}
                                    />
                                </Svg>
                            </Animated.View>
                        )}

                        {/* Icon */}
                        {isFollowing && !showCheckmark && (
                            <Ionicons
                                name="checkmark"
                                size={currentSize.iconSize}
                                color={textColor}
                                style={styles.icon}
                            />
                        )}

                        {/* Text */}
                        <Animated.Text
                            style={[
                                styles.buttonText,
                                {
                                    fontSize: currentSize.fontSize,
                                    color: textColor,
                                    opacity: textOpacity,
                                },
                            ]}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Animated.Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 4,
    },
    buttonText: {
        fontFamily: Typography.fonts.bodyBold,
    },
    checkmarkContainer: {
        position: 'absolute',
        left: -20,
    },
});
