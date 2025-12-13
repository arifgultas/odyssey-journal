import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookmarkRibbon } from './bookmark-ribbon';
import { ImageCarousel } from './image-carousel';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - Spacing.md * 2;

interface PostCardProps {
    post: Post;
    onPress?: () => void;
    onLike?: (postId: string, isLiked: boolean) => void;
    onBookmark?: (postId: string, isBookmarked: boolean) => void;
    onComment?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onReport?: () => void;
    isOwnPost?: boolean;
}

export function PostCard({ post, onPress, onLike, onBookmark, onComment, onShare, onDelete, onReport, isOwnPost = false }: PostCardProps) {
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [showMenu, setShowMenu] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const handleLike = () => {
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        // Call parent handler
        onLike?.(post.id, newIsLiked);
    };

    const handleBookmark = () => {
        // Optimistic update
        const newIsBookmarked = !isBookmarked;
        setIsBookmarked(newIsBookmarked);

        // Call parent handler
        onBookmark?.(post.id, newIsBookmarked);
    };

    const handleUserPress = (e: any) => {
        e.stopPropagation();
        if (post.profiles?.id) {
            router.push(`/user-profile/${post.profiles.id}`);
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.95}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={handleUserPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatar}>
                        {post.profiles?.avatar_url ? (
                            <Image
                                source={{ uri: post.profiles.avatar_url }}
                                style={styles.avatarImage}
                                contentFit="cover"
                            />
                        ) : (
                            <Ionicons name="person" size={20} color={Colors.light.textMuted} />
                        )}
                    </View>
                    <View>
                        <Text style={styles.username}>
                            {post.profiles?.full_name || post.profiles?.username || 'User'}
                        </Text>
                        <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                >
                    <Ionicons name="ellipsis-horizontal" size={20} color={Colors.light.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Menu */}
            {showMenu && (
                <View style={styles.menu}>
                    {isOwnPost ? (
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onDelete?.();
                            }}
                        >
                            <Ionicons name="trash-outline" size={18} color={Colors.light.error} />
                            <Text style={[styles.menuText, { color: Colors.light.error }]}>
                                Delete Post
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onReport?.();
                            }}
                        >
                            <Ionicons name="flag-outline" size={18} color={Colors.light.error} />
                            <Text style={[styles.menuText, { color: Colors.light.error }]}>
                                Report Post
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Images - Polaroid Style with Carousel */}
            {post.images && post.images.length > 0 && (
                <View style={styles.polaroidContainer}>
                    <View style={styles.polaroidFrame}>
                        <ImageCarousel images={post.images} />
                        {post.images.length > 1 && (
                            <View style={styles.imageCount}>
                                <Ionicons name="images" size={14} color={Colors.light.surface} />
                                <Text style={styles.imageCountText}>+{post.images.length - 1}</Text>
                            </View>
                        )}
                    </View>
                    {/* Polaroid Caption */}
                    <View style={styles.polaroidCaption}>
                        <Text style={styles.captionTitle} numberOfLines={1}>{post.title}</Text>
                        <Text style={styles.captionContent} numberOfLines={2}>
                            {post.content}
                        </Text>
                    </View>
                </View>
            )}

            {/* Location */}
            {post.location && (
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={14} color={Colors.light.accent} />
                    <Text style={styles.locationText}>
                        {post.location.city || post.location.country || 'Unknown location'}
                    </Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={22}
                        color={isLiked ? Colors.light.error : Colors.light.text}
                    />
                    <Text style={[
                        styles.actionText,
                        isLiked && { color: Colors.light.error }
                    ]}>
                        {likesCount}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onComment}
                >
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.light.text} />
                    <Text style={styles.actionText}>{post.comments_count || 0}</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                    <Ionicons name="share-outline" size={20} color={Colors.light.text} />
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <BookmarkRibbon
                    isBookmarked={isBookmarked}
                    onToggle={handleBookmark}
                    size={22}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        marginBottom: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    username: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        color: Colors.light.text,
    },
    timestamp: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.textMuted,
    },
    moreButton: {
        padding: Spacing.xs,
    },
    // Polaroid Container
    polaroidContainer: {
        backgroundColor: Colors.light.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.md,
        ...Shadows.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    polaroidFrame: {
        position: 'relative',
        backgroundColor: Colors.light.surface,
        padding: 8,
        borderRadius: BorderRadius.sm,
    },
    polaroidImage: {
        width: '100%',
        height: 280,
        borderRadius: BorderRadius.xs,
    },
    polaroidCaption: {
        paddingTop: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    captionTitle: {
        fontFamily: Typography.fonts.accent,
        fontSize: 18,
        color: Colors.light.text,
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    captionContent: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 13,
        color: Colors.light.textSecondary,
        lineHeight: 20,
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
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 12,
        color: Colors.light.surface,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: Spacing.md,
    },
    locationText: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.compass,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.text,
    },
    menu: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.xs,
        marginHorizontal: Spacing.md,
        padding: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
});
