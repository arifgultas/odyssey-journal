/**
 * Animated Empty State with floating icon and typewriter text effects
 * Features:
 * - Icon: Floating animation (subtle up/down)
 * - Text: Typewriter effect (optional)
 */

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AnimatedEmptyStateProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    description: string;
    buttonText?: string;
    onButtonPress?: () => void;
    showTypewriter?: boolean;
}

export function AnimatedEmptyState({
    icon,
    title,
    description,
    buttonText,
    onButtonPress,
    showTypewriter = false,
}: AnimatedEmptyStateProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Animation values
    const floatAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Typewriter state
    const [displayedTitle, setDisplayedTitle] = useState(showTypewriter ? '' : title);
    const [displayedDescription, setDisplayedDescription] = useState(showTypewriter ? '' : description);
    const [titleComplete, setTitleComplete] = useState(!showTypewriter);

    // Floating animation - subtle up and down
    useEffect(() => {
        const floatingAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        floatingAnimation.start();

        // Subtle rotation animation
        const rotateAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 4000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        rotateAnimation.start();

        return () => {
            floatingAnimation.stop();
            rotateAnimation.stop();
        };
    }, []);

    // Fade in animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (!showTypewriter) return;

        let titleIndex = 0;
        let descIndex = 0;

        // Type title first
        const titleInterval = setInterval(() => {
            if (titleIndex <= title.length) {
                setDisplayedTitle(title.substring(0, titleIndex));
                titleIndex++;
            } else {
                clearInterval(titleInterval);
                setTitleComplete(true);

                // Then type description
                const descInterval = setInterval(() => {
                    if (descIndex <= description.length) {
                        setDisplayedDescription(description.substring(0, descIndex));
                        descIndex++;
                    } else {
                        clearInterval(descInterval);
                    }
                }, 30);
            }
        }, 50);

        return () => {
            clearInterval(titleInterval);
        };
    }, [showTypewriter, title, description]);

    const handleButtonPressIn = () => {
        Animated.timing(buttonScale, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 4,
            tension: 200,
            useNativeDriver: true,
        }).start();
    };

    // Transform interpolations
    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg'],
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Floating icon */}
            <Animated.View
                style={[
                    styles.iconContainer,
                    {
                        transform: [
                            { translateY },
                            { rotate },
                        ],
                    },
                ]}
            >
                <MaterialIcons
                    name={icon}
                    size={64}
                    color={theme.accent}
                    style={{ opacity: 0.6 }}
                />
            </Animated.View>

            {/* Title with optional typewriter cursor */}
            <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: theme.text }]}>
                    {displayedTitle}
                    {showTypewriter && !titleComplete && (
                        <Text style={[styles.cursor, { color: theme.accent }]}>|</Text>
                    )}
                </Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                    {displayedDescription}
                    {showTypewriter && titleComplete && displayedDescription.length < description.length && (
                        <Text style={[styles.cursor, { color: theme.accent }]}>|</Text>
                    )}
                </Text>
            </View>

            {/* Action button */}
            {buttonText && onButtonPress && (
                <TouchableOpacity
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={onButtonPress}
                    activeOpacity={1}
                >
                    <Animated.View
                        style={[
                            styles.button,
                            {
                                backgroundColor: theme.accent,
                                transform: [{ scale: buttonScale }],
                            },
                        ]}
                    >
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </Animated.View>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl * 2,
        paddingHorizontal: Spacing.lg,
    },
    iconContainer: {
        marginBottom: Spacing.md,
    },
    titleContainer: {
        marginBottom: Spacing.sm,
        minHeight: 32,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        textAlign: 'center',
    },
    cursor: {
        fontWeight: '100',
    },
    descriptionContainer: {
        marginBottom: Spacing.lg,
        minHeight: 40,
    },
    description: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    button: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    buttonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
        color: '#FFFFFF',
    },
});
