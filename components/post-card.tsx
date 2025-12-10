import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.95}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color={Colors.light.textMuted} />
                    </View>
                    <View>
                        <Text style={styles.username}>User</Text>
                        <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
                    </View>
                </View>
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

            {/* Title */}
            <Text style={styles.title}>{post.title}</Text>

            {/* Content Preview */}
            <Text style={styles.content} numberOfLines={3}>
                {post.content}
            </Text>

            {/* Images */}
            {post.images && post.images.length > 0 && (
                <View style={styles.imagesContainer}>
                    <Image
                        source={{ uri: post.images[0] }}
                        style={styles.mainImage}
                        contentFit="cover"
                    />
                    {post.images.length > 1 && (
                        <View style={styles.imageCount}>
                            <Ionicons name="images" size={16} color={Colors.light.surface} />
                            <Text style={styles.imageCountText}>+{post.images.length - 1}</Text>
                        </View>
                    )}
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

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleBookmark}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={20}
                        color={isBookmarked ? Colors.light.accent : Colors.light.text}
                    />
                </TouchableOpacity>
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
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        color: Colors.light.text,
        marginBottom: Spacing.sm,
    },
    content: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textSecondary,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    imagesContainer: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    mainImage: {
        width: IMAGE_WIDTH - Spacing.md * 2,
        height: 250,
        borderRadius: BorderRadius.md,
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
        color: Colors.light.textSecondary,
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
