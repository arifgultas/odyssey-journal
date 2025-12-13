import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import type { LocationResult, TrendingLocation } from '@/lib/types/search';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LocationCardProps {
    location: LocationResult | TrendingLocation;
    onPress?: () => void;
    showTrending?: boolean;
}

export function LocationCard({ location, onPress, showTrending = false }: LocationCardProps) {
    const isTrending = 'trendScore' in location;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="location" size={24} color={Colors.light.primary} />
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>
                    {location.name}
                </Text>
                <View style={styles.meta}>
                    <Ionicons name="images-outline" size={14} color={Colors.light.textSecondary} />
                    <Text style={styles.postCount}>{location.postCount} posts</Text>
                    {showTrending && isTrending && (
                        <>
                            <View style={styles.dot} />
                            <Ionicons name="trending-up" size={14} color={Colors.light.accent} />
                            <Text style={styles.trendingText}>Trending</Text>
                        </>
                    )}
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    name: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 4,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postCount: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        color: Colors.light.textSecondary,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: Colors.light.textSecondary,
        marginHorizontal: 4,
    },
    trendingText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 12,
        color: Colors.light.accent,
    },
});
