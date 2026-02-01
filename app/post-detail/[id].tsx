import { ReportModal } from '@/components/report-modal';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bookmarkPost, checkIfBookmarked, checkIfLiked, likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { deletePost, fetchPostById, Post } from '@/lib/posts';
import { generatePostShareUrl, getPostShareMessage, sharePost } from '@/lib/share';
import { supabase } from '@/lib/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.55;

// Google Stitch Design Colors
const DesignColors = {
    light: {
        background: '#F5F1E8',
        backgroundDark: '#2C1810',
        paper: '#FFFFFF',
        paperDark: '#3E2C22',
        primary: '#eba447',
        accentGold: '#D4A574',
        borderBrown: '#8B5E3C',
        textMain: '#2C1810',
        textMuted: '#5c4033',
        textSubtle: '#8c7063',
        parchment: '#E8DCC8',
        sepia: 'rgba(112, 66, 20, 0.15)',
    },
    dark: {
        background: '#2C1810',
        paper: '#3E2C22',
        primary: '#D4A574',
        accentGold: '#D4A574',
        borderBrown: '#5c4033',
        textMain: '#F5F1E8',
        textMuted: '#D4A574',
        textSubtle: '#a89083',
        parchment: '#3E2C22',
        sepia: 'rgba(0, 0, 0, 0.3)',
    },
};

import { useLanguage } from '@/context/language-context';

export default function PostDetailScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { t, language } = useLanguage();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;

    const { id } = useLocalSearchParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isOwnPost, setIsOwnPost] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [noteText, setNoteText] = useState('');

    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            const postData = await fetchPostById(id);
            setPost(postData);
            setLikesCount(postData.likes_count || 0);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsOwnPost(user.id === postData.user_id);
            }

            // Check interaction status
            const [liked, bookmarked] = await Promise.all([
                checkIfLiked(id),
                checkIfBookmarked(id)
            ]);
            setIsLiked(liked);
            setIsBookmarked(bookmarked);
        } catch (error) {
            console.error('Error loading post:', error);
            Alert.alert('Error', 'Failed to load post details');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async () => {
        if (!post) return;

        const newIsLiked = !isLiked;
        // Optimistic update
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        try {
            if (newIsLiked) {
                await likePost(post.id);
            } else {
                await unlikePost(post.id);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikesCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    const handleBookmark = async () => {
        if (!post) return;

        const newIsBookmarked = !isBookmarked;
        // Optimistic update
        setIsBookmarked(newIsBookmarked);

        try {
            if (newIsBookmarked) {
                await bookmarkPost(post.id);
            } else {
                await unbookmarkPost(post.id);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            // Revert on error
            setIsBookmarked(!newIsBookmarked);
        }
    };

    const handleShare = async () => {
        if (!post) return;

        const shareUrl = generatePostShareUrl(post.id);
        const shareMessage = getPostShareMessage(post.title, post.content);

        await sharePost({
            title: post.title,
            message: shareMessage,
            url: shareUrl,
        });
    };

    const handleReport = () => {
        setShowReportModal(true);
        setShowMenu(false);
    };

    const handleDelete = () => {
        if (!post) return;

        Alert.alert(
            t('post.deleteTitle'),
            t('post.deleteConfirm'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePost(post.id);
                            Alert.alert(t('common.success'), t('post.deleteSuccess'));
                            router.back();
                        } catch (error) {
                            console.error('Error deleting post:', error);
                            Alert.alert(t('common.error'), t('post.deleteError'));
                        }
                    },
                },
            ]
        );
        setShowMenu(false);
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDayOfWeek = (dateString: string) => {
        const date = new Date(dateString);
        const dayName = date.toLocaleDateString(language, { weekday: 'long' });
        const hour = date.getHours();
        // Simple time of day localization - could be improved with t()
        const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
        return `${dayName}`;
    };

    // Parallax effect for hero image
    const heroTranslateY = scrollY.interpolate({
        inputRange: [-100, 0, HERO_HEIGHT],
        outputRange: [-50, 0, HERO_HEIGHT * 0.4],
        extrapolate: 'clamp',
    });

    const heroOpacity = scrollY.interpolate({
        inputRange: [0, HERO_HEIGHT * 0.5],
        outputRange: [1, 0.3],
        extrapolate: 'clamp',
    });

    // Scroll-based header animation
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100, 150],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 100, 150],
        outputRange: [0, 0, -50],
        extrapolate: 'clamp',
    });

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.floatingHeader, { paddingTop: insets.top + Spacing.sm }]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.floatingButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </View>
        );
    }

    if (!post) {
        return null;
    }

    const heroImage = post.images && post.images.length > 0
        ? post.images[0]
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Fixed Hero Background */}
            <Animated.View
                style={[
                    styles.heroContainer,
                    {
                        transform: [{ translateY: heroTranslateY }],
                        opacity: heroOpacity,
                    }
                ]}
            >
                <Image
                    source={{ uri: heroImage }}
                    style={styles.heroImage}
                    contentFit="cover"
                />
                <LinearGradient
                    colors={[
                        'rgba(0,0,0,0.2)',
                        'rgba(0,0,0,0)',
                        'rgba(44, 24, 16, 0.1)',
                        'rgba(44, 24, 16, 0.4)',
                    ]}
                    locations={[0, 0.4, 0.8, 1]}
                    style={styles.heroGradient}
                />
            </Animated.View>

            {/* Floating Header Buttons */}
            <Animated.View style={[
                styles.floatingHeader,
                {
                    paddingTop: insets.top + Spacing.sm,
                    opacity: headerOpacity,
                    transform: [{ translateY: headerTranslateY }],
                }
            ]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.floatingButton}
                >
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.floatingButtonGroup}>
                    <TouchableOpacity
                        onPress={handleBookmark}
                        style={styles.floatingButton}
                    >
                        <Ionicons
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleShare}
                        style={styles.floatingButton}
                    >
                        <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: HERO_HEIGHT - 40 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Content Card */}
                <View style={[
                    styles.contentCard,
                    {
                        backgroundColor: theme.background,
                        ...Shadows.lg,
                    }
                ]}>
                    {/* Drag Handle */}
                    <View style={[styles.dragHandle, { backgroundColor: isDark ? 'rgba(212, 165, 116, 0.3)' : 'rgba(139, 94, 60, 0.3)' }]} />

                    {/* Date and Weather Section */}
                    <View style={styles.dateWeatherSection}>
                        <View style={[styles.dateBorder, { borderColor: isDark ? 'rgba(212, 165, 116, 0.2)' : 'rgba(139, 94, 60, 0.2)' }]}>
                            {/* Date */}
                            <View style={styles.dateContainer}>
                                <Text style={[styles.dateText, { color: theme.primary }]}>
                                    {formatFullDate(post.created_at)}
                                </Text>
                                <Text style={[styles.dayText, { color: theme.textMuted }]}>
                                    {formatDayOfWeek(post.created_at)}
                                </Text>
                            </View>

                            {/* Weather Card */}
                            {post.weather_data ? (
                                <View style={[styles.weatherCard, { backgroundColor: isDark ? theme.paper : '#FDFBF7', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139, 94, 60, 0.4)' }]}>
                                    <View style={[styles.weatherCorner, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139, 94, 60, 0.2)' }]} />
                                    <Ionicons name={post.weather_data.icon as any} size={28} color={theme.primary} />
                                    <Text style={[styles.weatherTemp, { color: theme.textMain, borderColor: isDark ? 'rgba(212, 165, 116, 0.3)' : 'rgba(139, 94, 60, 0.3)' }]}>
                                        {post.weather_data.temperature}°C
                                    </Text>
                                    <Text style={[styles.weatherCondition, { color: theme.textSubtle }]}>
                                        {post.weather_data.condition}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Author Section - Vintage Postcard Style */}
                    {post.profiles && (
                        <View style={[styles.authorSection, { borderColor: isDark ? 'rgba(212, 165, 116, 0.2)' : 'rgba(139, 94, 60, 0.2)' }]}>
                            <View style={styles.authorInfo}>
                                <View style={[styles.authorAvatar, { borderColor: isDark ? theme.accentGold : theme.borderBrown }]}>
                                    {post.profiles.avatar_url ? (
                                        <Image
                                            source={{ uri: post.profiles.avatar_url }}
                                            style={styles.authorAvatarImage}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <Ionicons name="person" size={24} color={theme.textSubtle} />
                                    )}
                                </View>
                                <View style={styles.authorDetails}>
                                    <Text style={[styles.authorName, { color: theme.textMain }]}>
                                        {post.profiles.full_name || post.profiles.username || 'Travel Enthusiast'}
                                    </Text>
                                    <Text style={[styles.authorHandle, { color: theme.textSubtle }]}>
                                        @{post.profiles.username || 'traveler'}
                                    </Text>
                                </View>
                            </View>
                            {!isOwnPost && (
                                <TouchableOpacity style={[styles.followBtn, { backgroundColor: theme.primary }]}>
                                    <Text style={[styles.followBtnText, { color: isDark ? theme.background : '#FFFFFF' }]}>
                                        {t('follow.follow')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Title */}
                    <Text style={[styles.postTitle, { color: theme.textMain }]}>
                        {post.title}
                    </Text>

                    {/* Polaroid Image Carousel */}
                    {post.images && post.images.length > 0 && (
                        <View style={styles.polaroidCarouselContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.polaroidCarousel}
                                decelerationRate="fast"
                                snapToInterval={width * 0.7}
                            >
                                {post.images.map((imageUrl, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.polaroidCard,
                                            { transform: [{ rotate: index % 2 === 0 ? '-2deg' : '2deg' }] }
                                        ]}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.polaroidImageContainer}>
                                            <Image
                                                source={{ uri: imageUrl }}
                                                style={styles.polaroidImage}
                                                contentFit="cover"
                                            />
                                            <View style={styles.polaroidImageOverlay} />
                                        </View>
                                        <View style={styles.polaroidCaption}>
                                            <Text style={styles.polaroidCaptionText}>
                                                {post.image_captions && post.image_captions[index]
                                                    ? post.image_captions[index]
                                                    : `${t('post.memory')} ${index + 1}`}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                <View style={{ width: 16 }} />
                            </ScrollView>
                        </View>
                    )}

                    {/* Post Content */}
                    <View style={styles.proseContainer}>
                        <Text style={[styles.proseText, { color: theme.textMain }]}>
                            <Text style={[styles.dropCap, { color: theme.primary }]}>
                                {post.content.charAt(0)}
                            </Text>
                            {post.content.slice(1)}
                        </Text>
                    </View>

                    {/* Location Map Card */}
                    {post.location && (
                        <View style={[styles.mapCard, { backgroundColor: isDark ? theme.paper : '#fdfbf7' }]}>
                            <View style={[styles.mapHeader, { backgroundColor: isDark ? theme.background : theme.parchment }]}>
                                {/* Vintage paper texture overlay */}
                                <View style={styles.mapTextureOverlay} />

                                <View style={styles.mapHeaderRow}>
                                    <View style={styles.mapLocationInfo}>
                                        <Ionicons name="compass" size={32} color={theme.textMuted} />
                                        <View style={styles.mapLocationText}>
                                            <Text style={[styles.mapLocationName, { color: theme.textMuted }]}>
                                                {post.location.city || t('post.location')}
                                            </Text>
                                            <Text style={[styles.mapLocationCountry, { color: theme.textSubtle }]}>
                                                {post.location.country || post.location.address || t('post.address')}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.mapOpenButton}>
                                        <Ionicons name="open-outline" size={24} color={theme.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                {/* Map Preview */}
                                <View style={[styles.mapPreview, { borderColor: isDark ? 'rgba(139, 94, 60, 0.3)' : 'rgba(139, 94, 60, 0.3)' }]}>
                                    <Image
                                        source={{
                                            uri: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${post.location.longitude},${post.location.latitude},10,0/400x200?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`
                                        }}
                                        style={styles.mapImage}
                                        contentFit="cover"
                                    />
                                    {/* Grid overlay */}
                                    <View style={styles.mapGridOverlay} />
                                    {/* Location marker */}
                                    <View style={styles.mapMarker}>
                                        <Ionicons name="location" size={40} color="#8B0000" />
                                    </View>
                                    {/* Sepia filter */}
                                    <View style={styles.mapSepiaOverlay} />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Memories & Notes Section */}
                    <View style={styles.notesSection}>
                        <View style={styles.notesSectionHeader}>
                            <Text style={[styles.notesSectionTitle, { color: theme.textMain }]}>
                                {t('post.memoriesTitle')}
                            </Text>
                            <View style={[styles.notesCount, { backgroundColor: isDark ? theme.paper : 'rgba(232, 220, 200, 0.5)', borderColor: isDark ? 'rgba(139, 94, 60, 0.2)' : 'rgba(139, 94, 60, 0.2)' }]}>
                                <Text style={[styles.notesCountText, { color: isDark ? theme.accentGold : theme.borderBrown }]}>
                                    {t('post.notesCount', { count: post.comments_count || 0 })}
                                </Text>
                            </View>
                        </View>

                        {/* Comment Cards - Postcard Style */}
                        {post.comments_count === 0 ? (
                            <View style={[styles.emptyNotes, { backgroundColor: isDark ? theme.paper : '#FFFFFF', borderColor: isDark ? theme.borderBrown : theme.parchment }]}>
                                <Ionicons name="chatbubbles-outline" size={48} color={theme.textSubtle} />
                                <Text style={[styles.emptyNotesText, { color: theme.textSubtle }]}>
                                    {t('post.noNotes')}
                                </Text>
                                <Text style={[styles.emptyNotesSubtext, { color: theme.textSubtle }]}>
                                    {t('post.beFirst')}
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.viewCommentsButton, { backgroundColor: isDark ? theme.paper : '#FFFFFF', borderColor: isDark ? theme.borderBrown : theme.parchment }]}
                                onPress={() => router.push({
                                    pathname: '/comments/[postId]',
                                    params: { postId: post.id }
                                })}
                            >
                                <Ionicons name="chatbubbles-outline" size={24} color={theme.primary} />
                                <Text style={[styles.viewCommentsText, { color: theme.textMain }]}>
                                    {t('post.viewNotes', { count: post.comments_count })}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={theme.textSubtle} />
                            </TouchableOpacity>
                        )}

                        {/* Dashed separator */}
                        <View style={styles.dashedSeparator}>
                            <View style={[styles.dashedLine, { borderColor: theme.borderBrown }]} />
                        </View>

                        {/* Write a note input */}
                        <TouchableOpacity
                            style={[styles.noteInput, { backgroundColor: isDark ? theme.paper : '#FDFBF7', borderColor: isDark ? 'rgba(139, 94, 60, 0.4)' : 'rgba(139, 94, 60, 0.4)' }]}
                            onPress={() => router.push({
                                pathname: '/comments/[postId]',
                                params: { postId: post.id }
                            })}
                        >
                            <View style={[styles.noteInputIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(232, 220, 200, 0.5)' }]}>
                                <Ionicons name="pencil" size={20} color={theme.borderBrown} />
                            </View>
                            <Text style={[styles.noteInputPlaceholder, { color: theme.textSubtle }]}>
                                {t('post.writeNote')}
                            </Text>
                        </TouchableOpacity>

                        {/* History icon at bottom */}
                        <View style={styles.historyIcon}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={36} color={theme.textMain} style={{ opacity: 0.3 }} />
                        </View>
                    </View>

                    {/* Actions Bar */}
                    <View style={[styles.actionsBar, { borderTopColor: isDark ? theme.borderBrown : theme.parchment }]}>
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={handleLike}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={26}
                                color={isLiked ? '#E57373' : theme.textMain}
                            />
                            <Text style={[styles.actionText, isLiked && { color: '#E57373' }, { color: theme.textMain }]}>
                                {likesCount}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => router.push({
                                pathname: '/comments/[postId]',
                                params: { postId: post.id }
                            })}
                        >
                            <Ionicons name="chatbubble-outline" size={24} color={theme.textMain} />
                            <Text style={[styles.actionText, { color: theme.textMain }]}>
                                {post.comments_count || 0}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => setShowMenu(!showMenu)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textMain} />
                        </TouchableOpacity>
                    </View>

                    {/* Menu */}
                    {showMenu && (
                        <View style={[styles.menu, { backgroundColor: isDark ? theme.paper : '#FFFFFF', borderColor: theme.parchment }]}>
                            {isOwnPost ? (
                                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                                    <Ionicons name="trash-outline" size={20} color="#E57373" />
                                    <Text style={[styles.menuText, { color: '#E57373' }]}>
                                        {t('post.deleteTitle')}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                                    <Ionicons name="flag-outline" size={20} color="#E57373" />
                                    <Text style={[styles.menuText, { color: '#E57373' }]}>
                                        {t('post.reportPost')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Bottom padding */}
                    <View style={{ height: insets.bottom + 40 }} />
                </View>
            </Animated.ScrollView>

            {/* Report Modal */}
            <ReportModal
                visible={showReportModal}
                postId={post.id}
                onClose={() => setShowReportModal(false)}
                onReported={() => {
                    // Optional: Add any post-report actions
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Hero Section
    heroContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HERO_HEIGHT + 50,
        zIndex: 0,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    // Floating Header
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        zIndex: 50,
    },
    floatingButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    floatingButtonGroup: {
        flexDirection: 'row',
        gap: 12,
    },

    // Content Card
    contentCard: {
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        minHeight: height * 0.6,
    },
    dragHandle: {
        width: 64,
        height: 6,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },

    // Date & Weather Section
    dateWeatherSection: {
        marginBottom: Spacing.xl,
    },
    dateBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        paddingBottom: Spacing.md,
    },
    dateContainer: {
        flex: 1,
    },
    dateText: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 44,
        fontWeight: '700',
        letterSpacing: 1,
        transform: [{ rotate: '-2deg' }],
    },
    dayText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginTop: 8,
        marginLeft: 4,
    },
    weatherCard: {
        width: 80,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        transform: [{ rotate: '2deg' }],
        position: 'relative',
    },
    weatherCorner: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 16,
        height: 16,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderBottomLeftRadius: 8,
        backgroundColor: 'rgba(232, 220, 200, 0.3)',
    },
    weatherTemp: {
        fontFamily: Typography.fonts.heading,
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
        borderTopWidth: 1,
        borderStyle: 'dashed',
        paddingTop: 4,
        width: '100%',
        textAlign: 'center',
    },
    weatherCondition: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 12,
        marginTop: 2,
        textTransform: 'uppercase',
    },

    // Title
    postTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 40,
        fontWeight: '700',
        lineHeight: 44,
        letterSpacing: -0.5,
        marginBottom: Spacing.xl,
    },

    // Polaroid Carousel
    polaroidCarouselContainer: {
        marginHorizontal: -Spacing.lg,
        marginBottom: Spacing.xl,
        paddingVertical: Spacing.md,
    },
    polaroidCarousel: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        gap: Spacing.lg,
    },
    polaroidCard: {
        width: width * 0.6,
        backgroundColor: '#FFFFFF',
        padding: 12,
        paddingBottom: 48,
        borderRadius: 2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    polaroidImageContainer: {
        aspectRatio: 4 / 5,
        backgroundColor: '#F0F0F0',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    polaroidImage: {
        width: '100%',
        height: '100%',
    },
    polaroidImageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(200, 150, 100, 0.1)',
    },
    polaroidCaption: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    polaroidCaptionText: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 24,
        color: 'rgba(44, 24, 16, 0.8)',
        transform: [{ rotate: '1deg' }],
        textAlign: 'center',
    },

    // Prose Content
    proseContainer: {
        marginBottom: Spacing.xl,
    },
    proseText: {
        fontFamily: Typography.fonts.body,
        fontSize: 18,
        lineHeight: 30,
    },
    dropCap: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 72,
        lineHeight: 72,
        fontWeight: '700',
        marginRight: 12,
    },

    // Map Card
    mapCard: {
        borderRadius: 2,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        marginBottom: Spacing.xl,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
        padding: 4,
        transform: [{ rotate: '0.5deg' }],
    },
    mapHeader: {
        padding: 12,
        borderRadius: 2,
        overflow: 'hidden',
    },
    mapTextureOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
    },
    mapHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        zIndex: 10,
    },
    mapLocationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    mapLocationText: {
        flexDirection: 'column',
    },
    mapLocationName: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
    },
    mapLocationCountry: {
        fontFamily: Typography.fonts.heading,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginTop: 2,
    },
    mapOpenButton: {
        padding: 4,
    },
    mapPreview: {
        height: 192,
        borderRadius: 4,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    mapGridOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Grid lines effect via background
    },
    mapMarker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -40,
    },
    mapSepiaOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(112, 66, 20, 0.15)',
    },

    // Notes Section
    notesSection: {
        marginBottom: Spacing.xl,
    },
    notesSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: Spacing.md,
        paddingHorizontal: 4,
    },
    notesSectionTitle: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 30,
        fontWeight: '700',
    },
    notesCount: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    notesCountText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    emptyNotes: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        borderRadius: 2,
        borderWidth: 1,
    },
    emptyNotesText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        marginTop: Spacing.md,
    },
    emptyNotesSubtext: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        marginTop: Spacing.xs,
    },
    viewCommentsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
        borderRadius: 2,
        borderWidth: 1,
    },
    viewCommentsText: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        flex: 1,
        marginLeft: Spacing.sm,
    },
    dashedSeparator: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
        opacity: 0.3,
    },
    dashedLine: {
        width: 96,
        borderTopWidth: 2,
        borderStyle: 'dashed',
    },
    noteInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        paddingRight: Spacing.md,
        borderRadius: 999,
        borderWidth: 1,
        borderStyle: 'dashed',
        maxWidth: 340,
    },
    noteInputIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteInputPlaceholder: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 20,
        marginLeft: Spacing.sm,
        flex: 1,
    },
    historyIcon: {
        alignItems: 'center',
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },

    // Actions Bar
    actionsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xs,
        borderTopWidth: 1,
        gap: Spacing.lg,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    actionText: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
    },

    // Menu
    menu: {
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
        padding: Spacing.xs,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
    },
    menuText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 15,
    },

    // Author Section
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        marginBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    authorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(232, 220, 200, 0.3)',
    },
    authorAvatarImage: {
        width: '100%',
        height: '100%',
    },
    authorDetails: {
        gap: 2,
    },
    authorName: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
    },
    authorHandle: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
    },
    followBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    followBtnText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
    },
});
