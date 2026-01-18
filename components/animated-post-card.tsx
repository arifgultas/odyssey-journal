/**
 * Enhanced Post Card Component with Advanced Animations
 * Features:
 * - Appear: Fade in + slight Y translation
 * - Press: Scale down 0.98 + shadow decrease
 * - Image load: Blur to sharp transition
 * - Like Button: Animated with particles
 * - Bookmark: Animated ribbon fold
 */

import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { AnimatedBookmarkButton } from './animated-bookmark-button';
import { AnimatedLikeButton } from './animated-like-button';
import { ImageCarousel } from './image-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


interface AnimatedPostCardProps {
    post: Post;
    index?: number; // For alternating rotations and staggered animations
    onPress?: () => void;
    onLike?: (postId: string, isLiked: boolean) => void;
    onBookmark?: (postId: string, isBookmarked: boolean) => void;
    onComment?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onReport?: () => void;
    isOwnPost?: boolean;
}

export function AnimatedPostCard({
    post,
    index = 0,
    onPress,
    onLike,
    onBookmark,
    onComment,
    onShare,
    onDelete,
    onReport,
    isOwnPost = false,
}: AnimatedPostCardProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Animation values
    const appearAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shadowAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const imageBlurAnim = useRef(new Animated.Value(1)).current;

    // Get a deterministic rotation for polaroid effect (-3 to 3 degrees)
    const baseRotation = useMemo(() => {
        const rotations = [-3, 2, -2, 1, -1, 3, 0];
        return rotations[index % rotations.length];
    }, [index]);


    // Appear animation on mount with stagger
    useEffect(() => {
        const delay = index * 100; // Staggered entrance

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(appearAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [index]);

    // Image blur to sharp transition
    useEffect(() => {
        if (imageLoaded) {
            Animated.timing(imageBlurAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }
    }, [imageLoaded]);

    // Format date for polaroid caption (e.g., "October 14, 2023")
    const formatDateForPolaroid = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Get location display text
    const getLocationText = () => {
        if (post.location) {
            if (post.location.city && post.location.country) {
                const countryCode = post.location.country.substring(0, 2).toUpperCase();
                return `${post.location.city}, ${countryCode}`;
            }
            return post.location.city || post.location.country || post.title;
        }
        return post.title;
    };

    const handleLike = () => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));
        onLike?.(post.id, newIsLiked);
    };

    const handleBookmark = () => {
        const newIsBookmarked = !isBookmarked;
        setIsBookmarked(newIsBookmarked);
        onBookmark?.(post.id, newIsBookmarked);
    };

    const handleUserPress = (e: any) => {
        e.stopPropagation();
        if (post.profiles?.id) {
            router.push(`/user-profile/${post.profiles.id}`);
        }
    };

    // Press animations
    const handlePressIn = () => {
        Animated.parallel([
            // Scale down slightly
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
            // Reduce shadow
            Animated.timing(shadowAnim, {
                toValue: 0.5,
                duration: 100,
                useNativeDriver: true,
            }),
            // Reset rotation
            Animated.spring(rotateAnim, {
                toValue: 1,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            // Spring back to normal
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
            // Restore shadow
            Animated.timing(shadowAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            // Restore rotation
            Animated.spring(rotateAnim, {
                toValue: 0,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Interpolations
    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [`${baseRotation}deg`, '0deg'],
    });

    const translateY = appearAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    const shadowOpacity = shadowAnim.interpolate({
        inputRange: [0.5, 1],
        outputRange: [0.06, 0.12],
    });

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                {
                    opacity: appearAnim,
                    transform: [
                        { translateY },
                        { rotate: rotateInterpolate },
                        { scale: scaleAnim },
                    ],
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        shadowOpacity,
                    },
                ]}
            >
                {/* Images - Polaroid Style - Swipeable */}
                {post.images && post.images.length > 0 && (
                    <View style={styles.polaroidFrame}>
                        <View style={styles.imageWrapper}>
                            <ImageCarousel
                                images={post.images}
                                style={styles.carousel}
                                onImageLoad={() => setImageLoaded(true)}
                            />

                            {/* Image count badge */}
                            {post.images.length > 1 && (
                                <View style={styles.imageCount}>
                                    <Ionicons name="images" size={14} color={Colors.light.surface} />
                                    <Text style={styles.imageCountText}>+{post.images.length - 1}</Text>
                                </View>
                            )}
                        </View>

                        {/* Polaroid Caption - Tappable to open post */}
                        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                            <View style={styles.polaroidCaption}>
                                <Text style={[styles.locationTitle, { color: theme.text }]} numberOfLines={1}>
                                    {getLocationText()}
                                </Text>
                                <Text style={[styles.dateText, { color: theme.textMuted }]}>
                                    {formatDateForPolaroid(post.created_at)}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                )}

                {/* User Info Section - Tappable */}
                <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                    <View style={[styles.userSection, { borderTopColor: theme.border }]}>
                        <TouchableWithoutFeedback onPress={handleUserPress}>
                            <View style={styles.userInfo}>
                                <View
                                    style={[
                                        styles.avatar,
                                        { backgroundColor: theme.background, borderColor: theme.border },
                                    ]}
                                >
                                    {post.profiles?.avatar_url ? (
                                        <Image
                                            source={{ uri: post.profiles.avatar_url }}
                                            style={styles.avatarImage}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <Ionicons name="person" size={18} color={theme.textMuted} />
                                    )}
                                </View>
                                <View style={styles.userTextContainer}>
                                    <Text style={[styles.username, { color: theme.text }]}>
                                        {post.profiles?.full_name || post.profiles?.username || 'Traveler'}
                                    </Text>
                                    <Text style={[styles.postContent, { color: theme.textSecondary }]} numberOfLines={2}>
                                        {post.content}
                                    </Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>

                        {/* More Menu Button */}
                        <TouchableWithoutFeedback
                            onPress={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                        >
                            <View style={styles.moreButton}>
                                <Ionicons name="ellipsis-horizontal" size={18} color={theme.textMuted} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </Pressable>

                {/* Menu Dropdown */}
                {showMenu && (
                    <Animated.View
                        style={[
                            styles.menu,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                    >
                        {isOwnPost ? (
                            <TouchableWithoutFeedback
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onDelete?.();
                                }}
                            >
                                <View style={styles.menuItem}>
                                    <Ionicons name="trash-outline" size={18} color={Colors.light.error} />
                                    <Text style={[styles.menuText, { color: Colors.light.error }]}>Delete Post</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        ) : (
                            <TouchableWithoutFeedback
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onReport?.();
                                }}
                            >
                                <View style={styles.menuItem}>
                                    <Ionicons name="flag-outline" size={18} color={Colors.light.error} />
                                    <Text style={[styles.menuText, { color: Colors.light.error }]}>Report Post</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        )}
                    </Animated.View>
                )}

                {/* Actions Bar - With Animated Buttons */}
                <View style={[styles.actions, { borderTopColor: theme.border }]}>
                    {/* Animated Like Button */}
                    <AnimatedLikeButton
                        isLiked={isLiked}
                        likesCount={likesCount}
                        onPress={handleLike}
                        size={20}
                    />

                    {/* Comment Button */}
                    <TouchableWithoutFeedback onPress={onComment}>
                        <View style={styles.actionButton}>
                            <Ionicons name="chatbubble-outline" size={18} color={theme.textMuted} />
                            <Text style={[styles.actionText, { color: theme.textMuted }]}>
                                {post.comments_count || 0}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>

                    {/* Share Button */}
                    <TouchableWithoutFeedback onPress={onShare}>
                        <View style={styles.actionButton}>
                            <Ionicons name="share-outline" size={18} color={theme.textMuted} />
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={{ flex: 1 }} />

                    {/* Animated Bookmark Button */}
                    <AnimatedBookmarkButton
                        isBookmarked={isBookmarked}
                        onToggle={handleBookmark}
                        size={20}
                    />
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        marginBottom: Spacing.xl,
        marginHorizontal: Spacing.xs,
    },
    container: {
        backgroundColor: Colors.light.surface,
        padding: Spacing.sm,
        paddingBottom: Spacing.md,
        borderRadius: BorderRadius.xs,
        borderWidth: 1,
        borderColor: Colors.light.border,
        // Polaroid shadow effect
        shadowColor: '#2C1810',
        shadowOffset: { width: 1, height: 2 },
        shadowRadius: 8,
        elevation: 4,
    },
    polaroidFrame: {
        marginBottom: Spacing.sm,
    },
    imageWrapper: {
        position: 'relative',
        aspectRatio: 1,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        borderRadius: BorderRadius.xs,
    },
    carousel: {
        flex: 1,
    },
    imageCount: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    imageCountText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 12,
        color: Colors.light.surface,
    },

    polaroidCaption: {
        alignItems: 'center',
        paddingTop: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    locationTitle: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 28,
        lineHeight: 32,
        textAlign: 'center',
    },
    dateText: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 20,
        marginTop: 2,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(232, 220, 200, 0.5)',
        marginTop: Spacing.xs,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    userTextContainer: {
        flex: 1,
    },
    username: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 12,
        marginBottom: 2,
    },
    postContent: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        lineHeight: 18,
    },
    moreButton: {
        padding: Spacing.xs,
    },
    menu: {
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.xs,
        marginHorizontal: Spacing.md,
        padding: Spacing.xs,
        borderWidth: 1,
        ...Shadows.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    menuText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingTop: Spacing.sm,
        marginTop: Spacing.xs,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    actionText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 13,
    },
});
