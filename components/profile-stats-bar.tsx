import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ProfileStats } from '@/lib/types/profile';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileStatsBarProps {
    stats: ProfileStats;
    onPostsPress?: () => void;
    onFollowersPress?: () => void;
    onFollowingPress?: () => void;
}

export function ProfileStatsBar({
    stats,
    onPostsPress,
    onFollowersPress,
    onFollowingPress,
}: ProfileStatsBarProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity
                style={styles.statItem}
                onPress={onPostsPress}
                disabled={!onPostsPress}
            >
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.postsCount}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Posts</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
                style={styles.statItem}
                onPress={onFollowersPress}
                disabled={!onFollowersPress}
            >
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.followersCount}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
                style={styles.statItem}
                onPress={onFollowingPress}
                disabled={!onFollowingPress}
            >
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.followingCount}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Following</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.countriesVisited}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Countries</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        color: Colors.light.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.light.border,
    },
});
