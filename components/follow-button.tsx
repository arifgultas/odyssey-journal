import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FollowButtonProps {
    isFollowing: boolean;
    onPress: () => void;
    loading?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export function FollowButton({ isFollowing, onPress, loading = false, size = 'medium' }: FollowButtonProps) {
    const sizeStyles = {
        small: {
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
            fontSize: 12,
        },
        medium: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            fontSize: 14,
        },
        large: {
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            fontSize: 16,
        },
    };

    const currentSize = sizeStyles[size];

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    paddingHorizontal: currentSize.paddingHorizontal,
                    paddingVertical: currentSize.paddingVertical,
                },
                isFollowing ? styles.followingButton : styles.followButton,
            ]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={isFollowing ? Colors.light.text : Colors.light.surface}
                />
            ) : (
                <Text
                    style={[
                        styles.buttonText,
                        { fontSize: currentSize.fontSize },
                        isFollowing ? styles.followingText : styles.followText,
                    ]}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    followButton: {
        backgroundColor: Colors.light.accent,
    },
    followingButton: {
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    buttonText: {
        fontFamily: Typography.fonts.bodyBold,
    },
    followText: {
        color: Colors.light.surface,
    },
    followingText: {
        color: Colors.light.text,
    },
});
