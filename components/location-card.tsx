import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatPostLocation } from '@/lib/location-formatter';
import type { LocationResult, TrendingLocation } from '@/lib/types/search';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mirrorIcon } from '@/lib/rtl';

interface LocationCardProps {
    location: LocationResult | TrendingLocation;
    onPress?: () => void;
    showTrending?: boolean;
}

export function LocationCard({ location, onPress, showTrending = false }: LocationCardProps) {
    const { t, language } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isTrending = 'trendScore' in location;
    const displayName = formatPostLocation(
        {
            city: location.city,
            country: location.country,
            countryCode: location.countryCode,
            name: location.name,
        },
        language,
        location.name
    );

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.surface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="location" size={24} color={theme.primary} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                    {displayName}
                </Text>
                <View style={styles.meta}>
                    <Ionicons name="images-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.postCount, { color: theme.textSecondary }]}>{t('explore.postCount', { count: location.postCount })}</Text>
                    {showTrending && isTrending && (
                        <>
                            <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                            <Ionicons name="trending-up" size={14} color={theme.accent} />
                            <Text style={[styles.trendingText, { color: theme.accent }]}>{t('explore.trending')}</Text>
                        </>
                    )}
                </View>
            </View>

            <Ionicons name={mirrorIcon('chevron-forward')} size={20} color={theme.textSecondary} />
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
        marginEnd: Spacing.md,
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
