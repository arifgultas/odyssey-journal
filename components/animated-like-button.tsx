/**
 * Animated Like Button with heart fill and particle burst effects
 * Features:
 * - Tap: Scale down → up (0.9 → 1.2 → 1.0)
 * - Heart fill: Animate from bottom to top
 * - Particle burst: 6 small hearts spreading out
 */

import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

interface AnimatedLikeButtonProps {
    isLiked: boolean;
    likesCount: number;
    onPress: () => void;
    size?: number;
}

const PARTICLE_COUNT = 6;
const PARTICLE_COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8B94', '#FFEAA7', '#DFE6E9'];

export const AnimatedLikeButton: React.FC<AnimatedLikeButtonProps> = ({
    isLiked,
    likesCount,
    onPress,
    size = 20,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Main heart animations
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fillAnim = useRef(new Animated.Value(isLiked ? 1 : 0)).current;

    // Particle animations
    const particleAnims = useRef(
        Array.from({ length: PARTICLE_COUNT }, () => ({
            scale: new Animated.Value(0),
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
            opacity: new Animated.Value(0),
            rotation: new Animated.Value(0),
        }))
    ).current;

    // Count animation
    const countScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animate fill based on isLiked state
        Animated.timing(fillAnim, {
            toValue: isLiked ? 1 : 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [isLiked]);

    const handlePress = () => {
        // Main heart scale animation sequence
        Animated.sequence([
            // Scale down
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            // Scale up (bounce)
            Animated.spring(scaleAnim, {
                toValue: 1.2,
                friction: 3,
                tension: 200,
                useNativeDriver: true,
            }),
            // Settle back
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();

        // Count scale animation
        Animated.sequence([
            Animated.timing(countScale, {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(countScale, {
                toValue: 1,
                friction: 4,
                tension: 150,
                useNativeDriver: true,
            }),
        ]).start();

        // Only trigger particles when liking (not unliking)
        if (!isLiked) {
            triggerParticleBurst();
        }

        onPress();
    };

    const triggerParticleBurst = () => {
        const angleStep = (2 * Math.PI) / PARTICLE_COUNT;
        const distance = 30;

        particleAnims.forEach((anim, index) => {
            const angle = angleStep * index - Math.PI / 2; // Start from top
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            const randomRotation = Math.random() * 360;

            // Reset values
            anim.scale.setValue(0);
            anim.translateX.setValue(0);
            anim.translateY.setValue(0);
            anim.opacity.setValue(1);
            anim.rotation.setValue(0);

            // Animate particles
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(anim.scale, {
                        toValue: 1.2,
                        duration: 200,
                        easing: Easing.out(Easing.back(2)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.scale, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(anim.translateX, {
                    toValue: targetX,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: targetY,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.rotation, {
                    toValue: randomRotation,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const fillColor = fillAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.textMuted, Colors.light.error],
    });

    return (
        <Pressable onPress={handlePress} style={styles.container}>
            {/* Particle burst container */}
            <View style={styles.particleContainer}>
                {particleAnims.map((anim, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.particle,
                            {
                                transform: [
                                    { translateX: anim.translateX },
                                    { translateY: anim.translateY },
                                    { scale: anim.scale },
                                    {
                                        rotate: anim.rotation.interpolate({
                                            inputRange: [0, 360],
                                            outputRange: ['0deg', '360deg'],
                                        }),
                                    },
                                ],
                                opacity: anim.opacity,
                            },
                        ]}
                    >
                        <Ionicons
                            name="heart"
                            size={8}
                            color={PARTICLE_COLORS[index % PARTICLE_COLORS.length]}
                        />
                    </Animated.View>
                ))}
            </View>

            {/* Main heart button */}
            <Animated.View style={[styles.buttonContent, { transform: [{ scale: scaleAnim }] }]}>
                <Animated.Text style={[styles.heartIcon, { color: fillColor }]}>
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={size}
                        color={isLiked ? Colors.light.error : theme.textMuted}
                    />
                </Animated.Text>
            </Animated.View>

            {/* Animated count */}
            <Animated.Text
                style={[
                    styles.countText,
                    {
                        color: isLiked ? Colors.light.error : theme.textMuted,
                        transform: [{ scale: countScale }],
                    },
                ]}
            >
                {likesCount}
            </Animated.Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    particleContainer: {
        position: 'absolute',
        left: 10,
        top: 10,
        zIndex: 10,
    },
    particle: {
        position: 'absolute',
    },
    buttonContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    heartIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 13,
    },
});
