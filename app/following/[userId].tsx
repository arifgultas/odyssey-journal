import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserCard } from '@/components/user-card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { followUser, getFollowing, unfollowUser, UserProfile } from '@/lib/follow';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function FollowingScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();

    const [following, setFollowing] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const loadFollowing = async (pageNum: number = 0, refresh: boolean = false) => {
        if (!userId) return;

        try {
            if (refresh) {
                setIsRefreshing(true);
            } else if (pageNum === 0) {
                setIsLoading(true);
            }

            const data = await getFollowing(userId, pageNum, 20);

            // Query if the current user follows the retrieved users
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const newStates: Record<string, boolean> = {};
            const allFetchedIds = (refresh || pageNum === 0) 
                ? data.map(u => u.id) 
                : [...following.map(u => u.id), ...data.map(u => u.id)];

            if (currentUser && allFetchedIds.length > 0) {
                const { data: followRecords } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', currentUser.id)
                    .in('following_id', allFetchedIds);
                
                if (followRecords) {
                    followRecords.forEach(rec => {
                        newStates[rec.following_id] = true;
                    });
                }
            }

            if (refresh || pageNum === 0) {
                setFollowing(data);
            } else {
                setFollowing([...following, ...data]);
            }
            setFollowingStates(newStates);

            setHasMore(data.length === 20);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading following:', error);
            Alert.alert(t('common.error'), t('following.loadError'));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadFollowing(0);
    }, [userId]);

    const handleRefresh = () => {
        loadFollowing(0, true);
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            loadFollowing(page + 1);
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
            Alert.alert(t('common.error'), t('following.followError'));
        } finally {
            setLoadingStates(prev => ({ ...prev, [targetUserId]: false }));
        }
    };

    const handleUserPress = (user: UserProfile) => {
        router.push({
            pathname: '/user-profile/[id]',
            params: { id: user.id }
        });
    };

    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={80} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text, fontSize: 18 }]}>
                    {t('following.notFollowing')}
                </Text>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    {t('following.notFollowingDesc')}
                </Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || following.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.accent} />
            </View>
        );
    };

    if (isLoading && following.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {t('following.title')}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {t('following.title')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={following}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <UserCard
                        user={item}
                        onPress={() => handleUserPress(item)}
                        onFollowPress={handleFollowPress}
                        isFollowing={followingStates[item.id] !== false}
                        followLoading={loadingStates[item.id] || false}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.accent}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </View>
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
        fontSize: 20,
        letterSpacing: 1,
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
