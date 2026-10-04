import { CommentInput } from '@/components/comment-input';
import { CommentsList } from '@/components/comments-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAiConsent } from '@/context/ai-consent-context';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReportModal } from '@/components/report-modal';
import { useConfirmBlockUser } from '@/hooks/use-block-user';
import { useCurrentProfile } from '@/hooks/use-profile';
import { postErrorMessage } from '@/lib/auth-errors';
import { addComment, Comment, deleteComment, getComments } from '@/lib/comments';
import type { ReportTarget } from '@/lib/reports';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { safeGoBack } from '@/lib/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mirrorIcon } from '@/lib/rtl';

export default function CommentsScreen() {
    const { ensureConsent } = useAiConsent();
    // Guards the await before isSubmitting disables the input (see create-post.tsx)
    const submitLock = useRef(false);
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
    const [postOwnerId, setPostOwnerId] = useState<string | undefined>(undefined);
    const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
    const { data: myProfile } = useCurrentProfile();
    const confirmBlockUser = useConfirmBlockUser();

    useEffect(() => {
        loadCurrentUser();
        loadComments(0);
        loadPostOwner();
    }, [postId]);

    // The post's owner may remove any comment on it (033)
    const loadPostOwner = async () => {
        if (!postId) return;
        const { data } = await supabase.from('posts').select('user_id').eq('id', postId).maybeSingle();
        setPostOwnerId(data?.user_id ?? undefined);
    };

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

    const handleSubmitComment = async (content: string): Promise<boolean> => {
        if (!postId || submitLock.current) return false;
        submitLock.current = true;
        // Posts and comments go to OpenAI moderation; ask first (App Store 5.1.2(i))
        if (!(await ensureConsent())) {
            submitLock.current = false;
            return false;
        }

        setIsSubmitting(true);
        try {
            const newComment = await addComment({
                post_id: postId,
                content,
            });

            // Add user info to the new comment
            const commentWithUser = {
                ...newComment,
                username: myProfile?.username ?? null,
                full_name: myProfile?.full_name ?? null,
                avatar_url: myProfile?.avatar_url ?? null,
            };

            // Add to the beginning of the list
            // Functional: the list may have been refreshed while the consent dialog was open
            setComments((current) => [commentWithUser, ...current]);
            return true;
        } catch (error) {
            console.error('Error adding comment:', error);
            // A moderation rejection or the hourly limit says why; anything else stays generic
            Alert.alert(t('common.error'), postErrorMessage(error, 'comments.addError'));
            return false;
        } finally {
            setIsSubmitting(false);
            submitLock.current = false;
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert(t('common.error'), t('comments.deleteError'));
        }
    };

    if (isLoading && comments.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => safeGoBack('/(tabs)')} style={styles.backButton}>
                        <Ionicons name={mirrorIcon('arrow-back')} size={24} color={theme.text} />
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
                    <TouchableOpacity onPress={() => safeGoBack('/(tabs)')} style={styles.backButton}>
                        <Ionicons name={mirrorIcon('arrow-back')} size={24} color={theme.text} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>
                        {t('comments.title')}
                    </ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <CommentsList
                    comments={comments}
                    currentUserId={currentUserId || undefined}
                    postOwnerId={postOwnerId}
                    onDelete={handleDeleteComment}
                    onReport={(comment) => setReportTarget({ type: 'comment', id: comment.id })}
                    onBlock={(userId) =>
                        confirmBlockUser(userId, () => setComments(prev => prev.filter(c => c.user_id !== userId)))
                    }
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

                <ReportModal
                    visible={!!reportTarget}
                    target={reportTarget}
                    onClose={() => setReportTarget(null)}
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
