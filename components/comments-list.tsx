import { CommentItem } from '@/components/comment-item';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { Comment } from '@/lib/comments';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

interface CommentsListProps {
    comments: Comment[];
    currentUserId?: string;
    onDelete?: (commentId: string) => void;
    onLoadMore?: () => void;
    onRefresh?: () => void;
    loading?: boolean;
    refreshing?: boolean;
    hasMore?: boolean;
}

export function CommentsList({
    comments,
    currentUserId,
    onDelete,
    onLoadMore,
    onRefresh,
    loading = false,
    refreshing = false,
    hasMore = false,
}: CommentsListProps) {
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={Colors.light.textMuted} />
                <ThemedText style={styles.emptyText}>No comments yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>Be the first to comment!</ThemedText>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loading || comments.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.light.accent} />
            </View>
        );
    };

    return (
        <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <CommentItem
                    comment={item}
                    onDelete={onDelete}
                    isOwner={currentUserId === item.user_id}
                />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.light.accent}
                    />
                ) : undefined
            }
            onEndReached={hasMore ? onLoadMore : undefined}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            style={styles.list}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        padding: Spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.textMuted,
        marginTop: Spacing.sm,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.light.textMuted,
    },
    footerLoader: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
});
