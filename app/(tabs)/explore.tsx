import { ThemedView } from '@/components/themed-view';
import { Colors, Shadows, Spacing, Typography } from '@/constants/theme';
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

// Typing animation placeholder texts
const TYPING_TEXTS = [
  'Rotaları keşfet...',
  'Şehirleri ara...',
  'Gezginleri bul...',
  'Yeni yerler keşfet...',
];

type TabType = 'all' | 'locations' | 'users';
type SortType = 'recent' | 'popular' | 'trending';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const vintageTheme = VintageColors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

      setCurrentTypingIndex((prev) => (prev + 1) % TYPING_TEXTS.length);
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

    return (
      <View style={[styles.mapHeader, { backgroundColor: vintageTheme.parchment }]}>
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
                  {TYPING_TEXTS[currentTypingIndex]}
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
      </View>
    );
  };

  // Render categories section
  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>Kategoriler</Text>
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
              onPress={() => console.log('Category:', category.name)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}>
                <Ionicons
                  name={getCategoryIonicon(category.id)}
                  size={26}
                  color={vintageTheme.compassBlue}
                />
              </View>
              <Text style={[styles.categoryLabel, { color: vintageTheme.textSecondary }]}>
                {category.nameTr}
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
          <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>Popüler Gönderiler</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAllText, { color: vintageTheme.primary }]}>Tümünü Gör</Text>
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
                <Text style={[styles.trendingText, { color: vintageTheme.goldenrod }]}>Trending</Text>
              </View>
              <Text style={[styles.postTitle, { color: vintageTheme.text }]} numberOfLines={2}>
                {post.title || post.location_name || 'Untitled Post'}
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
                    {post.profiles?.full_name?.split(' ')[0] || post.profiles?.username || 'User'}
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

  // Render popular destinations section - Static data matching Google Stitch design
  const renderPopularDestinations = () => {
    // Static destinations matching the design
    const staticDestinations = [
      {
        name: 'Paris',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRUh1J8X_-75oU3KwXM6dZl23I1ROsuHm3fQte2CSEIVzoMX4O9YysgH-ByKvLOkpKfAi8cKVZOMptL_F3BM3g7MpgXx9eqWJBrp1qwE4KK4Kg2yuTgZ0tWIt9BZ-pTuQhCAIQpGWLuuphIYM0AI8xagqQ4w8c66FMsnrFz4MeaRfPOuh4ZsgTbPBYqQPeplAOh0m7BQr58_7LucIdQdACaGeNEF3NmwVd4ktZt0cHCq_8HgqxzC3H96NXiZ1-BbVHTKBtenX_rkE',
        postCount: 128,
        bgColor: '#e0f2fe',
        icon: 'airplane' as keyof typeof Ionicons.glyphMap,
        iconColor: '#4A6FA5',
        dotColor: '#4A6FA5',
      },
      {
        name: 'Arizona',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8RzAeQifuE_dvcgmnLBXpeWQLMS72tmFys7LwkP9ahLielaAw1LcpnAa8UCzs__jscsVBIcwhjyKo-HlmJVabcr-KSuVuquQCWY3v9cyGw0Z_e_Tde4CO-KzRTbuawzNvQ5Oke_Z17dmgTrJ2ZjVRkPTev7pKZeUklFfaqYitsW3gVsYLbrEM2Vuc44RqETPAcf3BMRtQB76q9R2aAqu2DYZle5Nlt0Bhlf3fgeuTS-YdojcYVti64InDgapt5IOTSOeVPt51ke4',
        postCount: 42,
        bgColor: '#fef3c7',
        icon: 'walk' as keyof typeof Ionicons.glyphMap,
        iconColor: '#DAA520',
        dotColor: '#DAA520',
      },
      {
        name: 'Bali',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDotsU9xiiMvU-EbyZQKhxOY88-Hd0Lnt803dBxwJUNfVsUXSesFYdfWsvdpSSMZ39f-lsDW7pqqDuK7aPCPs06nf-iHEBqftDAummTFGJZIpsFB3zjkL-j4HKmqi35KzRLZvvoQ9VLQYhV6ryhUSSpGGDgbi1x1t8jGE7MGfwe5s6Z_q8KrdYC6Mosr7HyXpURYIgfjAAHJHi7aPURbso-kfzqCbR7wXBcGgUlf44N8Fxp7k6gDsVqcihHUUxjylWRvEP5kg5lsgk',
        postCount: 94,
        bgColor: '#dcfce7',
        icon: 'leaf' as keyof typeof Ionicons.glyphMap,
        iconColor: '#22c55e',
        dotColor: '#22c55e',
      },
      {
        name: 'Londra',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4_j93GPrpjdrYAj-PyD2qnxfxoMMARYN73qb1NQxtrQ7HTWb2cNlxHFCsXjKxSG1Vs2sJSXuHRUmY_mtXxg5rLnWCVqg_fAXvugmNpLuIU6a7vXSI_SKOcqBIffXFO-hM90Ow0OLpjGOgP6TpPayldqLdZFp3nm9iCHi-5lH9GchMBgi74RhjopwKi69BOjFDWR1gF1lvylkd3X4l17TuCcXShU4TIqTJezN5BktOm_E4wLnQaKkt0B4-UuM8pc_F6iv34wtoX0g',
        postCount: 215,
        bgColor: '#f3e8ff',
        icon: 'business' as keyof typeof Ionicons.glyphMap,
        iconColor: '#a855f7',
        dotColor: '#a855f7',
      },
    ];

    // Use API data if available, otherwise use static data
    const destinations = (popularDestinations && popularDestinations.length >= 4)
      ? popularDestinations.slice(0, 4).map((dest: any, index: number) => ({
        name: dest.city || dest.name?.split(',')[0] || staticDestinations[index].name,
        imageUrl: dest.imageUrl || staticDestinations[index].imageUrl,
        postCount: dest.postCount || staticDestinations[index].postCount,
        bgColor: staticDestinations[index].bgColor,
        icon: staticDestinations[index].icon,
        iconColor: staticDestinations[index].iconColor,
        dotColor: staticDestinations[index].dotColor,
      }))
      : staticDestinations;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>Popüler Destinasyonlar</Text>
        <View style={styles.destinationsGrid}>
          {destinations.map((dest, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.destinationCard, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
              onPress={() => handleLocationPress(dest.name)}
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
                    {dest.postCount} Rota
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
          <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>Haftalık Keşif</Text>
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
            <Text style={styles.editorBadgeText}>Editörün Seçimi</Text>
          </View>
          <View style={styles.weeklyContent}>
            <Text style={styles.weeklyTitle}>
              {featuredPost.title || featuredPost.location_name || 'Keşfedilecek Yeni Rotalar'}
            </Text>
            <Text style={styles.weeklyDescription} numberOfLines={2}>
              {featuredPost.content || 'Türkiye\'nin en güzel rotalarını keşfedin ve maceraya atılın.'}
            </Text>
            <View style={styles.weeklyTags}>
              <View style={styles.weeklyTag}>
                <Ionicons name="time-outline" size={14} color="white" />
                <Text style={styles.weeklyTagText}>7 Gün</Text>
              </View>
              <View style={styles.weeklyTag}>
                <Ionicons name="map-outline" size={14} color="white" />
                <Text style={styles.weeklyTagText}>12 Durak</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render suggested travelers section
  const renderSuggestedUsers = () => {
    if (!suggestedUsers || suggestedUsers.length === 0) return null;

    return (
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>Önerilen Gezginler</Text>
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
                {user.full_name?.split(' ')[0] || user.username || 'User'}
              </Text>
              <Text style={[styles.userLabel, { color: vintageTheme.textSecondary }]} numberOfLines={1}>
                {getUserLabel(user)}
              </Text>
              <TouchableOpacity
                style={[styles.followButton, { backgroundColor: vintageTheme.primary }]}
                onPress={() => handleFollowPress(user.id, false)}
              >
                <Ionicons name="person-add" size={12} color="white" />
                <Text style={styles.followButtonText}>Takip Et</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          <Text style={[styles.emptyText, { color: vintageTheme.textSecondary }]}>Sonuç bulunamadı</Text>
          <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted }]}>Farklı anahtar kelimeler deneyin</Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResults}>
        {searchResults.locations.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultTitle, { color: vintageTheme.text }]}>Lokasyonlar</Text>
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
                  <Text style={[styles.resultMeta, { color: vintageTheme.textMuted }]}>{loc.postCount} gönderi</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.users.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={[styles.resultTitle, { color: vintageTheme.text }]}>Kullanıcılar</Text>
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
          <Text style={[styles.historyTitle, { color: vintageTheme.text }]}>Son Aramalar</Text>
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
      <ScrollView
        style={[styles.contentScroll, { backgroundColor: vintageTheme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {renderCategories()}
        {renderTrendingPosts()}
        {renderPopularDestinations()}
        {renderWeeklyDiscovery()}
        {renderSuggestedUsers()}
      </ScrollView>
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
          {renderMapHeader()}
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
    bottom: 32,
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

  // Content Container
  contentContainer: {
    flex: 1,
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
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

  // Simple Header (for search)
  simpleHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
