import { AnimatedEmptyState } from '@/components/animated-empty-state';

import { AnimatedPostCard } from '@/components/animated-post-card';
import { CollectionPickerSheet } from '@/components/collection-picker-sheet';
import { ReportModal } from '@/components/report-modal';
import { PostCardSkeleton } from '@/components/skeleton-loader';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { getFollowingFeed } from '@/lib/follow';
import { likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { getUnreadNotificationCount } from '@/lib/notifications';
import { getUnreadMessageCount } from '@/lib/chat';
import { deletePost, fetchPosts, Post } from '@/lib/posts';
import { generatePostShareUrl, getPostShareMessage, sharePost } from '@/lib/share';
import { supabase } from '@/lib/supabase';

// Custom SVG icons
import BellIcon from '@/assets/icons/bell-notification.svg';
import GlobeIcon from '@/assets/icons/globe-earth-world.svg';
import MessageIcon from '@/assets/icons/edit-pencil-icon--hand-drawn-sketch-style--monolin.svg';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const { t, language } = useLanguage();
  const { contentContainerStyle } = useResponsive();
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
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const [feedType, setFeedType] = useState<'public' | 'following'>('public');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'location'>('date');

  // Register for push notifications
  usePushNotifications(currentUserId ?? undefined);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    loadPosts(0, true);
  }, [feedType]);

  // Subscribe to real-time notification changes to update badge count
  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;

    const updateCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        if (isMounted) {
          setUnreadNotificationCount(count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Load initial count
    updateCount();

    // Subscribe to all event changes (INSERT, UPDATE, DELETE) on notifications table
    const channel = supabase
      .channel(`unread-count-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('[Realtime Notifications event received]:', payload);
          const newNotif = payload.new as any;
          const oldNotif = payload.old as any;
          if (
            (newNotif && newNotif.user_id === currentUserId) ||
            (oldNotif && oldNotif.user_id === currentUserId)
          ) {
            updateCount();
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime Notifications Status: unread-count-${currentUserId}]:`, status);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Subscribe to real-time message changes to update badge count
  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;

    const updateMsgCount = async () => {
      try {
        const count = await getUnreadMessageCount();
        if (isMounted) {
          setUnreadMessageCount(count);
        }
      } catch (error) {
        console.error('Error fetching unread message count:', error);
      }
    };

    // Load initial count
    updateMsgCount();

    // Subscribe to all event changes (INSERT, UPDATE, DELETE) on messages table
    const channel = supabase
      .channel(`unread-messages-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('[Realtime Messages event received]:', payload);
          const newMsg = payload.new as any;
          const oldMsg = payload.old as any;
          if (
            (newMsg && newMsg.receiver_id === currentUserId) ||
            (oldMsg && oldMsg.receiver_id === currentUserId)
          ) {
            updateMsgCount();
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime Messages Status: unread-messages-${currentUserId}]:`, status);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Subscribe to real-time posts changes to update feed likes_count and comments_count
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`public-posts-realtime-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('[Realtime Posts UPDATE event received]:', payload);
          const updatedPost = payload.new as any;
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === updatedPost.id
                ? {
                  ...post,
                  likes_count: updatedPost.likes_count,
                  comments_count: updatedPost.comments_count,
                }
                : post
            )
          );
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime Posts Status: public-posts-realtime-${currentUserId}]:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  // Refresh feed and unread count when screen gains focus (e.g., coming back from create post or notifications)
  useFocusEffect(
    useCallback(() => {
      const refreshOnFocus = async () => {
        try {
          const count = await getUnreadNotificationCount();
          setUnreadNotificationCount(count);

          const msgCount = await getUnreadMessageCount();
          setUnreadMessageCount(msgCount);
        } catch (error) {
          console.error('Error loading unread counts:', error);
        }
      };
      refreshOnFocus();
      // Refresh posts feed silently
      loadPosts(0, true);
    }, [sortBy, feedType])
  );

  const loadPosts = async (pageNum: number = 0, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 0) {
        setIsLoading(true);
      }

      const newPosts = feedType === 'public'
        ? await fetchPosts(pageNum, 10, sortBy)
        : await getFollowingFeed(pageNum, 10, sortBy);

      if (refresh || pageNum === 0) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
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
      t('post.deleteTitle'),
      t('post.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(postId);
              setPosts(posts.filter(p => p.id !== postId));
              Alert.alert(t('common.success'), t('post.deleteSuccess'));
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert(t('common.error'), t('post.deleteError'));
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

    if (feedType === 'following') {
      return (
        <AnimatedEmptyState
          icon="explore"
          title={t('home.noFollowingPosts') || (language === 'tr' ? 'Henüz Paylaşım Yok' : 'No Posts Yet')}
          description={t('home.exploreTravelers') || (language === 'tr' ? 'Topluluktaki diğer gezginleri keşfedip takip ederek gönderilerini burada görebilirsiniz.' : 'Explore other travelers in the community and follow them to see their posts here.')}
          buttonText={t('home.exploreButton') || (language === 'tr' ? 'Gezginleri Keşfet' : 'Explore Travelers')}
          onButtonPress={() => router.push('/explore')}
          showTypewriter={false}
        />
      );
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

  const renderFeedTabs = () => (
    <View style={[
      styles.tabsContainer,
      {
        backgroundColor: colorScheme === 'dark'
          ? 'rgba(26, 20, 16, 0.95)'
          : 'rgba(245, 241, 232, 0.95)',
        borderBottomColor: `${theme.accent}22`,
      }
    ]}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          feedType === 'public' && { borderBottomColor: theme.accent }
        ]}
        onPress={() => setFeedType('public')}
      >
        <Text style={[
          styles.tabText,
          feedType === 'public' ? { color: theme.accent } : { color: theme.textMuted }
        ]}>
          {t('home.publicFeed') || 'Herkese Açık'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tabButton,
          feedType === 'following' && { borderBottomColor: theme.accent }
        ]}
        onPress={() => setFeedType('following')}
      >
        <Text style={[
          styles.tabText,
          feedType === 'following' ? { color: theme.accent } : { color: theme.textMuted }
        ]}>
          {t('home.followingFeed') || 'Takip Ettiklerim'}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/notifications')}
        >
          <View>
            <BellIcon
              width={34}
              height={34}
              fill={colorScheme === 'dark' ? '#F5F1E8' : '#181511'}
              color={colorScheme === 'dark' ? '#F5F1E8' : '#181511'}
            />
            {unreadNotificationCount > 0 && (
              <View style={[
                styles.notificationBadge,
                {
                  borderColor: colorScheme === 'dark'
                    ? 'rgba(26, 20, 16, 0.95)'
                    : 'rgba(245, 241, 232, 0.95)',
                }
              ]}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotificationCount <= 9 ? unreadNotificationCount : '9+'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
 
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/chat' as any)}
          accessibilityRole="button"
          accessibilityLabel={language === 'tr' ? 'Mektupları ve sohbetleri aç' : 'Open letters and chats'}
        >
          <View>
            <MessageIcon
              width={34}
              height={34}
              fill={colorScheme === 'dark' ? '#F5F1E8' : '#181511'}
              color={colorScheme === 'dark' ? '#F5F1E8' : '#181511'}
              style={{ opacity: colorScheme === 'dark' ? 0.85 : 1 }}
            />
            {unreadMessageCount > 0 && (
              <View style={[
                styles.notificationBadge,
                {
                  borderColor: colorScheme === 'dark'
                    ? 'rgba(26, 20, 16, 0.95)'
                    : 'rgba(245, 241, 232, 0.95)',
                }
              ]}>
                <Text style={styles.notificationBadgeText}>
                  {unreadMessageCount <= 9 ? unreadMessageCount : '9+'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
 
  const renderSortBar = () => (
    <View style={[
      styles.sortBarContainer,
      {
        backgroundColor: colorScheme === 'dark'
          ? 'rgba(26, 20, 16, 0.95)'
          : 'rgba(245, 241, 232, 0.95)',
        borderBottomColor: `${theme.accent}11`,
      }
    ]}>
      <TouchableOpacity
        style={[
          styles.sortButton,
          sortBy === 'date' && { backgroundColor: `${theme.accent}22` }
        ]}
        onPress={() => setSortBy('date')}
        accessibilityRole="button"
        accessibilityLabel={language === 'tr' ? 'En yeni gönderilere göre sırala' : 'Sort by latest posts'}
        accessibilityState={{ selected: sortBy === 'date' }}
      >
        <Text style={[
          styles.sortText,
          sortBy === 'date' ? { color: theme.accent } : { color: theme.textMuted }
        ]}>
          {language === 'tr' ? 'EN YENİ' : 'LATEST'}
        </Text>
      </TouchableOpacity>
 
      <TouchableOpacity
        style={[
          styles.sortButton,
          sortBy === 'popularity' && { backgroundColor: `${theme.accent}22` }
        ]}
        onPress={() => setSortBy('popularity')}
        accessibilityRole="button"
        accessibilityLabel={language === 'tr' ? 'En popüler gönderilere göre sırala' : 'Sort by popular posts'}
        accessibilityState={{ selected: sortBy === 'popularity' }}
      >
        <Text style={[
          styles.sortText,
          sortBy === 'popularity' ? { color: theme.accent } : { color: theme.textMuted }
        ]}>
          {language === 'tr' ? 'POPÜLER' : 'POPULAR'}
        </Text>
      </TouchableOpacity>
 
      <TouchableOpacity
        style={[
          styles.sortButton,
          sortBy === 'location' && { backgroundColor: `${theme.accent}22` }
        ]}
        onPress={() => setSortBy('location')}
        accessibilityRole="button"
        accessibilityLabel={language === 'tr' ? 'Yalnızca konumu olan gönderileri göster' : 'Filter by posts with location'}
        accessibilityState={{ selected: sortBy === 'location' }}
      >
        <Text style={[
          styles.sortText,
          sortBy === 'location' ? { color: theme.accent } : { color: theme.textMuted }
        ]}>
          {language === 'tr' ? 'KONUMLU' : 'LOCATION'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && posts.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {/* Map Texture Background */}
        <View style={[styles.mapTexture, { opacity: colorScheme === 'dark' ? 0.04 : 0.08 }]} />

        <View style={[{ flex: 1 }, contentContainerStyle]}>
          {renderHeader()}
          {renderFeedTabs()}
          {renderSortBar()}

          <View style={styles.listContent}>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Map Texture Background - pseudo vintage map effect */}
      <View style={[styles.mapTexture, { opacity: colorScheme === 'dark' ? 0.04 : 0.08 }]} />

      <View style={[{ flex: 1 }, contentContainerStyle]}>
        {renderHeader()}
        {renderFeedTabs()}
        {renderSortBar()}

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
      </View>
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
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: '#c62828',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 48,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    fontFamily: Typography.fonts.uiBold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sortBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sortText: {
    fontFamily: Typography.fonts.uiBold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
});
