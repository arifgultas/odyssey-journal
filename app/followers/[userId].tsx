import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserCard } from '@/components/user-card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { followUser, getFollowers, unfollowUser, UserProfile } from '@/lib/follow';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FollowersScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const [followers, setFollowers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const loadFollowers = async (pageNum: number = 0, refresh: boolean = false) => {
        if (!userId) return;

        try {
            if (refresh) {
                setIsRefreshing(true);
            } else if (pageNum === 0) {
                setIsLoading(true);
            }

            const data = await getFollowers(userId, pageNum, 20);

            if (refresh || pageNum === 0) {
                setFollowers(data);
            } else {
                setFollowers([...followers, ...data]);
            }

            setHasMore(data.length === 20);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading followers:', error);
            Alert.alert('Error', 'Failed to load followers');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadFollowers(0);
    }, [userId]);

    const handleRefresh = () => {
        loadFollowers(0, true);
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            loadFollowers(page + 1);
        }
    };

    const handleFollowPress = async (targetUserId: string, shouldFollow: boolean) => {
        setLoadingStates(prev => ({ ...prev, [targetUserId]: true }));

        try {
            if (shouldFollow) {
                await followUser(targetUserId);
            } else {
                await unfollowUser(targetUserId);
            }

            setFollowingStates(prev => ({ ...prev, [targetUserId]: shouldFollow }));
        } catch (error) {
            console.error('Error toggling follow:', error);
            Alert.alert('Error', 'Failed to update follow status');
        } finally {
            setLoadingStates(prev => ({ ...prev, [targetUserId]: false }));
        }
    };

    const handleUserPress = (user: UserProfile) => {
        // TODO: Create user profile screen
        // router.push({
        //     pathname: '/user-profile/[id]',
        //     params: { id: user.id }
        // });
        console.log('User pressed:', user.username);
    };

    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={80} color={Colors.light.textMuted} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                    No Followers Yet
                </ThemedText>
                <ThemedText style={styles.emptyText}>
                    When people follow this user, they'll appear here
                </ThemedText>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || followers.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.light.accent} />
            </View>
        );
    };

    if (isLoading && followers.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                    <ThemedText type="title" style={styles.headerTitle}>
                        Followers
                    </ThemedText>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.accent} />
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.headerTitle}>
                    Followers
                </ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={followers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <UserCard
                        user={item}
                        onPress={() => handleUserPress(item)}
                        onFollowPress={handleFollowPress}
                        isFollowing={followingStates[item.id] || false}
                        followLoading={loadingStates[item.id] || false}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.light.accent}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
    },
    listContent: {
        padding: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl * 2,
        gap: Spacing.md,
    },
    emptyTitle: {
        marginTop: Spacing.md,
        fontFamily: Typography.fonts.heading,
    },
    emptyText: {
        color: Colors.light.textMuted,
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
});
