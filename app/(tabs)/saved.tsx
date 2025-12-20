import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bookmarkPost, getBookmarkedPosts, likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SavedPostsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const loadBookmarkedPosts = async (pageNum: number = 0, refresh: boolean = false) => {
        try {
            if (refresh) {
                setIsRefreshing(true);
            } else if (pageNum === 0) {
                setIsLoading(true);
            }

            const bookmarkedPosts = await getBookmarkedPosts(pageNum, 10);

            if (refresh || pageNum === 0) {
                setPosts(bookmarkedPosts);
            } else {
                setPosts([...posts, ...bookmarkedPosts]);
            }

            setHasMore(bookmarkedPosts.length === 10);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading bookmarked posts:', error);
            Alert.alert('Error', 'Failed to load saved posts');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Reload when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadBookmarkedPosts(0, true);
        }, [])
    );

    const handleRefresh = () => {
        loadBookmarkedPosts(0, true);
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            loadBookmarkedPosts(page + 1);
        }
    };

    const handlePostPress = (post: Post) => {
        router.push({
            pathname: '/post-detail/[id]',
            params: { id: post.id }
        });
    };

    const handleLike = async (postId: string, isLiked: boolean) => {
        try {
            if (isLiked) {
                await likePost(postId);
            } else {
                await unlikePost(postId);
            }

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            isLiked,
                            likes_count: isLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1)
                        }
                        : post
                )
            );
        } catch (error) {
            console.error('Error toggling like:', error);
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            isLiked: !isLiked,
                            likes_count: !isLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1)
                        }
                        : post
                )
            );
        }
    };

    const handleBookmark = async (postId: string, isBookmarked: boolean) => {
        try {
            if (isBookmarked) {
                await bookmarkPost(postId);
            } else {
                await unbookmarkPost(postId);
                // Remove from list when unbookmarked
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            // Reload on error
            loadBookmarkedPosts(0, true);
        }
    };

    const renderEmpty = () => {
        if (isLoading) {
            return null;
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="bookmark-outline" size={80} color={theme.textMuted} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                    No Saved Posts
                </ThemedText>
                <ThemedText style={styles.emptyText}>
                    Posts you bookmark will appear here
                </ThemedText>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || posts.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.accent} />
            </View>
        );
    };

    if (isLoading && posts.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.md, borderBottomColor: theme.border }]}>
                    <ThemedText type="title" style={styles.headerTitle}>
                        Saved Posts
                    </ThemedText>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + Spacing.md, borderBottomColor: theme.border }]}>
                <ThemedText type="title" style={styles.headerTitle}>
                    Saved Posts
                </ThemedText>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <PostCard
                        post={{ ...item, isBookmarked: true }}
                        index={index}
                        onPress={() => handlePostPress(item)}
                        onLike={handleLike}
                        onBookmark={handleBookmark}
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
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
        paddingBottom: 160,
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
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
});
