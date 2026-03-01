import { Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import {
    adminDeletePost,
    banUser,
    getAdminStats,
    getReports,
    isAdmin,
    updateReportStatus,
    type AdminStats,
    type ReportWithDetails
} from '@/lib/admin-service';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminColors = {
    light: {
        background: '#F5F1E8',
        cardBg: 'rgba(255, 255, 255, 0.85)',
        textPrimary: '#2C1810',
        textSecondary: 'rgba(44, 24, 16, 0.6)',
        accent: '#D4A574',
        border: 'rgba(212, 165, 116, 0.2)',
        sectionBg: 'rgba(212, 165, 116, 0.05)',
        pending: '#F59E0B',
        resolved: '#10B981',
        dismissed: '#6B7280',
        danger: '#EF4444',
        dangerBg: 'rgba(239, 68, 68, 0.1)',
    },
    dark: {
        background: '#2C1810',
        cardBg: 'rgba(255, 255, 255, 0.06)',
        textPrimary: '#F5F1E8',
        textSecondary: 'rgba(245, 241, 232, 0.6)',
        accent: '#D4A574',
        border: 'rgba(212, 165, 116, 0.2)',
        sectionBg: 'rgba(255, 255, 255, 0.03)',
        pending: '#F59E0B',
        resolved: '#10B981',
        dismissed: '#6B7280',
        danger: '#EF4444',
        dangerBg: 'rgba(239, 68, 68, 0.15)',
    },
};

type StatusFilter = 'pending' | 'resolved' | 'dismissed' | undefined;

export default function AdminScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? AdminColors.dark : AdminColors.light;
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useLanguage();

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [reports, setReports] = useState<ReportWithDetails[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Check admin status on mount
    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const admin = await isAdmin();
        setAuthorized(admin);
        if (admin) {
            loadData();
        }
    };

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [reportsData, statsData] = await Promise.all([
                getReports(filter),
                getAdminStats(),
            ]);
            setReports(reportsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (authorized) {
            loadData();
        }
    }, [filter, authorized, loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleDeletePost = (report: ReportWithDetails) => {
        Alert.alert(
            'Delete Post',
            'This will permanently delete this post. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminDeletePost(report.post_id);
                            await updateReportStatus(report.id, 'resolved');
                            await loadData();
                            Alert.alert('Done', 'Post deleted and report resolved.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete post.');
                        }
                    },
                },
            ]
        );
    };

    const handleBanUser = (report: ReportWithDetails) => {
        const userId = report.post?.user_id;
        if (!userId) return;
        const username = report.post?.profiles?.username || report.post?.profiles?.full_name || 'User';

        Alert.alert(
            'Ban User',
            `Ban ${username}? They will not be able to create posts or comments.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Ban',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await banUser(userId);
                            await updateReportStatus(report.id, 'resolved');
                            await loadData();
                            Alert.alert('Done', `${username} has been banned.`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to ban user.');
                        }
                    },
                },
            ]
        );
    };

    const handleDismiss = async (report: ReportWithDetails) => {
        try {
            await updateReportStatus(report.id, 'dismissed');
            await loadData();
        } catch (error) {
            Alert.alert('Error', 'Failed to dismiss report.');
        }
    };

    // Unauthorized view
    if (authorized === false) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <View style={styles.unauthorizedContainer}>
                    <Ionicons name="shield-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.unauthorizedText, { color: colors.textPrimary }]}>
                        Access Denied
                    </Text>
                    <Text style={[styles.unauthorizedSubtext, { color: colors.textSecondary }]}>
                        You don't have admin privileges.
                    </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.goBackText, { color: colors.accent }]}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Loading auth check
    if (authorized === null) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return colors.pending;
            case 'resolved': return colors.resolved;
            case 'dismissed': return colors.dismissed;
            default: return colors.textSecondary;
        }
    };

    const getReasonLabel = (reason: string): string => {
        const labels: Record<string, string> = {
            spam: '🚫 Spam',
            harassment: '😡 Harassment',
            inappropriate: '⚠️ Inappropriate',
            violence: '🔴 Violence',
            misinformation: '❌ Misinformation',
            other: '📝 Other',
        };
        return labels[reason] || reason;
    };

    const renderReportCard = ({ item, index }: { item: ReportWithDetails; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 80).duration(300)}
            style={[styles.reportCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        >
            {/* Report Header */}
            <View style={[styles.reportHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.reportHeaderLeft}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={[styles.reasonText, { color: colors.textPrimary }]}>
                        {getReasonLabel(item.reason)}
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>

            {/* Reported Post Preview */}
            {item.post && (
                <View style={[styles.postPreview, { backgroundColor: colors.sectionBg }]}>
                    <View style={styles.postAuthor}>
                        <Ionicons name="person-circle" size={20} color={colors.accent} />
                        <Text style={[styles.postAuthorName, { color: colors.textPrimary }]}>
                            {item.post.profiles?.username || item.post.profiles?.full_name || 'Unknown'}
                        </Text>
                    </View>
                    <Text style={[styles.postTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.post.title}
                    </Text>
                    <Text style={[styles.postContent, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.post.content}
                    </Text>
                    {item.post.images && item.post.images.length > 0 && (
                        <View style={styles.postImages}>
                            {item.post.images.slice(0, 3).map((img, i) => (
                                <Image
                                    key={i}
                                    source={{ uri: img }}
                                    style={styles.postImageThumb}
                                    contentFit="cover"
                                />
                            ))}
                            {item.post.images.length > 3 && (
                                <View style={[styles.moreImages, { backgroundColor: colors.accent }]}>
                                    <Text style={styles.moreImagesText}>+{item.post.images.length - 3}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}

            {/* Report Description */}
            {item.description && (
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>
                        Reporter's note:
                    </Text>
                    <Text style={[styles.descriptionText, { color: colors.textPrimary }]} numberOfLines={3}>
                        {item.description}
                    </Text>
                </View>
            )}

            {/* Reporter Info */}
            <View style={[styles.reporterRow, { borderTopColor: colors.border }]}>
                <View style={styles.reporterInfo}>
                    <Ionicons name="flag" size={14} color={colors.textSecondary} />
                    <Text style={[styles.reporterText, { color: colors.textSecondary }]}>
                        Reported by: {item.reporter?.username || item.reporter?.full_name || 'Anonymous'}
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            {item.status === 'pending' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.dismissButton, { borderColor: colors.dismissed }]}
                        onPress={() => handleDismiss(item)}
                    >
                        <Ionicons name="close-circle-outline" size={16} color={colors.dismissed} />
                        <Text style={[styles.actionButtonText, { color: colors.dismissed }]}>Dismiss</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton, { borderColor: colors.danger }]}
                        onPress={() => handleDeletePost(item)}
                    >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                        <Text style={[styles.actionButtonText, { color: colors.danger }]}>Delete Post</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.banButton, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}
                        onPress={() => handleBanUser(item)}
                    >
                        <Ionicons name="ban-outline" size={16} color={colors.danger} />
                        <Text style={[styles.actionButtonText, { color: colors.danger }]}>Ban User</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(300)}
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        backgroundColor: isDark ? 'rgba(44, 24, 16, 0.95)' : 'rgba(245, 241, 232, 0.95)',
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={isDark ? colors.accent : colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
                    <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
                        ADMIN PANEL
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </Animated.View>

            {/* Stats Bar */}
            {stats && (
                <Animated.View
                    entering={FadeInDown.delay(100).duration(300)}
                    style={[styles.statsBar, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}
                >
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.pending }]}>{stats.pendingReports}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.totalReports}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.danger }]}>{stats.bannedUsers}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Banned</Text>
                    </View>
                </Animated.View>
            )}

            {/* Filter Tabs */}
            <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
                {([undefined, 'pending', 'resolved', 'dismissed'] as StatusFilter[]).map((f) => (
                    <TouchableOpacity
                        key={f ?? 'all'}
                        style={[
                            styles.filterTab,
                            filter === f && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                { color: filter === f ? colors.accent : colors.textSecondary },
                            ]}
                        >
                            {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Reports List */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderReportCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-circle-outline" size={48} color={colors.accent} />
                            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                                No reports found
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                {filter === 'pending' ? 'All caught up! No pending reports.' : 'No reports match this filter.'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        letterSpacing: 3,
        fontFamily: Typography.fonts.heading,
    },
    headerSpacer: {
        width: 40,
    },

    // Stats
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    statItem: {
        alignItems: 'center',
        gap: 2,
    },
    statNumber: {
        fontSize: 24,
        fontFamily: Typography.fonts.heading,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: 32,
    },

    // Filter
    filterBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    filterTab: {
        flex: 1,
        paddingVertical: Spacing.sm + 4,
        alignItems: 'center',
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Report Card
    listContent: {
        padding: Spacing.md,
        gap: Spacing.md,
    },
    reportCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    reportHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    reasonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
    },

    // Post Preview
    postPreview: {
        margin: Spacing.sm,
        padding: Spacing.sm,
        borderRadius: 12,
        gap: 6,
    },
    postAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    postAuthorName: {
        fontSize: 13,
        fontWeight: '600',
    },
    postTitle: {
        fontSize: 15,
        fontFamily: Typography.fonts.heading,
    },
    postContent: {
        fontSize: 13,
        lineHeight: 18,
    },
    postImages: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
    },
    postImageThumb: {
        width: 56,
        height: 56,
        borderRadius: 8,
    },
    moreImages: {
        width: 56,
        height: 56,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreImagesText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    // Description
    descriptionContainer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: 4,
    },
    descriptionLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
    },

    // Reporter
    reporterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
    },
    reporterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reporterText: {
        fontSize: 12,
    },

    // Actions
    actionButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
        paddingTop: Spacing.xs,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: Spacing.sm,
        borderRadius: 10,
        borderWidth: 1,
    },
    actionButtonText: {
        fontSize: 11,
        fontWeight: '700',
    },
    dismissButton: {},
    deleteButton: {},
    banButton: {},

    // Unauthorized
    unauthorizedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    unauthorizedText: {
        fontSize: 24,
        fontFamily: Typography.fonts.heading,
    },
    unauthorizedSubtext: {
        fontSize: 14,
    },
    goBackText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: Spacing.md,
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: Typography.fonts.heading,
    },
    emptySubtext: {
        fontSize: 14,
    },
});
