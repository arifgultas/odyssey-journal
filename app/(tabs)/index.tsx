import { FloatingActionButton } from '@/components/floating-action-button';
import { PostCard } from '@/components/post-card';
import { ReportModal } from '@/components/report-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { bookmarkPost, likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { deletePost, fetchPosts, Post } from '@/lib/posts';
import { generatePostShareUrl, getPostShareMessage, sharePost } from '@/lib/share';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
    loadPosts(0);
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

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
      Alert.alert('Error', 'Failed to load posts');
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

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }

      // Update local state
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
      // Revert optimistic update on error
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
      }

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, isBookmarked } : post
        )
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert optimistic update on error
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, isBookmarked: !isBookmarked } : post
        )
      );
    }
  };

  const handleComment = (postId: string) => {
    router.push({
      pathname: '/comments/[postId]',
      params: { postId }
    });
  };

  const handleShare = async (post: Post) => {
    const shareUrl = generatePostShareUrl(post.id);
    const shareMessage = getPostShareMessage(post.title, post.content);

    await sharePost({
      title: post.title,
      message: shareMessage,
      url: shareUrl,
    });
  };

  const handleDelete = async (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(postId);
              setPosts(posts.filter(p => p.id !== postId));
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleReport = (postId: string) => {
    setSelectedPostId(postId);
    setShowReportModal(true);
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
            onLike={handleLike}
            onBookmark={handleBookmark}
            onComment={() => handleComment(item.id)}
            onShare={() => handleShare(item)}
            onDelete={() => handleDelete(item.id)}
            onReport={() => handleReport(item.id)}
            isOwnPost={currentUserId === item.user_id}
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

      {/* Report Modal */}
      {selectedPostId && (
        <ReportModal
          visible={showReportModal}
          postId={selectedPostId}
          onClose={() => setShowReportModal(false)}
          onReported={() => {
            // Optional: Add any post-report actions
          }}
        />
      )}
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

