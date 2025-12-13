import { CategoryCard } from '@/components/category-card';
import { DestinationCard } from '@/components/destination-card';
import { LocationCard } from '@/components/location-card';
import { SearchBar } from '@/components/search-bar';
import { UserCard } from '@/components/user-card';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useFollowUser } from '@/hooks/use-follow';
import {
  useDeleteSearchHistoryItem,
  usePopularDestinations,
  useRecommendedPlaces,
  useSaveSearchHistory,
  useSearch,
  useSearchHistory,
  useSuggestedUsers,
  useTrendingLocations,
  useTrendingPosts,
} from '@/hooks/use-search';
import { TRAVEL_CATEGORIES } from '@/lib/types/categories';
import type { SearchFilters } from '@/lib/types/search';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type TabType = 'all' | 'locations' | 'users';
type SortType = 'recent' | 'popular' | 'trending';

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filters: SearchFilters = { sortBy };

  // Hooks
  const { data: searchResults, isLoading: searchLoading } = useSearch(
    searchQuery,
    filters,
    searchQuery.length > 0
  );
  const { data: trendingLocations } = useTrendingLocations(10);
  const { data: trendingPosts } = useTrendingPosts(12);
  const { data: recommendedPlaces } = useRecommendedPlaces(undefined, 10);
  const { data: popularDestinations } = usePopularDestinations(10);
  const { data: suggestedUsers } = useSuggestedUsers(10);
  const { data: searchHistory } = useSearchHistory(10);
  const saveSearch = useSaveSearchHistory();
  const deleteHistoryItem = useDeleteSearchHistoryItem();
  const followMutation = useFollowUser();

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      saveSearch.mutate({ query: text, type: 'location' });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleLocationPress = (locationName: string) => {
    // Navigate to home feed with location filter
    // For now, just log - we can implement location filtering later
    console.log('Location pressed:', locationName);
  };

  const handleUserPress = (userId: string) => {
    router.push(`/user-profile/${userId}`);
  };

  const handleFollowPress = async (userId: string, isFollowing: boolean) => {
    try {
      await followMutation.mutateAsync({
        targetUserId: userId,
        action: isFollowing ? 'unfollow' : 'follow',
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleDeleteHistory = (id: string) => {
    deleteHistoryItem.mutate(id);
  };

  const handleHistoryItemPress = (query: string) => {
    setSearchQuery(query);
    saveSearch.mutate({ query, type: 'location' });
  };

  // Render search results
  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      );
    }

    if (!searchResults) return null;

    // Flatten data for single FlatList
    const flatData: Array<{ type: 'header' | 'location' | 'user'; data?: any; title?: string }> = [];

    if (activeTab === 'all' || activeTab === 'locations') {
      if (searchResults.locations.length > 0) {
        flatData.push({ type: 'header', title: 'Locations' });
        searchResults.locations.forEach((loc) => {
          flatData.push({ type: 'location', data: loc });
        });
      }
    }

    if (activeTab === 'all' || activeTab === 'users') {
      if (searchResults.users.length > 0) {
        flatData.push({ type: 'header', title: 'Users' });
        searchResults.users.forEach((user) => {
          flatData.push({ type: 'user', data: user });
        });
      }
    }

    if (flatData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={Colors.light.border} />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try different keywords</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={flatData}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionTitle}>{item.title}</Text>;
          } else if (item.type === 'location') {
            return (
              <LocationCard
                location={item.data}
                onPress={() => handleLocationPress(item.data.name)}
              />
            );
          } else if (item.type === 'user') {
            return (
              <UserCard
                user={item.data}
                onPress={() => handleUserPress(item.data.id)}
                onFollowPress={(userId, isFollowing) => handleFollowPress(userId, !isFollowing)}
                isFollowing={item.data.isFollowing || false}
                followLoading={followMutation.isPending}
              />
            );
          }
          return null;
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Render discover content (when not searching)
  const renderDiscoverContent = () => {
    if (isSearchFocused && searchHistory && searchHistory.length > 0) {
      return (
        <FlatList
          data={searchHistory}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Searches</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => handleHistoryItemPress(item.query)}
            >
              <Ionicons name="time-outline" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.historyText}>{item.query}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteHistory(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="close" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // Flatten discover data with all new sections
    const discoverData: Array<{
      type: 'section-header' | 'categories' | 'trending-posts' | 'destinations' | 'users' | 'trending-location' | 'recommended';
      data?: any;
      title?: string;
      icon?: string;
    }> = [];

    // Categories Section
    if (TRAVEL_CATEGORIES.length > 0) {
      discoverData.push({
        type: 'section-header',
        title: 'Explore Categories',
        icon: 'grid-outline',
      });
      discoverData.push({ type: 'categories' });
    }

    // Trending Posts Section
    if (trendingPosts && trendingPosts.length > 0) {
      discoverData.push({
        type: 'section-header',
        title: 'Trending Posts',
        icon: 'flame',
      });
      discoverData.push({ type: 'trending-posts', data: trendingPosts });
    }

    // Popular Destinations Section
    if (popularDestinations && popularDestinations.length > 0) {
      discoverData.push({
        type: 'section-header',
        title: 'Popular Destinations',
        icon: 'airplane',
      });
      discoverData.push({ type: 'destinations', data: popularDestinations });
    }

    // Suggested Users Section
    if (suggestedUsers && suggestedUsers.length > 0) {
      discoverData.push({
        type: 'section-header',
        title: 'Suggested Users',
        icon: 'people',
      });
      suggestedUsers.slice(0, 5).forEach((user) => {
        discoverData.push({ type: 'users', data: user });
      });
    }

    // Trending Locations Section
    if (trendingLocations && trendingLocations.length > 0) {
      discoverData.push({
        type: 'section-header',
        title: 'Trending Locations',
        icon: 'trending-up',
      });
      trendingLocations.slice(0, 5).forEach((location) => {
        discoverData.push({ type: 'trending-location', data: location });
      });
    }

    // Recommended Places Section
    if (recommendedPlaces && recommendedPlaces.length > 0) {
      discoverData.push({
        type: 'section-header',
        title: 'Recommended Places',
        icon: 'star-outline',
      });
      recommendedPlaces.slice(0, 5).forEach((place) => {
        discoverData.push({ type: 'recommended', data: place });
      });
    }

    return (
      <FlatList
        data={discoverData}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'section-header') {
            return (
              <View style={styles.sectionHeader}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={
                    item.icon === 'trending-up' || item.icon === 'flame'
                      ? Colors.light.accent
                      : Colors.light.primary
                  }
                />
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
            );
          } else if (item.type === 'categories') {
            return (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.categoriesContainer}
              >
                {TRAVEL_CATEGORIES.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={() => console.log('Category:', category.name)}
                  />
                ))}
              </ScrollView>
            );
          } else if (item.type === 'trending-posts') {
            return (
              <View style={styles.postsGrid}>
                {item.data.slice(0, 6).map((post: any, index: number) => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.gridPostItem}
                    onPress={() => router.push(`/post-detail/${post.id}`)}
                  >
                    <View style={styles.gridPostPlaceholder}>
                      <Ionicons name="image-outline" size={32} color={Colors.light.border} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          } else if (item.type === 'destinations') {
            return (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.destinationsContainer}
              >
                {item.data.map((dest: any, index: number) => (
                  <DestinationCard
                    key={index}
                    name={dest.name}
                    postCount={dest.postCount}
                    imageUrl={dest.imageUrl}
                    onPress={() => handleLocationPress(dest.name)}
                  />
                ))}
              </ScrollView>
            );
          } else if (item.type === 'users') {
            return (
              <UserCard
                user={item.data}
                onPress={() => handleUserPress(item.data.id)}
                onFollowPress={(userId, isFollowing) => handleFollowPress(userId, !isFollowing)}
                isFollowing={item.data.isFollowing || false}
                followLoading={followMutation.isPending}
              />
            );
          } else if (item.type === 'trending-location') {
            return (
              <LocationCard
                location={item.data}
                onPress={() => handleLocationPress(item.data.name)}
                showTrending
              />
            );
          } else if (item.type === 'recommended') {
            return (
              <LocationCard
                location={{
                  name: item.data.name,
                  city: item.data.location.city,
                  country: item.data.location.country,
                  postCount: item.data.postCount,
                  coordinates:
                    item.data.location.latitude && item.data.location.longitude
                      ? {
                        latitude: item.data.location.latitude,
                        longitude: item.data.location.longitude,
                      }
                      : undefined,
                }}
                onPress={() => handleLocationPress(item.data.name)}
              />
            );
          }
          return null;
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          placeholder="Search locations, users..."
        />
      </View>

      {/* Tabs & Filters (when searching) */}
      {searchQuery.length > 0 && (
        <View style={styles.filtersContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
              onPress={() => setActiveTab('locations')}
            >
              <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>
                Locations
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'users' && styles.activeTab]}
              onPress={() => setActiveTab('users')}
            >
              <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
                Users
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'recent' && styles.activeSortButton]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={[styles.sortText, sortBy === 'recent' && styles.activeSortText]}>
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'popular' && styles.activeSortButton]}
              onPress={() => setSortBy('popular')}
            >
              <Text style={[styles.sortText, sortBy === 'popular' && styles.activeSortText]}>
                Popular
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'trending' && styles.activeSortButton]}
              onPress={() => setSortBy('trending')}
            >
              <Text style={[styles.sortText, sortBy === 'trending' && styles.activeSortText]}>
                Trending
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {searchQuery.length > 0 ? renderSearchResults() : renderDiscoverContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  logo: {
    fontFamily: Typography.fonts.heading,
    fontSize: 24,
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filtersContainer: {
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: Spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: Colors.light.surface,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sortButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeSortButton: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  sortText: {
    fontFamily: Typography.fonts.body,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  activeSortText: {
    color: Colors.light.surface,
    fontFamily: Typography.fonts.bodyBold,
  },
  listContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: 18,
    color: Colors.light.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
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
  emptySubtext: {
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
  },
  historyContainer: {
    padding: Spacing.lg,
  },
  historyHeader: {
    marginBottom: Spacing.md,
  },
  historyTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: 18,
    color: Colors.light.text,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyText: {
    flex: 1,
    fontFamily: Typography.fonts.body,
    fontSize: 16,
    color: Colors.light.text,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  horizontalScroll: {
    marginBottom: Spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg - 2,
    marginBottom: Spacing.md,
  },
  gridPostItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  gridPostPlaceholder: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
  },
  destinationsContainer: {
    paddingHorizontal: Spacing.lg,
  },
});
