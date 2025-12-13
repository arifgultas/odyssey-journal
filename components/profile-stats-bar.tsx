import { Colors, Spacing, Typography } from '@/constants/theme';
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
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.statItem}
                onPress={onPostsPress}
                disabled={!onPostsPress}
            >
                <Text style={styles.statNumber}>{stats.postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
                style={styles.statItem}
                onPress={onFollowersPress}
                disabled={!onFollowersPress}
            >
                <Text style={styles.statNumber}>{stats.followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
                style={styles.statItem}
                onPress={onFollowingPress}
                disabled={!onFollowingPress}
            >
                <Text style={styles.statNumber}>{stats.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.countriesVisited}</Text>
                <Text style={styles.statLabel}>Countries</Text>
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
