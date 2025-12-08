import { Colors, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FloatingActionButtonProps {
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
    backgroundColor?: string;
    style?: ViewStyle;
}

export function FloatingActionButton({
    onPress,
    icon = 'add',
    size = 24,
    color = Colors.light.surface,
    backgroundColor = Colors.light.accent,
    style,
}: FloatingActionButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.fab, { backgroundColor }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name={icon} size={size} color={color} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.lg,
    },
});
