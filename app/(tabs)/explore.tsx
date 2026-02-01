import { ThemedView } from '@/components/themed-view';
import { Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vintage Map Color Palette
const VintageColors = {
  light: {
    background: '#f8f7f6',
    parchment: '#E8DCC8',
    surface: '#fcfbf9',
    text: '#181511',
    textSecondary: '#5a4e41',
    textMuted: '#897661',
    primary: '#d47611',
    compassBlue: '#4A6FA5',
    goldenrod: '#DAA520',
    sepiaOverlay: '#704214',
    border: '#E8DCC8',
  },
  dark: {
    background: '#221910',
    parchment: '#3D2F20',
    surface: '#2C1810',
    text: '#F5F1E8',
    textSecondary: '#D4A574',
    textMuted: '#897661',
    primary: '#d47611',
    compassBlue: '#6B9BD1',
    goldenrod: '#F0E68C',
    sepiaOverlay: '#1A1410',
    border: '#3D2F20',
  }
};

// Typing animation placeholder texts - these will be replaced with translations dynamically
const TYPING_TEXTS_KEYS = [
  'explore.discoverRoutes',
  'explore.searchCities',
  'explore.findTravelers',
  'explore.discoverPlaces',
];

type TabType = 'all' | 'locations' | 'users';
type SortType = 'recent' | 'popular' | 'trending';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const vintageTheme = VintageColors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);

  // Typing animation
  const typingOpacity = useRef(new Animated.Value(1)).current;

  // Float animation for map pins
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  const filters: SearchFilters = { sortBy };

  const { data: searchResults, isLoading: searchLoading } = useSearch(
    searchQuery,
    filters,
    searchQuery.length > 0
  );
  const { data: trendingLocations } = useTrendingLocations(10);
  const { data: trendingPosts } = useTrendingPosts(12);
  const { data: recommendedPlaces } = useRecommendedPlaces(undefined, 10);
  const { data: popularDestinations } = usePopularDestinations(10);
  const { data: suggestedUsers, isLoading: suggestedUsersLoading, isError: suggestedUsersError, refetch: refetchSuggestedUsers } = useSuggestedUsers(10);
  const { data: searchHistory } = useSearchHistory(10);
  const saveSearch = useSaveSearchHistory();
  const deleteHistoryItem = useDeleteSearchHistoryItem();
  const followMutation = useFollowUser();

  // Map hide animation on scroll - platform specific for performance
  const scrollY = useRef(new Animated.Value(0)).current;

  // iOS uses height animation (smooth), Android uses only opacity (performant)
  const mapHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [380, 0],
    extrapolate: 'clamp',
  });
  const mapOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Typing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(typingOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentTypingIndex((prev) => (prev + 1) % TYPING_TEXTS_KEYS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Float animations for map pins
  useEffect(() => {
    const createFloatAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: -5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createFloatAnimation(floatAnim1, 0);
    const anim2 = createFloatAnimation(floatAnim2, 500);
    const anim3 = createFloatAnimation(floatAnim3, 1000);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

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

  const handlePostPress = (postId: string) => {
    router.push(`/post-detail/${postId}`);
  };

  // Render vintage map header with floating pins
  const renderMapHeader = () => {
    const pinLocations = trendingLocations?.slice(0, 3) || [];

    // Platform-specific animation styles
    // iOS: height shrinks with scroll, Android: no animation (stays visible)
    const mapAnimationStyle = Platform.OS === 'ios'
      ? { height: mapHeight, opacity: mapOpacity }
      : {}; // Android: no animation, map stays fixed

    return (
      <Animated.View style={[
        styles.mapHeader,
        {
          backgroundColor: vintageTheme.parchment,
          ...mapAnimationStyle
        }
      ]}>
        {/* Background Map Image */}
        <View style={styles.mapBackground}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80' }}
            style={styles.mapImage}
            contentFit="cover"
          />
          <View style={[styles.mapOverlay, { backgroundColor: vintageTheme.sepiaOverlay }]} />
          <LinearGradient
            colors={['transparent', vintageTheme.background]}
            style={styles.mapGradient}
          />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { top: insets.top + 16 }]}>
          <View style={[styles.searchBar, { backgroundColor: `${vintageTheme.surface}F2` }]}>
            <Ionicons name="compass-outline" size={24} color={vintageTheme.textMuted} />
            <View style={styles.searchInputContainer}>
              <TextInput
                style={[styles.searchInput, { color: vintageTheme.text }]}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder=""
                placeholderTextColor={vintageTheme.textMuted}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {!searchQuery && !isSearchFocused && (
                <Animated.Text
                  style={[
                    styles.typingPlaceholder,
                    { color: vintageTheme.textMuted, opacity: typingOpacity }
                  ]}
                >
                  {t(TYPING_TEXTS_KEYS[currentTypingIndex])}
                </Animated.Text>
              )}
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color={vintageTheme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Map Pins */}
        {pinLocations.length > 0 && (
          <>
            <Animated.View
              style={[
                styles.mapPin,
                styles.mapPin1,
                { transform: [{ translateY: floatAnim1 }] }
              ]}
            >
              <View style={[styles.pinCircle, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}>
                <Ionicons name="compass" size={24} color={vintageTheme.compassBlue} />
              </View>
              <View style={[styles.pinTail, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.mapPin,
                styles.mapPin2,
                { transform: [{ translateY: floatAnim2 }] }
              ]}
            >
              <View style={[styles.pinCircle, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}>
                <Ionicons name="compass" size={24} color={vintageTheme.compassBlue} />
              </View>
              <View style={[styles.pinTail, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.mapPin,
                styles.mapPin3,
                { transform: [{ translateY: floatAnim3 }] }
              ]}
            >
              <View style={[styles.pinCircle, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}>
                <Ionicons name="compass" size={24} color={vintageTheme.goldenrod} />
              </View>
              <View style={[styles.pinTail, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]} />
            </Animated.View>
          </>
        )}

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={[styles.zoomButton, { backgroundColor: `${vintageTheme.surface}F2`, borderColor: vintageTheme.border }]}>
            <Ionicons name="add" size={22} color={vintageTheme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.zoomButton, { backgroundColor: `${vintageTheme.surface}F2`, borderColor: vintageTheme.border }]}>
            <Ionicons name="remove" size={22} color={vintageTheme.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Render categories section
  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>{t('explore.categories')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {TRAVEL_CATEGORIES.slice(0, 5).map((category) => {
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => router.push(`/category-posts/${category.id}` as any)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}>
                <Ionicons
                  name={getCategoryIonicon(category.id)}
                  size={26}
                  color={vintageTheme.compassBlue}
                />
              </View>
              <Text style={[styles.categoryLabel, { color: vintageTheme.textSecondary }]}>
                {t('categories.' + category.id)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.divider, { borderBottomColor: vintageTheme.border }]} />
    </View>
  );

  // Helper function to map category to Ionicons
  const getCategoryIonicon = (categoryId: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'adventure': 'trail-sign',
      'beach': 'water',
      'city': 'business',
      'nature': 'leaf',
      'culture': 'library',
      'food': 'restaurant',
      'mountain': 'triangle',
      'wildlife': 'paw',
      'art': 'color-palette',
    };
    return iconMap[categoryId] || 'apps';
  };

  // Render trending posts section
  const renderTrendingPosts = () => {
    if (!trendingPosts || trendingPosts.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>{t('explore.popularPosts')}</Text>
          <TouchableOpacity onPress={() => router.push('/popular-posts' as any)}>
            <Text style={[styles.viewAllText, { color: vintageTheme.primary }]}>{t('explore.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {trendingPosts.slice(0, 2).map((post: any) => (
          <TouchableOpacity
            key={post.id}
            style={[styles.postCard, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
            onPress={() => handlePostPress(post.id)}
          >
            <View style={styles.postImageContainer}>
              {post.images?.[0] ? (
                <Image
                  source={{ uri: post.images[0] }}
                  style={styles.postImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.postImagePlaceholder, { backgroundColor: vintageTheme.parchment }]}>
                  <Ionicons name="image-outline" size={32} color={vintageTheme.textMuted} />
                </View>
              )}
            </View>
            <View style={styles.postContent}>
              <View style={[styles.trendingBadge, { backgroundColor: `${vintageTheme.goldenrod}20`, borderColor: `${vintageTheme.goldenrod}50` }]}>
                <Ionicons name="trending-up" size={12} color={vintageTheme.goldenrod} />
                <Text style={[styles.trendingText, { color: vintageTheme.goldenrod }]}>{t('explore.trending')}</Text>
              </View>
              <Text style={[styles.postTitle, { color: vintageTheme.text }]} numberOfLines={2}>
                {post.title || post.location_name || t('explore.untitledPost')}
              </Text>
              <View style={styles.postMeta}>
                <View style={styles.postLikes}>
                  <Ionicons name="heart" size={14} color={vintageTheme.textMuted} />
                  <Text style={[styles.postLikesText, { color: vintageTheme.textMuted }]}>
                    {formatNumber(post.likes_count || 0)}
                  </Text>
                </View>
                <View style={[styles.postAuthor, { backgroundColor: `${vintageTheme.parchment}50`, borderColor: vintageTheme.border }]}>
                  {post.profiles?.avatar_url ? (
                    <Image
                      source={{ uri: post.profiles.avatar_url }}
                      style={styles.authorAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={10} color={vintageTheme.textMuted} />
                  )}
                  <Text style={[styles.authorName, { color: vintageTheme.textSecondary }]}>
                    {post.profiles?.full_name?.split(' ')[0] || post.profiles?.username || t('explore.user')}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={[styles.divider, { borderBottomColor: vintageTheme.border }]} />
      </View>
    );
  };

  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Render popular destinations section - uses real post locations
  const renderPopularDestinations = () => {
    // Color palettes for destinations
    const colorPalettes = [
      { bgColor: '#e0f2fe', icon: 'airplane' as keyof typeof Ionicons.glyphMap, iconColor: '#4A6FA5', dotColor: '#4A6FA5' },
      { bgColor: '#fef3c7', icon: 'walk' as keyof typeof Ionicons.glyphMap, iconColor: '#DAA520', dotColor: '#DAA520' },
      { bgColor: '#dcfce7', icon: 'leaf' as keyof typeof Ionicons.glyphMap, iconColor: '#22c55e', dotColor: '#22c55e' },
      { bgColor: '#f3e8ff', icon: 'business' as keyof typeof Ionicons.glyphMap, iconColor: '#a855f7', dotColor: '#a855f7' },
    ];

    // Get unique locations from trending posts
    const postLocationsRaw = trendingPosts?.filter((post: any) =>
      post.location?.city || post.location?.country || post.location_name
    ).map((post: any) => ({
      name: post.location?.city || post.location?.country || post.location_name?.split(',')[0] || t('explore.unknown'),
      imageUrl: post.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    })) || [];

    // If no post locations, don't show this section
    if (postLocationsRaw.length === 0) return null;

    // Group by location name and count
    const locationMap = new Map<string, { name: string; imageUrl: string; postCount: number }>();
    postLocationsRaw.forEach(loc => {
      if (locationMap.has(loc.name)) {
        const existing = locationMap.get(loc.name)!;
        existing.postCount++;
      } else {
        locationMap.set(loc.name, { ...loc, postCount: 1 });
      }
    });

    // Create destinations array with colors
    const destinations = Array.from(locationMap.values()).slice(0, 4).map((loc, index) => ({
      ...loc,
      ...colorPalettes[index % colorPalettes.length],
    }));

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>{t('explore.popularDestinations')}</Text>
        <View style={styles.destinationsGrid}>
          {destinations.map((dest, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.destinationCard, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
              onPress={() => router.push(`/destination-posts/${encodeURIComponent(dest.name)}` as any)}
            >
              <View style={[styles.destinationImageContainer, { backgroundColor: dest.bgColor + '33' }]}>
                <Image
                  source={{ uri: dest.imageUrl }}
                  style={styles.destinationImage}
                  contentFit="contain"
                />
                <View style={[styles.destinationBadge, { backgroundColor: `${vintageTheme.surface}E6`, borderColor: vintageTheme.border }]}>
                  <Ionicons
                    name={dest.icon}
                    size={14}
                    color={dest.iconColor}
                  />
                </View>
              </View>
              <View style={[styles.destinationInfo, { borderTopColor: `${vintageTheme.border}50` }]}>
                <Text style={[styles.destinationName, { color: vintageTheme.text }]}>
                  {dest.name}
                </Text>
                <View style={styles.destinationMeta}>
                  <View style={[styles.routeDot, { backgroundColor: dest.dotColor }]} />
                  <Text style={[styles.routeCount, { color: vintageTheme.textSecondary }]}>
                    {dest.postCount} {t('explore.routes')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Helper functions for destination styling - keeping for backwards compatibility
  const getDestinationBgColor = (index: number): string => {
    const colors = ['#e0f2fe', '#fef3c7', '#dcfce7', '#f3e8ff'];
    return colors[index % colors.length];
  };

  const getDestinationIcon = (index: number): keyof typeof Ionicons.glyphMap => {
    const icons: (keyof typeof Ionicons.glyphMap)[] = ['airplane', 'walk', 'leaf', 'business'];
    return icons[index % icons.length];
  };

  const getDestinationIconColor = (index: number, theme: typeof vintageTheme): string => {
    const colors = [theme.compassBlue, theme.goldenrod, '#22c55e', '#a855f7'];
    return colors[index % colors.length];
  };

  const getDestinationDotColor = (index: number): string => {
    const colors = ['#4A6FA5', '#DAA520', '#22c55e', '#a855f7'];
    return colors[index % colors.length];
  };

  // Render weekly discovery section
  const renderWeeklyDiscovery = () => {
    const featuredPost = trendingPosts?.[0];
    if (!featuredPost) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>{t('explore.weeklyDiscovery')}</Text>
          <Ionicons name="sparkles" size={20} color={vintageTheme.goldenrod} />
        </View>

        <TouchableOpacity
          style={[styles.weeklyCard, { borderColor: vintageTheme.border }]}
          onPress={() => handlePostPress(featuredPost.id)}
        >
          <Image
            source={{ uri: featuredPost.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' }}
            style={styles.weeklyImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
            style={styles.weeklyGradient}
          />
          <View style={[styles.editorBadge, { backgroundColor: vintageTheme.goldenrod, borderColor: '#c1921a' }]}>
            <Ionicons name="checkmark-circle" size={12} color="#221910" />
            <Text style={styles.editorBadgeText}>{t('explore.editorsChoice')}</Text>
          </View>
          <View style={styles.weeklyContent}>
            <Text style={styles.weeklyTitle}>
              {featuredPost.title || featuredPost.location_name || 'Keşfedilecek Yeni Rotalar'}
            </Text>
            <Text style={styles.weeklyDescription} numberOfLines={2}>
              {featuredPost.content || 'Türkiye\'nin en güzel rotalarını keşfedin ve maceraya atılın.'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render suggested travelers section
  const renderSuggestedUsers = () => {
    // Always show this section - with loading, empty, or data state
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>{t('explore.suggestedTravelers')}</Text>

        {suggestedUsersLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="small" color={vintageTheme.primary} />
            <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted, marginTop: 8 }]}>{t('explore.loading')}</Text>
          </View>
        ) : suggestedUsersError ? (
          <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 40 }} onPress={() => refetchSuggestedUsers()}>
            <Ionicons name="alert-circle-outline" size={40} color={vintageTheme.border} />
            <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted, marginTop: 8 }]}>{t('explore.loadFailed')}</Text>
          </TouchableOpacity>
        ) : !suggestedUsers || suggestedUsers.length === 0 ? (
          <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 40 }} onPress={() => refetchSuggestedUsers()}>
            <Ionicons name="people-outline" size={40} color={vintageTheme.border} />
            <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted, marginTop: 8 }]}>{t('explore.noSuggestionsYet')}</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.usersScroll}
          >
            {suggestedUsers.slice(0, 5).map((user: any) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userCard, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
                onPress={() => handleUserPress(user.id)}
              >
                <TouchableOpacity style={styles.bookmarkButton}>
                  <Ionicons name="bookmark-outline" size={16} color={vintageTheme.border} />
                </TouchableOpacity>
                <View style={[styles.userAvatarContainer, { borderColor: vintageTheme.border }]}>
                  {user.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
                      style={styles.userAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.userAvatarPlaceholder, { backgroundColor: vintageTheme.parchment }]}>
                      <Ionicons name="person" size={28} color={vintageTheme.textMuted} />
                    </View>
                  )}
                </View>
                <Text style={[styles.userName, { color: vintageTheme.text }]} numberOfLines={1}>
                  {user.full_name?.split(' ')[0] || user.username || t('explore.user')}
                </Text>
                <Text style={[styles.userLabel, { color: vintageTheme.textSecondary }]} numberOfLines={1}>
                  {getUserLabel(user)}
                </Text>
                <TouchableOpacity
                  style={[styles.followButton, { backgroundColor: vintageTheme.primary }]}
                  onPress={() => handleFollowPress(user.id, false)}
                >
                  <Ionicons name="person-add" size={12} color="white" />
                  <Text style={styles.followButtonText}>{t('explore.follow')}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  // Helper to generate user label
  const getUserLabel = (user: any): string => {
    const labels = ['Doğa Sever', 'Şehir Kaşifi', 'Tarihçi', 'Fotoğrafçı', 'Gezgin'];
    const index = user.id.charCodeAt(0) % labels.length;
    return labels[index];
  };

  // Render search results
  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: vintageTheme.background }]}>
          <ActivityIndicator size="large" color={vintageTheme.primary} />
        </View>
      );
    }

    if (!searchResults) return null;

    const hasResults = searchResults.locations.length > 0 || searchResults.users.length > 0;

    if (!hasResults) {
      return (
        <View style={[styles.emptyState, { backgroundColor: vintageTheme.background }]}>
          <Ionicons name="search-outline" size={64} color={vintageTheme.border} />
          <Text style={[styles.emptyText, { color: vintageTheme.textSecondary }]}>{t('explore.noResults')}</Text>
          <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted }]}>{t('explore.tryDifferent')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResults}>
        {searchResults.locations.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultTitle, { color: vintageTheme.text }]}>{t('explore.locations')}</Text>
            {searchResults.locations.map((loc: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[styles.resultItem, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
                onPress={() => handleLocationPress(loc.name)}
              >
                <View style={[styles.resultIcon, { backgroundColor: vintageTheme.parchment }]}>
                  <Ionicons name="location" size={20} color={vintageTheme.compassBlue} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: vintageTheme.text }]}>{loc.name}</Text>
                  <Text style={[styles.resultMeta, { color: vintageTheme.textMuted }]}>{loc.postCount} {t('explore.posts')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.users.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultTitle, { color: vintageTheme.text }]}>{t('explore.users')}</Text>
            {searchResults.users.map((user: any) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.resultItem, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
                onPress={() => handleUserPress(user.id)}
              >
                <View style={styles.resultAvatarContainer}>
                  {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.resultAvatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.resultAvatarPlaceholder, { backgroundColor: vintageTheme.parchment }]}>
                      <Ionicons name="person" size={18} color={vintageTheme.textMuted} />
                    </View>
                  )}
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: vintageTheme.text }]}>{user.full_name || user.username}</Text>
                  <Text style={[styles.resultMeta, { color: vintageTheme.textMuted }]}>@{user.username}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render main discover content
  const renderDiscoverContent = () => {
    if (isSearchFocused && searchHistory && searchHistory.length > 0 && !searchQuery) {
      return (
        <View style={[styles.historyContainer, { backgroundColor: vintageTheme.background }]}>
          <Text style={[styles.historyTitle, { color: vintageTheme.text }]}>{t('explore.recentSearches')}</Text>
          {searchHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyItem, { borderBottomColor: vintageTheme.border }]}
              onPress={() => handleHistoryItemPress(item.query)}
            >
              <Ionicons name="time-outline" size={18} color={vintageTheme.textMuted} />
              <Text style={[styles.historyText, { color: vintageTheme.text }]}>{item.query}</Text>
              <TouchableOpacity onPress={() => handleDeleteHistory(item.id)}>
                <Ionicons name="close" size={18} color={vintageTheme.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <Animated.ScrollView
        style={[styles.contentScroll, { backgroundColor: vintageTheme.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'ios' } // iOS: false for height animation, Android: true for performance
        )}
      >
        {renderCategories()}
        {renderTrendingPosts()}
        {renderPopularDestinations()}
        {renderWeeklyDiscovery()}
        {renderSuggestedUsers()}
      </Animated.ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {searchQuery.length > 0 ? (
        <>
          {/* Simple header when searching */}
          <View style={[styles.simpleHeader, { paddingTop: insets.top + 16, backgroundColor: vintageTheme.background }]}>
            <View style={[styles.searchBar, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border, borderWidth: 1 }]}>
              <Ionicons name="compass-outline" size={24} color={vintageTheme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: vintageTheme.text, flex: 1 }]}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Ara..."
                placeholderTextColor={vintageTheme.textMuted}
                autoFocus
              />
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={20} color={vintageTheme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          {renderSearchResults()}
        </>
      ) : (
        <>
          {/* Simple search header without map */}
          <View style={[styles.exploreHeader, { paddingTop: insets.top + 16, backgroundColor: vintageTheme.background }]}>
            <View style={[styles.searchBar, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border, borderWidth: 1 }]}>
              <Ionicons name="compass-outline" size={24} color={vintageTheme.textMuted} />
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={[styles.searchInput, { color: vintageTheme.text }]}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder=""
                  placeholderTextColor={vintageTheme.textMuted}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                {!searchQuery && !isSearchFocused && (
                  <Animated.Text
                    style={[
                      styles.typingPlaceholder,
                      { color: vintageTheme.textMuted, opacity: typingOpacity }
                    ]}
                  >
                    {t(TYPING_TEXTS_KEYS[currentTypingIndex])}
                  </Animated.Text>
                )}
              </View>
            </View>
          </View>
          <View style={[styles.contentContainer, { backgroundColor: vintageTheme.background }]}>
            {renderDiscoverContent()}
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Map Header Styles
  mapHeader: {
    height: 380,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  mapGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },

  // Search Bar Styles
  searchContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    ...Shadows.lg,
  },
  searchInputContainer: {
    flex: 1,
    marginHorizontal: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
    fontFamily: Typography.fonts.heading,
    paddingVertical: 0,
  },
  typingPlaceholder: {
    position: 'absolute',
    fontSize: 16,
    fontFamily: Typography.fonts.bodyItalic,
  },
  filterButton: {
    padding: 4,
  },

  // Map Pins
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 30,
  },
  mapPin1: {
    top: '45%',
    left: '40%',
  },
  mapPin2: {
    top: '32%',
    right: '18%',
  },
  mapPin3: {
    bottom: '30%',
    left: '55%',
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  pinTail: {
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },

  // Zoom Controls
  zoomControls: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    gap: 10,
    zIndex: 30,
  },
  zoomButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },

  // Explore Header (without map)
  exploreHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  simpleHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Content Container
  contentContainer: {
    flex: 1,
    paddingTop: 8,
  },
  contentScroll: {
    flex: 1,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Typography.fonts.heading,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 11,
    fontFamily: Typography.fonts.uiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: 8,
    opacity: 0.6,
  },

  // Categories
  categoriesScroll: {
    paddingBottom: 12,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Shadows.sm,
  },
  categoryLabel: {
    fontSize: 11,
    fontFamily: Typography.fonts.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Post Cards
  postCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    ...Shadows.sm,
  },
  postImageContainer: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContent: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'space-between',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginBottom: 6,
  },
  trendingText: {
    fontSize: 9,
    fontFamily: Typography.fonts.uiBold,
    textTransform: 'uppercase',
  },
  postTitle: {
    fontSize: 17,
    fontFamily: Typography.fonts.heading,
    lineHeight: 22,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  postLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postLikesText: {
    fontSize: 11,
    fontFamily: Typography.fonts.ui,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  authorAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  authorName: {
    fontSize: 9,
    fontFamily: Typography.fonts.uiBold,
  },

  // Destinations Grid
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  destinationCard: {
    width: (SCREEN_WIDTH - 54) / 2,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.md,
  },
  destinationImageContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    overflow: 'hidden',
  },
  destinationImage: {
    width: '92%',
    height: '92%',
    borderRadius: 4,
  },
  destinationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  destinationInfo: {
    padding: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  destinationName: {
    fontSize: 17,
    fontFamily: Typography.fonts.heading,
  },
  destinationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routeCount: {
    fontSize: 11,
    fontFamily: Typography.fonts.bodyItalic,
  },

  // Weekly Discovery
  weeklyCard: {
    height: 280,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  weeklyImage: {
    width: '100%',
    height: '100%',
  },
  weeklyGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  editorBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  editorBadgeText: {
    fontSize: 9,
    fontFamily: Typography.fonts.uiBold,
    color: '#221910',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weeklyContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  weeklyTitle: {
    fontSize: 26,
    fontFamily: Typography.fonts.heading,
    color: 'white',
    marginBottom: 8,
  },
  weeklyDescription: {
    fontSize: 13,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 14,
  },
  weeklyTags: {
    flexDirection: 'row',
    gap: 10,
  },
  weeklyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  weeklyTagText: {
    fontSize: 11,
    fontFamily: Typography.fonts.ui,
    color: 'white',
    fontWeight: '500',
  },

  // Suggested Users
  usersScroll: {
    paddingBottom: 8,
  },
  userCard: {
    width: 130,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 12,
    ...Shadows.sm,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  userAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  userAvatar: {
    width: '100%',
    height: '100%',
  },
  userAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 13,
    fontFamily: Typography.fonts.uiBold,
    textAlign: 'center',
    marginBottom: 2,
  },
  userLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.ui,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    ...Shadows.sm,
  },
  followButtonText: {
    fontSize: 11,
    fontFamily: Typography.fonts.uiBold,
    color: 'white',
  },

  // Search Results
  searchResults: {
    flex: 1,
    padding: 16,
  },
  resultSection: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: Typography.fonts.heading,
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  resultAvatar: {
    width: '100%',
    height: '100%',
  },
  resultAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontFamily: Typography.fonts.bodyBold,
  },
  resultMeta: {
    fontSize: 12,
    fontFamily: Typography.fonts.body,
    marginTop: 2,
  },

  // History
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: Typography.fonts.heading,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.fonts.body,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontFamily: Typography.fonts.heading,
    fontSize: 18,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
});
