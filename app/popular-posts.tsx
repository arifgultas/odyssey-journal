import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAllTrendingPosts } from '@/hooks/use-search';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PopularPostsScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { t } = useLanguage();
    const theme = Colors[colorScheme ?? 'light'];

    const { data: posts, isLoading, error } = useAllTrendingPosts(0, 50);

    const handlePostPress = (postId: string) => {
        router.push(`/post-detail/${postId}`);
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    const renderPost = ({ item, index }: { item: any; index: number }) => {
        const hasImage = item.images && item.images.length > 0 && item.images[0];

        return (
            <TouchableOpacity
                style={[styles.postCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handlePostPress(item.id)}
                activeOpacity={0.8}
            >
                {/* Rank Badge */}
                <View style={[styles.rankBadge, { backgroundColor: index < 3 ? '#DAA520' : theme.border }]}>
                    <Text style={[styles.rankText, { color: index < 3 ? '#fff' : theme.textSecondary }]}>
                        #{index + 1}
                    </Text>
                </View>

                {/* Image or Placeholder */}
                <View style={[styles.postImageContainer, { backgroundColor: hasImage ? 'transparent' : theme.border }]}>
                    {hasImage ? (
                        <Image
                            source={{ uri: item.images[0] }}
                            style={styles.postImage}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="document-text-outline" size={32} color={theme.textMuted} />
                        </View>
                    )}
                </View>

                <View style={styles.postContent}>
                    <Text style={[styles.postTitle, { color: theme.text }]} numberOfLines={2}>
                        {item.title || t('popularPosts.untitledPost')}
                    </Text>
                    <Text style={[styles.postDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.content}
                    </Text>
                    <View style={styles.postMeta}>
                        <View style={styles.postAuthor}>
                            {item.profiles?.avatar_url ? (
                                <Image
                                    source={{ uri: item.profiles.avatar_url }}
                                    style={styles.authorAvatar}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={[styles.authorAvatarPlaceholder, { backgroundColor: theme.border }]}>
                                    <Ionicons name="person" size={12} color={theme.textSecondary} />
                                </View>
                            )}
                            <Text style={[styles.authorName, { color: theme.textSecondary }]}>
                                {item.profiles?.full_name?.split(' ')[0] || item.profiles?.username || t('popularPosts.user')}
                            </Text>
                        </View>
                        <View style={styles.postStats}>
                            <View style={styles.statItem}>
                                <Ionicons name="heart" size={14} color="#e74c3c" />
                                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                                    {formatNumber(item.likes_count || 0)}
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="chatbubble" size={14} color={theme.textSecondary} />
                                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                                    {formatNumber(item.comments_count || 0)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={64} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {t('popularPosts.empty')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {t('popularPosts.emptyDesc')}
            </Text>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.background }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Ionicons name="trending-up" size={20} color="#DAA520" style={{ marginRight: 8 }} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {t('popularPosts.title')}
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
                    <Text style={[styles.errorText, { color: theme.text }]}>
                        {t('popularPosts.error')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                />
            )}
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
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
    },
    headerSpacer: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorText: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        marginTop: Spacing.md,
    },
    listContent: {
        padding: Spacing.md,
    },
    postCard: {
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        position: 'relative',
    },
    rankBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    rankText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 12,
    },
    postImageContainer: {
        width: 100,
        height: 100,
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postContent: {
        flex: 1,
        padding: Spacing.sm,
        justifyContent: 'space-between',
    },
    postTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 14,
        marginBottom: 4,
    },
    postDescription: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 8,
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    postAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 6,
    },
    authorAvatarPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: {
        fontFamily: Typography.fonts.body,
        fontSize: 11,
    },
    postStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    statText: {
        fontFamily: Typography.fonts.body,
        fontSize: 11,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
});
