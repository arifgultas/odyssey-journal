import { AnimatedEmptyState } from '@/components/animated-empty-state';

import { AnimatedPostCard } from '@/components/animated-post-card';
import { CollectionPickerSheet } from '@/components/collection-picker-sheet';
import { ReportModal } from '@/components/report-modal';
import { PostCardSkeleton } from '@/components/skeleton-loader';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { deletePost, fetchPosts, Post } from '@/lib/posts';
import { generatePostShareUrl, getPostShareMessage, sharePost } from '@/lib/share';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';

// Custom SVG icons
import BellIcon from '@/assets/icons/bell-notification.svg';
import GlobeIcon from '@/assets/icons/globe-earth-world.svg';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [bookmarkingPostId, setBookmarkingPostId] = useState<string | null>(null);

  // Spinning compass animation
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start compass spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    loadCurrentUser();
    loadPosts(0);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
    // If bookmarking (not unbookmarking), show collection picker
    if (isBookmarked) {
      setBookmarkingPostId(postId);
      setShowCollectionPicker(true);
      return;
    }

    // If unbookmarking, directly remove the bookmark
    try {
      await unbookmarkPost(postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, isBookmarked: false } : post
        )
      );
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleCollectionPickerSuccess = (collectionId: string | null) => {
    if (bookmarkingPostId) {
      // Update UI to show post is bookmarked
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === bookmarkingPostId ? { ...post, isBookmarked: true } : post
        )
      );
    }
    setBookmarkingPostId(null);
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
      <AnimatedEmptyState
        icon="explore"
        title={t('home.noAdventures')}
        description={t('home.startSharing')}
        buttonText={t('home.createFirstPost')}
        onButtonPress={handleCreatePost}
        showTypewriter={false}
      />
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

  const renderHeader = () => (
    <View style={[
      styles.header,
      {
        paddingTop: insets.top + Spacing.sm,
        backgroundColor: colorScheme === 'dark'
          ? 'rgba(26, 20, 16, 0.95)'
          : 'rgba(245, 241, 232, 0.95)',
        borderBottomColor: `${theme.accent}33`,
      }
    ]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.push('/map')}
      >
        <GlobeIcon
          width={40}
          height={40}
          fill={colorScheme === 'dark' ? '#F5F1E8' : '#181511'}
          color={colorScheme === 'dark' ? '#F5F1E8' : '#181511'}
        />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t('home.title')}
        </Text>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons
            name="explore"
            size={24}
            color={theme.accent}
            style={styles.compassIcon}
          />
        </Animated.View>
      </View>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.push('/notifications')}
      >
        <BellIcon
          width={40}
          height={40}
          fill={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
          color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
        />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && posts.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {/* Map Texture Background */}
        <View style={[styles.mapTexture, { opacity: colorScheme === 'dark' ? 0.04 : 0.08 }]} />

        {renderHeader()}

        <View style={styles.listContent}>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Map Texture Background - pseudo vintage map effect */}
      <View style={[styles.mapTexture, { opacity: colorScheme === 'dark' ? 0.04 : 0.08 }]} />

      {renderHeader()}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedPostCard
            post={item}
            index={index}
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
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />



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

      {/* Collection Picker Sheet */}
      {bookmarkingPostId && (
        <CollectionPickerSheet
          visible={showCollectionPicker}
          postId={bookmarkingPostId}
          onClose={() => {
            setShowCollectionPicker(false);
            setBookmarkingPostId(null);
          }}
          onSuccess={handleCollectionPickerSuccess}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.accent,
    // This creates a subtle texture effect
    opacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    // Blur effect for iOS
    ...(Platform.OS === 'ios' && {
      backdropFilter: 'blur(8px)',
    }),
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontFamily: Typography.fonts.brandTitle,
    fontSize: 28,
    letterSpacing: 0.5,
  },
  compassIcon: {
    // Drop shadow for the compass
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 160,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fonts.heading,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  emptyButtonText: {
    fontFamily: Typography.fonts.uiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
