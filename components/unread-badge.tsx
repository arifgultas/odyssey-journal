import { Colors, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface UnreadBadgeProps {
    count: number;
    size?: 'small' | 'medium';
}

export function UnreadBadge({ count, size = 'medium' }: UnreadBadgeProps) {
    if (count === 0) return null;

    const displayCount = count > 99 ? '99+' : count.toString();
    const isSmall = size === 'small';

    return (
        <View style={[
            styles.badge,
            isSmall ? styles.badgeSmall : styles.badgeMedium
        ]}>
            <Text style={[
                styles.badgeText,
                isSmall ? styles.badgeTextSmall : styles.badgeTextMedium
            ]}>
                {displayCount}
            </Text>
        </View>
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
    },
    badgeSmall: {
        height: 16,
        minWidth: 16,
    },
    badgeMedium: {
        height: 20,
        minWidth: 20,
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
