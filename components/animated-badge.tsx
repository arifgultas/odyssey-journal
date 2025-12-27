/**
 * Animated Badge for notifications with pop-in bounce and number flip effects
 * Features:
 * - New: Pop in with bounce
 * - Count change: Number flip animation
 */

import { Colors, Typography } from '@/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

interface AnimatedBadgeProps {
    count: number;
    size?: 'small' | 'medium';
    showZero?: boolean;
}

export function AnimatedBadge({ count, size = 'medium', showZero = false }: AnimatedBadgeProps) {
    const [displayCount, setDisplayCount] = useState(count);
    const [isNew, setIsNew] = useState(false);

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const flipAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(1)).current;

    // Track previous count for flip animation
    const prevCountRef = useRef(count);

    const isSmall = size === 'small';

    useEffect(() => {
        if (count === prevCountRef.current) return;

        const wasZero = prevCountRef.current === 0;
        const isNowZero = count === 0;

        if (wasZero && count > 0) {
            // Pop in animation for new badge
            setIsNew(true);
            scaleAnim.setValue(0);

            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1.3,
                    friction: 4,
                    tension: 180,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 120,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsNew(false));

            setDisplayCount(count);
        } else if (isNowZero && !showZero) {
            // Pop out animation
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.back(2)),
                useNativeDriver: true,
            }).start(() => setDisplayCount(0));
        } else if (count > 0) {
            // Number flip animation for count change
            Animated.sequence([
                // Flip out
                Animated.timing(flipAnim, {
                    toValue: 1,
                    duration: 100,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setDisplayCount(count);
                flipAnim.setValue(-1);

                // Flip in with bounce
                Animated.parallel([
                    Animated.timing(flipAnim, {
                        toValue: 0,
                        duration: 150,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(bounceAnim, {
                            toValue: 1.2,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.spring(bounceAnim, {
                            toValue: 1,
                            friction: 5,
                            tension: 200,
                            useNativeDriver: true,
                        }),
                    ]),
                ]).start();
            });
        }

        prevCountRef.current = count;
    }, [count, showZero]);

    // Initial mount animation
    useEffect(() => {
        if (count > 0 || showZero) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 150,
                useNativeDriver: true,
            }).start();
        }
    }, []);

    if (displayCount === 0 && !showZero) {
        return null;
    }

    const displayText = displayCount > 99 ? '99+' : displayCount.toString();

    // Flip animation transforms
    const rotateX = flipAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-90deg', '0deg', '90deg'],
    });

    const translateY = flipAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-10, 0, 10],
    });

    return (
        <Animated.View
            style={[
                styles.badge,
                isSmall ? styles.badgeSmall : styles.badgeMedium,
                {
                    transform: [
                        { scale: Animated.multiply(scaleAnim, bounceAnim) },
                    ],
                },
                isNew && styles.badgeNew,
            ]}
        >
            <Animated.View
                style={[
                    styles.numberContainer,
                    {
                        transform: [
                            { rotateX },
                            { translateY },
                        ],
                    },
                ]}
            >
                <Text
                    style={[
                        styles.badgeText,
                        isSmall ? styles.badgeTextSmall : styles.badgeTextMedium,
                    ]}
                >
                    {displayText}
                </Text>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    badge: {
        backgroundColor: Colors.light.error,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        paddingHorizontal: 4,
        overflow: 'hidden',
    },
    badgeSmall: {
        height: 16,
        minWidth: 16,
        borderRadius: 8,
    },
    badgeMedium: {
        height: 20,
        minWidth: 20,
        borderRadius: 10,
    },
    badgeNew: {
        shadowColor: Colors.light.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    numberContainer: {
        backfaceVisibility: 'hidden',
    },
    badgeText: {
        color: Colors.light.surface,
        fontFamily: Typography.fonts.bodyBold,
        textAlign: 'center',
    },
    badgeTextSmall: {
        fontSize: 10,
    },
    badgeTextMedium: {
        fontSize: 12,
    },
});
