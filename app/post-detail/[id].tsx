import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { fetchPostById, Post } from '@/lib/posts';
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

const { width, height } = Dimensions.get('window');

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            const postData = await fetchPostById(id);
            setPost(postData);
        } catch (error) {
            console.error('Error loading post:', error);
            Alert.alert('Error', 'Failed to load post details');
            router.back();
        } finally {
            setIsLoading(false);
        }
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
                <View style={styles.header}>
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
            <View style={styles.header}>
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

                {/* Location Map */}
                {post.location && (
                    <View style={styles.locationSection}>
                        <View style={styles.locationHeader}>
                            <Ionicons name="location" size={20} color={Colors.light.accent} />
                            <Text style={styles.locationTitle}>Location</Text>
                        </View>
                        <Text style={styles.locationAddress}>
                            {post.location.address || post.location.city || post.location.country || 'Unknown location'}
                        </Text>

                        <View style={styles.mapContainer}>
                            {/* MapView requires development build - showing placeholder */}
                            <View style={styles.mapPlaceholder}>
                                <Ionicons name="map-outline" size={48} color={Colors.light.textMuted} />
                                <Text style={styles.mapPlaceholderTitle}>Map View</Text>
                                <Text style={styles.mapPlaceholderText}>
                                    Lat: {post.location.latitude.toFixed(6)}
                                </Text>
                                <Text style={styles.mapPlaceholderText}>
                                    Lng: {post.location.longitude.toFixed(6)}
                                </Text>
                                <Text style={styles.mapPlaceholderNote}>
                                    📱 Maps require development build
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="heart-outline" size={28} color={Colors.light.text} />
                            <Text style={styles.actionCount}>{post.likes_count || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="chatbubble-outline" size={26} color={Colors.light.text} />
                            <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="share-outline" size={26} color={Colors.light.text} />
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="bookmark-outline" size={26} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>
                </View>

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
        paddingVertical: Spacing.md,
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
    locationSection: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    locationTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
    },
    locationAddress: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.md,
    },
    mapContainer: {
        position: 'relative',
        height: 200,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    mapPlaceholderTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
        marginTop: Spacing.sm,
    },
    mapPlaceholderText: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    mapPlaceholderNote: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.textMuted,
        marginTop: Spacing.sm,
        fontStyle: 'italic',
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
});
