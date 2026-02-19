import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Comment } from '@/lib/comments';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CommentItemProps {
    comment: Comment;
    onDelete?: (commentId: string) => void;
    isOwner?: boolean;
}

export function CommentItem({ comment, onDelete, isOwner = false }: CommentItemProps) {
    const [showActions, setShowActions] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete?.(comment.id),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: theme.background }]}>
                    {comment.avatar_url ? (
                        <Image
                            source={{ uri: comment.avatar_url }}
                            style={styles.avatarImage}
                            contentFit="cover"
                        />
                    ) : (
                        <Ionicons name="person" size={16} color={theme.textMuted} />
                    )}
                </View>

                {/* Comment Content */}
                <View style={styles.commentContent}>
                    <View style={styles.header}>
                        <Text style={[styles.username, { color: theme.text }]}>
                            {comment.full_name || comment.username || 'Unknown User'}
                        </Text>
                        <Text style={[styles.timestamp, { color: theme.textMuted }]}>{formatDate(comment.created_at)}</Text>
                    </View>
                    <Text style={[styles.text, { color: theme.text }]}>{comment.content}</Text>
                </View>

                {/* Actions */}
                {isOwner && (
                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => setShowActions(!showActions)}
                    >
                        <Ionicons name="ellipsis-horizontal" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Action Menu */}
            {showActions && isOwner && (
                <View style={[styles.actionsMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={16} color={theme.error} />
                        <Text style={[styles.deleteText, { color: theme.error }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.sm,
    },
    content: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    commentContent: {
        flex: 1,
        gap: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    username: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
    },
    timestamp: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
    },
    text: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        lineHeight: 20,
    },
    moreButton: {
        padding: Spacing.xs,
    },
    actionsMenu: {
        marginLeft: 40,
        marginTop: Spacing.xs,
        borderRadius: BorderRadius.sm,
        padding: Spacing.xs,
        borderWidth: 1,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        padding: Spacing.sm,
    },
    deleteText: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
    },
});
