import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Collection } from '@/lib/collections';
import { deleteCollection, getCollectionById, getCollectionPosts } from '@/lib/collections';
import { bookmarkPost, likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { Post } from '@/lib/posts';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 3) / 2;
const CARD_HEIGHT = 250;

// Design Colors
const DesignColors = {
    light: {
        background: '#F5F1E8',
        headerBg: '#F5F1E8',
        cardBg: '#FFFFFF',
        cardBackBg: '#F5F1E8',
        textPrimary: '#2C1810',
        textSecondary: 'rgba(44, 24, 16, 0.6)',
        accent: '#D4A574',
        border: 'rgba(139, 115, 85, 0.3)',
    },
    dark: {
        background: '#2C1810',
        headerBg: 'rgba(44, 24, 16, 0.98)',
        cardBg: '#e6dcc8',
        cardBackBg: '#3E2723',
        textPrimary: '#F5F1E8',
        textSecondary: 'rgba(245, 241, 232, 0.6)',
        accent: '#D4A574',
        border: 'rgba(212, 165, 116, 0.25)',
    },
};

export default function CollectionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const { t } = useLanguage();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const colors = isDark ? DesignColors.dark : DesignColors.light;

    const [collection, setCollection] = useState<Collection | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    // Flip animations
    const flipAnimations = useRef<{ [key: string]: Animated.Value }>({});

    const getFlipAnimation = (postId: string) => {
        if (!flipAnimations.current[postId]) {
            flipAnimations.current[postId] = new Animated.Value(0);
        }
        return flipAnimations.current[postId];
    };

    // Load collection and posts
    const loadData = useCallback(async (refresh: boolean = false) => {
        if (!id) return;

        try {
            if (refresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const [collectionData, postsData] = await Promise.all([
                getCollectionById(id),
                getCollectionPosts(id, 0, 20),
            ]);

            setCollection(collectionData);
            setPosts(postsData);
            setPage(0);
            setHasMore(postsData.length === 20);
        } catch (error) {
            console.error('Error loading collection:', error);
            Alert.alert('Hata', 'Koleksiyon yüklenemedi');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = () => {
        loadData(true);
    };

    const handleLoadMore = async () => {
        if (!id || !hasMore || isLoading) return;

        try {
            const nextPage = page + 1;
            const newPosts = await getCollectionPosts(id, nextPage, 20);

            setPosts((prev) => [...prev, ...newPosts]);
            setPage(nextPage);
            setHasMore(newPosts.length === 20);
        } catch (error) {
            console.error('Error loading more posts:', error);
        }
    };

    const handleDeleteCollection = () => {
        if (!collection) return;

        Alert.alert(
            t('collection.deleteTitle'),
            t('collection.deleteConfirm', { name: collection.name }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCollection(collection.id);
                            router.back();
                        } catch (error) {
                            console.error('Error deleting collection:', error);
                            Alert.alert(t('collection.errorTitle'), t('collection.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handlePostPress = (post: Post) => {
        router.push({
            pathname: '/post-detail/[id]',
            params: { id: post.id },
        });
    };

    const handleLike = async (postId: string, isLiked: boolean) => {
        try {
            if (isLiked) {
                await likePost(postId);
            } else {
                await unlikePost(postId);
            }

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            isLiked,
                            likes_count: isLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1),
                        }
                        : post
                )
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleBookmark = async (postId: string, isBookmarked: boolean) => {
        try {
            if (isBookmarked) {
                await bookmarkPost(postId);
            } else {
                await unbookmarkPost(postId);
                // Remove from list if unbookmarked
                setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const toggleCardFlip = (postId: string) => {
        const animation = getFlipAnimation(postId);
        const isFlipped = flippedCards.has(postId);

        Animated.spring(animation, {
            toValue: isFlipped ? 0 : 1,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        }).start();

        setFlippedCards((prev) => {
            const newSet = new Set(prev);
            if (isFlipped) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    // Polaroid card render
    const renderPolaroidCard = ({ item: post, index }: { item: Post; index: number }) => {
        const animation = getFlipAnimation(post.id);

        const frontAnimatedStyle = {
            transform: [
                {
                    rotateX: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                    }),
                },
            ],
        };

        const backAnimatedStyle = {
            transform: [
                {
                    rotateX: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['180deg', '360deg'],
                    }),
                },
            ],
        };

        const shadowStyle = {
            shadowOpacity: animation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 0.4, 0.3],
            }),
        };

        const imageUrl = post.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400';
        const locationText = post.location?.city || post.location?.country || 'Bilinmeyen Konum';

        return (
            <Pressable
                key={post.id}
                onPress={() => toggleCardFlip(post.id)}
                style={styles.polaroidWrapper}
            >
                <View style={styles.perspective}>
                    {/* Front - Polaroid */}
                    <Animated.View
                        style={[
                            styles.polaroidCard,
                            styles.cardFront,
                            frontAnimatedStyle,
                            shadowStyle,
                            { backgroundColor: colors.cardBg },
                        ]}
                    >
                        <View style={styles.polaroidImageContainer}>
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.polaroidImage}
                                contentFit="cover"
                                transition={300}
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.1)']}
                                style={StyleSheet.absoluteFill}
                            />
                        </View>
                        <View style={styles.polaroidCaption}>
                            <Text style={styles.polaroidTitle} numberOfLines={1}>
                                {post.title || 'Başlıksız'}
                            </Text>
                            <View style={styles.polaroidLocation}>
                                <MaterialIcons name="location-on" size={10} color="#8B7355" />
                                <Text style={styles.polaroidLocationText}>{locationText}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Back - Details */}
                    <Animated.View
                        style={[
                            styles.polaroidCard,
                            styles.cardBack,
                            backAnimatedStyle,
                            { backgroundColor: colors.cardBackBg },
                        ]}
                    >
                        <View style={styles.paperTexture} />
                        <View style={styles.backContent}>
                            <View style={styles.backHeader}>
                                <Text style={[styles.backLabel, { color: '#D4A574' }]}>Detaylar</Text>
                                <TouchableOpacity
                                    onPress={() => handleLike(post.id, !post.isLiked)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={post.isLiked ? 'heart' : 'heart-outline'}
                                        size={16}
                                        color={post.isLiked ? '#E53935' : '#8B7355'}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text
                                style={[
                                    styles.backNote,
                                    { color: isDark ? '#e0d6c8' : '#5D4037' },
                                ]}
                                numberOfLines={4}
                            >
                                "{post.content || 'Bu gönderi için not eklenmemiş.'}"
                            </Text>

                            <View style={styles.backFooter}>
                                <Text style={[styles.backDate, { color: isDark ? '#b8ad9d' : '#888' }]}>
                                    {new Date(post.created_at).toLocaleDateString('tr-TR', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handlePostPress(post)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <MaterialIcons
                                        name="arrow-forward"
                                        size={20}
                                        color={isDark ? '#D4A574' : '#2C1810'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </Pressable>
        );
    };

    const renderHeader = () => {
        if (!collection) return null;

        return (
            <View style={styles.headerContent}>
                {/* Cover Image */}
                <View style={[styles.coverContainer, { backgroundColor: collection.color }]}>
                    {collection.cover_image_url ? (
                        <Image
                            source={{ uri: collection.cover_image_url }}
                            style={styles.coverImage}
                            contentFit="cover"
                        />
                    ) : null}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.coverGradient}
                    />
                    <View style={styles.coverInfo}>
                        <Text style={styles.collectionName}>{collection.name}</Text>
                        <View style={styles.collectionMeta}>
                            <MaterialIcons name="photo-library" size={14} color="#D4A574" />
                            <Text style={styles.collectionCount}>{collection.post_count} Gönderi</Text>
                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={64} color={colors.accent} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                    {t('collection.empty')}
                </ThemedText>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {t('collection.emptyDesc')}
                </ThemedText>
            </View>
        );
    };

    const renderFooter = () => {
        if (!hasMore || posts.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#D4A574" />
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#D4A574" />
            </View>
        );
    }

    if (!collection) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ThemedText>{t('collection.notFound')}</ThemedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Leather texture overlay */}
            <View style={styles.leatherTexture} />

            {/* Navigation Header */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.headerBg }]}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {collection.name}
                </Text>
                <TouchableOpacity style={styles.headerButton} onPress={handleDeleteCollection}>
                    <Ionicons name="trash-outline" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPolaroidCard}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContent}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#D4A574"
                        colors={['#D4A574']}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    leatherTexture: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 165, 116, 0.2)',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontFamily: Typography.fonts.heading,
        textAlign: 'center',
        marginHorizontal: Spacing.sm,
    },
    headerContent: {
        marginBottom: Spacing.md,
    },
    coverContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
        ...Shadows.lg,
    },
    coverImage: {
        ...StyleSheet.absoluteFillObject,
    },
    coverGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    coverInfo: {
        position: 'absolute',
        bottom: Spacing.lg,
        left: Spacing.lg,
        right: Spacing.lg,
    },
    collectionName: {
        fontSize: 28,
        color: '#F5F1E8',
        fontFamily: Typography.fonts.heading,
        marginBottom: Spacing.xs,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    collectionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    collectionCount: {
        fontSize: 14,
        color: '#D4A574',
        fontFamily: Typography.fonts.ui,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(212, 165, 116, 0.4)',
        marginHorizontal: Spacing.md,
    },
    gridContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: 160,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    polaroidWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    perspective: {
        flex: 1,
    },
    polaroidCard: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 2,
        padding: 12,
        backfaceVisibility: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    cardFront: {
        borderWidth: 0.5,
        borderColor: 'rgba(200, 200, 200, 0.5)',
    },
    cardBack: {
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.4)',
    },
    polaroidImageContainer: {
        flex: 1,
        marginBottom: 12,
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
        borderRadius: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    polaroidImage: {
        ...StyleSheet.absoluteFillObject,
    },
    polaroidCaption: {
        paddingHorizontal: 4,
    },
    polaroidTitle: {
        fontSize: 14,
        color: '#2C1810',
        fontFamily: Typography.fonts.bodyBold,
        marginBottom: 4,
    },
    polaroidLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    polaroidLocationText: {
        fontSize: 10,
        color: '#5D4037',
        fontFamily: Typography.fonts.ui,
    },
    paperTexture: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
    },
    backContent: {
        flex: 1,
        padding: 4,
    },
    backHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    backLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: Typography.fonts.uiBold,
    },
    backNote: {
        flex: 1,
        fontSize: 12,
        fontStyle: 'italic',
        lineHeight: 18,
        fontFamily: Typography.fonts.handwriting,
    },
    backFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    backDate: {
        fontSize: 10,
        fontFamily: Typography.fonts.handwriting,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 3,
        gap: Spacing.md,
    },
    emptyTitle: {
        marginTop: Spacing.md,
    },
    emptyText: {
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
});
