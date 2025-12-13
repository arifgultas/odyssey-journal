import { ProfileHeader } from '@/components/profile-header';
import { ProfileStatsBar } from '@/components/profile-stats-bar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useFollowUser } from '@/hooks/use-follow';
import { useProfile, useUserPosts } from '@/hooks/use-profile';
import type { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function UserProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user: currentUser } = useAuth();

    const { data: profileData, isLoading: profileLoading } = useProfile(id);
    const { data: posts, isLoading: postsLoading } = useUserPosts(id);
    const followMutation = useFollowUser();

    const isCurrentUser = currentUser?.id === id;

    const handleFollowPress = async () => {
        if (!profileData || !id) return;

        try {
            await followMutation.mutateAsync({
                targetUserId: id,
                action: profileData.isFollowing ? 'unfollow' : 'follow',
            });
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleFollowersPress = () => {
        if (id) {
            router.push(`/followers/${id}`);
        }
    };

    const handleFollowingPress = () => {
        if (id) {
            router.push(`/following/${id}`);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handlePostPress = (postId: string) => {
        router.push(`/post-detail/${postId}`);
    };

    if (profileLoading || !profileData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    const renderHeader = () => (
        <>
            <ProfileHeader
                profile={profileData}
                isCurrentUser={isCurrentUser}
                isFollowing={profileData.isFollowing}
                onFollowPress={handleFollowPress}
                isFollowLoading={followMutation.isPending}
            />

            {profileData.stats && (
                <View style={styles.statsContainer}>
                    <ProfileStatsBar
                        stats={profileData.stats}
                        onFollowersPress={handleFollowersPress}
                        onFollowingPress={handleFollowingPress}
                    />
                </View>
            )}

            <View style={styles.gridHeader}>
                <Ionicons name="grid-outline" size={20} color={Colors.light.text} />
                <Text style={styles.gridTitle}>Travel History</Text>
            </View>
        </>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={Colors.light.border} />
            <Text style={styles.emptyText}>No posts yet</Text>
        </View>
    );

    const renderGridItem = ({ item, index }: { item: Post; index: number }) => {
        const col = index % 3;

        return (
            <TouchableOpacity
                style={[
                    styles.gridItem,
                    col === 0 && styles.gridItemLeft,
                    col === 2 && styles.gridItemRight,
                ]}
                onPress={() => handlePostPress(item.id)}
            >
                <View style={styles.gridImagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color={Colors.light.border} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {profileData.username || 'Profile'}
                </Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={posts || []}
                renderItem={renderGridItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={postsLoading ? (
                    <View style={styles.postsLoading}>
                        <ActivityIndicator size="small" color={Colors.light.primary} />
                    </View>
                ) : renderEmpty()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        backgroundColor: Colors.light.surface,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        color: Colors.light.text,
    },
    headerRight: {
        width: 40,
    },
    flatListContent: {
        flexGrow: 1,
    },
    statsContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    gridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.surface,
    },
    gridTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
    },
    gridItem: {
        flex: 1,
        aspectRatio: 1,
        padding: 1,
    },
    gridItemLeft: {
        paddingLeft: 0,
    },
    gridItemRight: {
        paddingRight: 0,
    },
    gridImagePlaceholder: {
        flex: 1,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    postsLoading: {
        paddingVertical: Spacing.xxl,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
        paddingHorizontal: Spacing.xl,
    },
    emptyText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        color: Colors.light.textSecondary,
        marginTop: Spacing.md,
    },
});
