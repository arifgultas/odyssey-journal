import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { UserProfile } from '@/lib/follow';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FollowButton } from './follow-button';

interface UserCardProps {
    user: UserProfile;
    onPress?: () => void;
    onFollowPress?: (userId: string, isFollowing: boolean) => void;
    showFollowButton?: boolean;
    isFollowing?: boolean;
    followLoading?: boolean;
}

export function UserCard({
    user,
    onPress,
    onFollowPress,
    showFollowButton = true,
    isFollowing = false,
    followLoading = false
}: UserCardProps) {
    const handleFollowPress = () => {
        onFollowPress?.(user.id, !isFollowing);
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={styles.content}>
                {/* Avatar */}
                <View style={styles.avatar}>
                    {user.avatar_url ? (
                        <Image
                            source={{ uri: user.avatar_url }}
                            style={styles.avatarImage}
                            contentFit="cover"
                        />
                    ) : (
                        <Ionicons name="person" size={32} color={Colors.light.textMuted} />
                    )}
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <Text style={styles.fullName} numberOfLines={1}>
                        {user.full_name || user.username || 'Unknown User'}
                    </Text>
                    {user.username && (
                        <Text style={styles.username} numberOfLines={1}>
                            @{user.username}
                        </Text>
                    )}
                    {user.bio && (
                        <Text style={styles.bio} numberOfLines={2}>
                            {user.bio}
                        </Text>
                    )}
                    <View style={styles.stats}>
                        <Text style={styles.statText}>
                            <Text style={styles.statNumber}>{user.followers_count || 0}</Text> followers
                        </Text>
                        <Text style={styles.statDivider}>•</Text>
                        <Text style={styles.statText}>
                            <Text style={styles.statNumber}>{user.following_count || 0}</Text> following
                        </Text>
                    </View>
                </View>

                {/* Follow Button */}
                {showFollowButton && (
                    <FollowButton
                        isFollowing={isFollowing}
                        onPress={handleFollowPress}
                        loading={followLoading}
                        size="small"
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        marginBottom: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        ...Shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    fullName: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
    },
    username: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    bio: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        color: Colors.light.textSecondary,
        marginTop: 4,
        lineHeight: 18,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: 4,
    },
    statText: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.textMuted,
    },
    statNumber: {
        fontFamily: Typography.fonts.bodyBold,
        color: Colors.light.text,
    },
    statDivider: {
        color: Colors.light.textMuted,
    },
});
