import { FloatingActionButton } from '@/components/floating-action-button';
import { PostCard } from '@/components/post-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { fetchPosts, Post } from '@/lib/posts';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum: number = 0, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 0) {
        setIsLoading(true);
      }

      const newPosts = await fetchPosts(pageNum, 10);

      if (refresh || pageNum === 0) {
        setPosts(newPosts);
      } else {
        setPosts([...posts, ...newPosts]);
      }

      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts(0);
  }, []);

  const handleRefresh = () => {
    loadPosts(0, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1);
    }
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  const handlePostPress = (post: Post) => {
    router.push({
      pathname: '/post-detail/[id]',
      params: { id: post.id }
    });
  };

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No Posts Yet
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Start sharing your travel adventures!
        </ThemedText>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || posts.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.light.accent} />
      </View>
    );
  };

  if (isLoading && posts.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Odyssey Journal
          </ThemedText>
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
        <ThemedText type="title" style={styles.headerTitle}>
          Odyssey Journal
        </ThemedText>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => handlePostPress(item)}
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

      <FloatingActionButton onPress={handleCreatePost} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
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

