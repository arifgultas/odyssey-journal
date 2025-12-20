import { ReportModal } from '@/components/report-modal';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { bookmarkPost, checkIfBookmarked, checkIfLiked, likePost, unbookmarkPost, unlikePost } from '@/lib/interactions';
import { deletePost, fetchPostById, Post } from '@/lib/posts';
import { generatePostShareUrl, getPostShareMessage, sharePost } from '@/lib/share';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function PostDetailScreen() {
    const insets = useSafeAreaInsets();
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
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePost(post.id);
                            Alert.alert('Success', 'Post deleted successfully');
                            router.back();
                        } catch (error) {
                            console.error('Error deleting post:', error);
                            Alert.alert('Error', 'Failed to delete post');
                        }
                    },
                },
            ]
        );
        setShowMenu(false);
    };


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.accent} />
                </View>
            </ThemedView>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Images Gallery */}
                {post.images && post.images.length > 0 && (
                    <View style={styles.imagesSection}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                        >
                            {post.images.map((imageUrl, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: imageUrl }}
                                    style={styles.fullImage}
                                    contentFit="cover"
                                />
                            ))}
                        </ScrollView>

                        {/* Image Pagination Dots */}
                        {post.images.length > 1 && (
                            <View style={styles.paginationDots}>
                                {post.images.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            currentImageIndex === index && styles.activeDot,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Author Info */}
                <View style={styles.authorSection}>
                    <View style={styles.authorInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={24} color={Colors.light.textMuted} />
                        </View>
                        <View style={styles.authorDetails}>
                            <Text style={styles.authorName}>Travel Enthusiast</Text>
                            <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.followButton}>
                        <Text style={styles.followButtonText}>Follow</Text>
                    </TouchableOpacity>
                </View>

                {/* Post Content */}
                <View style={styles.contentSection}>
                    <Text style={styles.title}>{post.title}</Text>
                    <Text style={styles.content}>{post.content}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleLike}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={28}
                                color={isLiked ? Colors.light.error : Colors.light.text}
                            />
                            <Text style={[
                                styles.actionCount,
                                isLiked && { color: Colors.light.error }
                            ]}>
                                {likesCount}
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push({
                                pathname: '/comments/[postId]',
                                params: { postId: post.id }
                            })}
                        >
                            <Ionicons name="chatbubble-outline" size={26} color={Colors.light.text} />
                            <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleShare}
                        >
                            <Ionicons name="share-outline" size={26} color={Colors.light.text} />
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setShowMenu(!showMenu)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={26} color={Colors.light.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleBookmark}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                                size={26}
                                color={isBookmarked ? Colors.light.accent : Colors.light.text}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Menu */}
                    {showMenu && (
                        <View style={styles.menu}>
                            {isOwnPost ? (
                                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                                    <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                                    <Text style={[styles.menuText, { color: Colors.light.error }]}>
                                        Delete Post
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                                    <Ionicons name="flag-outline" size={20} color={Colors.light.error} />
                                    <Text style={[styles.menuText, { color: Colors.light.error }]}>
                                        Report Post
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Report Modal */}
                <ReportModal
                    visible={showReportModal}
                    postId={post.id}
                    onClose={() => setShowReportModal(false)}
                    onReported={() => {
                        // Optional: Add any post-report actions
                    }}
                />

                {/* Comments Section Placeholder */}
                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>Comments</Text>
                    <View style={styles.emptyComments}>
                        <Ionicons name="chatbubbles-outline" size={48} color={Colors.light.textMuted} />
                        <Text style={styles.emptyCommentsText}>No comments yet</Text>
                        <Text style={styles.emptyCommentsSubtext}>Be the first to comment!</Text>
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    backButton: {
        padding: Spacing.xs,
    },
    moreButton: {
        padding: Spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagesSection: {
        position: 'relative',
    },
    fullImage: {
        width: width,
        height: 400,
    },
    paginationDots: {
        position: 'absolute',
        bottom: Spacing.md,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeDot: {
        backgroundColor: Colors.light.surface,
        width: 24,
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorDetails: {
        gap: 4,
    },
    authorName: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
    },
    postDate: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.textMuted,
    },
    followButton: {
        backgroundColor: Colors.light.accent,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
    },
    followButtonText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        color: Colors.light.surface,
    },
    contentSection: {
        padding: Spacing.md,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 28,
        color: Colors.light.text,
        marginBottom: Spacing.md,
        lineHeight: 36,
    },
    content: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
        lineHeight: 26,
    },
    actionsSection: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    actionCount: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
    },
    commentsSection: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    sectionTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 18,
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    emptyComments: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyCommentsText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.textMuted,
        marginTop: Spacing.md,
    },
    emptyCommentsSubtext: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textMuted,
        marginTop: Spacing.xs,
    },
    menu: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
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
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
    },
    menuText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 15,
    },
});
