import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserCard } from '@/components/user-card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { followUser, getFollowSuggestions, unfollowUser, UserProfile } from '@/lib/follow';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const loadSuggestions = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getFollowSuggestions(20);
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      Alert.alert('Error', 'Failed to load suggestions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleRefresh = () => {
    loadSuggestions(true);
  };

  const handleFollowPress = async (userId: string, shouldFollow: boolean) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }));

    try {
      if (shouldFollow) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }

      setFollowingStates(prev => ({ ...prev, [userId]: shouldFollow }));

      // Remove from suggestions if followed
      if (shouldFollow) {
        setSuggestions(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };


  const handleUserPress = (user: UserProfile) => {
    // TODO: Create user profile screen
    // router.push({
    //   pathname: '/user-profile/[id]',
    //   params: { id: user.id }
    // });
    console.log('User pressed:', user.username);
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={80} color={Colors.light.textMuted} />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No Suggestions
        </ThemedText>
        <Text style={styles.emptyText}>
          Check back later for people to follow
        </Text>
      </View>
    );
  };

  if (isLoading && suggestions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">Explore</ThemedText>
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
        <ThemedText type="title">Explore</ThemedText>
      </View>

      <FlatList
        data={suggestions}
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
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.sectionTitle}>Suggested People</Text>
            <Text style={styles.sectionSubtitle}>
              Discover and connect with other travelers
            </Text>
          </View>
        }
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
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerSection: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
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
    fontFamily: Typography.fonts.body,
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
