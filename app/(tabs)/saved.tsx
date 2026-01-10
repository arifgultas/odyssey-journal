import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bookmarkPost, getBookmarkedPosts, likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { Post } from '@/lib/posts';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 3) / 2;
const CARD_HEIGHT = 250;
const COLLECTION_CARD_WIDTH = 140;

// Koleksiyon tipi (gerçek API verisi kullanır)
interface Collection {
    id: string;
    name: string;
    imageUrl: string;
    postCount: number;
    color: string;
}

// Design Colors - Tutarlı renk sistemi
const DesignColors = {
    light: {
        background: '#F5F1E8', // Açık krem arka plan
        headerBg: '#F5F1E8', // Header da açık krem
        cardBg: '#FFFFFF',
        cardBackBg: '#F5F1E8',
        textPrimary: '#2C1810', // Koyu kahverengi text
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

export default function SavedPostsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false); // İlk yükleme durumu kaldırıldı
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]); // Gerçek koleksiyon verisi

    // Tema renkleri
    const colors = isDark ? DesignColors.dark : DesignColors.light;
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    // Flip animasyonları için referanslar
    const flipAnimations = useRef<{ [key: string]: Animated.Value }>({});

    const getFlipAnimation = (postId: string) => {
        if (!flipAnimations.current[postId]) {
            flipAnimations.current[postId] = new Animated.Value(0);
        }
        return flipAnimations.current[postId];
    };

    const loadBookmarkedPosts = async (pageNum: number = 0, refresh: boolean = false) => {
        try {
            if (refresh) {
                setIsRefreshing(true);
            }
            // İlk yüklemede loading göstermiyoruz

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
            Alert.alert('Hata', 'Kaydedilen gönderiler yüklenemedi');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadBookmarkedPosts(0, false); // refresh: false - loading spinner gösterme
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
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            isLiked: !isLiked,
                            likes_count: !isLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1),
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
                setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            loadBookmarkedPosts(0, true);
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

    // Koleksiyon kartı render
    const renderCollectionCard = (collection: Collection) => (
        <TouchableOpacity
            key={collection.id}
            style={styles.collectionCardWrapper}
            activeOpacity={0.9}
        >
            {/* Kitap sırtı efekti */}
            <View style={styles.bookSpine} />

            <View style={[styles.collectionCard, { backgroundColor: collection.color }]}>
                <Image
                    source={{ uri: collection.imageUrl }}
                    style={styles.collectionImage}
                    contentFit="cover"
                    transition={300}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.collectionGradient}
                />
                <View style={styles.collectionInfo}>
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    <View style={styles.collectionMeta}>
                        <MaterialIcons name="photo-library" size={10} color="#D4A574" />
                        <Text style={styles.collectionCount}>{collection.postCount} Gönderi</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Polaroid kart render (flip animasyonlu)
    const renderPolaroidCard = ({ item: post, index }: { item: Post; index: number }) => {
        const animation = getFlipAnimation(post.id);
        const isFlipped = flippedCards.has(post.id);

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
                    {/* Ön yüz - Polaroid */}
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

                    {/* Arka yüz - Detaylar */}
                    <Animated.View
                        style={[
                            styles.polaroidCard,
                            styles.cardBack,
                            backAnimatedStyle,
                            { backgroundColor: colors.cardBackBg },
                        ]}
                    >
                        {/* Kağıt dokusu overlay */}
                        <View style={styles.paperTexture} />

                        <View style={styles.backContent}>
                            {/* Header */}
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

                            {/* Not içeriği */}
                            <Text
                                style={[
                                    styles.backNote,
                                    { color: isDark ? '#e0d6c8' : '#5D4037' },
                                ]}
                                numberOfLines={4}
                            >
                                "{post.content || 'Bu gönderi için not eklenmemiş.'}"
                            </Text>

                            {/* Footer */}
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

    const renderHeader = () => (
        <>
            {/* Koleksiyonlar Bölümü - Her zaman göster */}
            <View style={styles.collectionsSection}>
                <View style={styles.collectionsSectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        Koleksiyonlar
                    </Text>
                    <TouchableOpacity style={styles.newCollectionButton} activeOpacity={0.8}>
                        <MaterialIcons name="add" size={14} color="#2C1810" />
                        <Text style={styles.newCollectionText}>Yeni</Text>
                    </TouchableOpacity>
                </View>

                {collections.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.collectionsScroll}
                        snapToInterval={COLLECTION_CARD_WIDTH + Spacing.md}
                        decelerationRate="fast"
                    >
                        {collections.map(renderCollectionCard)}
                    </ScrollView>
                ) : (
                    /* Koleksiyon yoksa boş state */
                    <View style={styles.emptyCollectionsContainer}>
                        <View style={[styles.emptyCollectionCard, { borderColor: colors.border }]}>
                            <Ionicons name="folder-outline" size={32} color={colors.accent} style={{ opacity: 0.6 }} />
                            <Text style={[styles.emptyCollectionText, { color: colors.textSecondary }]}>
                                Henüz koleksiyon yok
                            </Text>
                            <Text style={[styles.emptyCollectionSubtext, { color: colors.textSecondary }]}>
                                Gönderilerinizi düzenlemek için koleksiyon oluşturun
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Ayırıcı */}
            <View style={styles.divider} />
        </>
    );

    const renderEmpty = () => {
        if (isLoading) {
            return null;
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="bookmark-outline" size={80} color="#D4A574" />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                    Kaydedilen Gönderi Yok
                </ThemedText>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Kaydettiğiniz gönderiler burada görünecek
                </ThemedText>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || posts.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#D4A574" />
            </View>
        );
    };

    // Tüm postları göster (sekmeler kaldırıldı)
    const filteredPosts = posts;

    // Loading state kaldırıldı - sayfa hemen içeriği gösteriyor

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Deri doku overlay */}
            <View style={styles.leatherTexture} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.headerBg }]}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Kaydedilenler</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <MaterialIcons name="search" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredPosts}
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
    leatherTexture: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,
        // SVG doku yerine hafif gradient kullanıyoruz
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F5F1E8',
        fontFamily: Typography.fonts.heading,
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Koleksiyonlar
    collectionsSection: {
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    collectionsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: Typography.fonts.heading,
        letterSpacing: 0.5,
    },
    newCollectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#D4A574',
        ...Shadows.md,
    },
    newCollectionText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#2C1810',
        fontFamily: Typography.fonts.ui,
    },
    collectionsScroll: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
        gap: Spacing.md,
    },
    collectionCardWrapper: {
        width: COLLECTION_CARD_WIDTH,
        marginRight: Spacing.md,
    },
    bookSpine: {
        position: 'absolute',
        left: -8,
        top: 4,
        bottom: 4,
        width: 8,
        backgroundColor: '#1a100c',
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
    },
    collectionCard: {
        width: COLLECTION_CARD_WIDTH,
        aspectRatio: 3 / 4,
        borderTopRightRadius: BorderRadius.lg,
        borderBottomRightRadius: BorderRadius.lg,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
        overflow: 'hidden',
        borderLeftWidth: 4,
        borderLeftColor: 'rgba(212, 165, 116, 0.3)',
        ...Shadows.lg,
    },
    collectionImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9,
    },
    collectionGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    collectionInfo: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    collectionName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F5F1E8',
        fontFamily: Typography.fonts.heading,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    collectionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    collectionCount: {
        fontSize: 10,
        color: '#D4A574',
        fontFamily: Typography.fonts.ui,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Empty Collections State
    emptyCollectionsContainer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    emptyCollectionCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    emptyCollectionText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Typography.fonts.ui,
        marginTop: Spacing.xs,
    },
    emptyCollectionSubtext: {
        fontSize: 12,
        fontFamily: Typography.fonts.ui,
        textAlign: 'center',
        opacity: 0.7,
    },

    // Divider
    divider: {
        height: 1,
        marginVertical: Spacing.sm,
        marginHorizontal: Spacing.xl,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 165, 116, 0.4)',
    },

    // Sekmeler
    tabsContainer: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    tabsInner: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 165, 116, 0.2)',
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: Spacing.sm,
        marginRight: Spacing.lg,
        position: 'relative',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: Typography.fonts.ui,
        letterSpacing: 0.3,
    },
    tabTextActive: {
        fontWeight: '600',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#D4A574',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    filterButton: {
        marginLeft: 'auto',
        paddingBottom: 12,
    },

    // Grid
    gridContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 160,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },

    // Polaroid Kartlar
    polaroidWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    perspective: {
        flex: 1,
        // React Native'de perspective CSS değil, transform ile uygulanır
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
        // Sepia efekti için tintColor veya overlay kullanılabilir
    },
    polaroidCaption: {
        paddingHorizontal: 4,
    },
    polaroidTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2C1810',
        fontFamily: Typography.fonts.body,
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
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    // Arka yüz
    paperTexture: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    backContent: {
        flex: 1,
    },
    backHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 165, 116, 0.3)',
        paddingBottom: 8,
        marginBottom: 8,
    },
    backLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: Typography.fonts.ui,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    backNote: {
        fontSize: 12,
        fontStyle: 'italic',
        lineHeight: 18,
        fontFamily: Typography.fonts.bodyItalic,
        flex: 1,
    },
    backFooter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 165, 116, 0.2)',
        paddingTop: 8,
        marginTop: 'auto',
    },
    backDate: {
        fontSize: 9,
        fontFamily: Typography.fonts.ui,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl * 2,
        gap: Spacing.md,
    },
    emptyTitle: {
        marginTop: Spacing.md,
        fontFamily: Typography.fonts.heading,
        color: '#F5F1E8',
    },
    emptyText: {
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
});
