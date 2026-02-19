import { CommentInput } from '@/components/comment-input';
import { CommentsList } from '@/components/comments-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addComment, Comment, deleteComment, getComments } from '@/lib/comments';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommentsScreen() {
    const { postId } = useLocalSearchParams<{ postId: string }>();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadCurrentUser();
        loadComments(0);
    }, [postId]);

    const loadCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
    };

    const loadComments = async (pageNum: number = 0, refresh: boolean = false) => {
        if (!postId) return;

        try {
            if (refresh) {
                setIsRefreshing(true);
            } else if (pageNum === 0) {
                setIsLoading(true);
            }

            const data = await getComments(postId, pageNum, 20);

            if (refresh || pageNum === 0) {
                setComments(data);
            } else {
                setComments([...comments, ...data]);
            }

            setHasMore(data.length === 20);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading comments:', error);
            Alert.alert(t('common.error'), t('comments.loadError'));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadComments(0, true);
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            loadComments(page + 1);
        }
    };

    const handleSubmitComment = async (content: string) => {
        if (!postId) return;

        setIsSubmitting(true);
        try {
            const newComment = await addComment({
                post_id: postId,
                content,
            });

            // Add user info to the new comment
            const commentWithUser = {
                ...newComment,
                username: currentUserId ? 'You' : null,
                full_name: 'You',
                avatar_url: null,
            };

            // Add to the beginning of the list
            setComments([commentWithUser, ...comments]);
        } catch (error) {
            console.error('Error adding comment:', error);
            Alert.alert(t('common.error'), t('comments.addError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert(t('common.error'), t('comments.deleteError'));
        }
    };

    if (isLoading && comments.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>
                        {t('comments.title')}
                    </ThemedText>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            </ThemedView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <ThemedView style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>
                        {t('comments.title')}
                    </ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <CommentsList
                    comments={comments}
                    currentUserId={currentUserId || undefined}
                    onDelete={handleDeleteComment}
                    onLoadMore={handleLoadMore}
                    onRefresh={handleRefresh}
                    loading={isLoading}
                    refreshing={isRefreshing}
                    hasMore={hasMore}
                />

                <CommentInput
                    onSubmit={handleSubmitComment}
                    loading={isSubmitting}
                />
            </ThemedView>
        </KeyboardAvoidingView>
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
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Typography.fonts.heading,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
