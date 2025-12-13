import { Colors } from '@/constants/theme';
import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface PaperBackgroundProps {
    children: ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'surface';
}

/**
 * PaperBackground Component
 * 
 * Provides a consistent paper-like background texture for the app.
 * Wraps content with the warm parchment color from our design system.
 * 
 * @param children - Content to be wrapped
 * @param style - Additional styles to apply
 * @param variant - 'default' for parchment background, 'surface' for white cards
 */
export function PaperBackground({
    children,
    style,
    variant = 'default'
}: PaperBackgroundProps) {
    const backgroundColor = variant === 'surface'
        ? Colors.light.surface
        : Colors.light.background;

    return (
        <View style={[styles.container, { backgroundColor }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
