import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface CustomToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onHide?: () => void;
    visible: boolean;
}

/**
 * CustomToast Component
 * 
 * A themed toast notification component that replaces default alerts.
 * Provides visual feedback with smooth animations and appropriate icons.
 * 
 * @param message - The message to display
 * @param type - The type of toast (success, error, warning, info)
 * @param duration - How long to show the toast in milliseconds (default: 3000)
 * @param onHide - Callback when toast is hidden
 * @param visible - Controls visibility of the toast
 */
export function CustomToast({
    message,
    type = 'info',
    duration = 3000,
    onHide,
    visible,
}: CustomToastProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            // Slide in and fade in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide?.();
        });
    };

    if (!visible) return null;

    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    color: Colors.light.success,
                };
            case 'error':
                return {
                    icon: 'close-circle' as const,
                    color: Colors.light.error,
                };
            case 'warning':
                return {
                    icon: 'warning' as const,
                    color: Colors.light.warning,
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle' as const,
                    color: Colors.light.info,
                };
        }
    };

    const config = getToastConfig();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={[styles.toast, { borderLeftColor: config.color }]}>
                <Ionicons name={config.icon} size={24} color={config.color} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: Spacing.md,
        right: Spacing.md,
        zIndex: 9999,
    },
    toast: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        borderLeftWidth: 4,
        ...Shadows.md,
    },
    message: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.text,
        lineHeight: 20,
    },
});
