import { ThemedView } from '@/components/themed-view';
import { Colors, Shadows, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    Notification,
    subscribeToNotifications,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Letter Theme Colors
const LetterColors = {
    light: {
        background: '#F5F1E8',
        paper: '#FFFCF5',
        paperOld: '#F2EFE5',
        border: '#E8DCC8',
        ink: '#2b2222',
        inkMuted: '#5c4d3c',
        gold: '#D4A574',
        waxRed: '#8B0000',
        stampBrown: '#5D4037',
        stampBorder: '#8D6E63',
    },
    dark: {
        background: '#2C1810',
        paper: '#3E2723',
        paperOld: '#2e1d19',
        border: '#5D4037',
        ink: '#F5F1E8',
        inkMuted: '#b9ab9d',
        gold: '#D4A574',
        waxRed: '#9B2C2C',
        stampBrown: '#D4A574',
        stampBorder: '#8D6E63',
    }
};

// Static demo notifications for when API is empty
const STATIC_NOTIFICATIONS = {
    today: [
        {
            id: 'demo1',
            type: 'like' as const,
            actor_full_name: 'Ahmet',
            post_title: 'Kapadokya',
            read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
            id: 'demo2',
            type: 'comment' as const,
            actor_full_name: 'Elif',
            post_title: 'fotoğrafına',
            read: false,
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            comment_preview: '"Harika manzara! Kesinlikle gitmeliyim."',
        },
    ],
    thisWeek: [
        {
            id: 'demo3',
            type: 'follow' as const,
            actor_full_name: 'Canan',
            read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        },
        {
            id: 'demo4',
            type: 'location' as const,
            location_name: 'Galata Kulesi',
            read: true,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
    ],
    older: [
        {
            id: 'demo5',
            type: 'like' as const,
            actor_full_name: 'Mehmet',
            post_title: 'Paris Rehberi',
            read: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
        },
        {
            id: 'demo6',
            type: 'comment' as const,
            actor_full_name: 'Zeynep',
            post_title: 'yorumuna',
            read: true,
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Last week
        },
    ],
};

export default function NotificationsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const letterTheme = LetterColors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { t, language } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadNotifications(0, true);
            loadUnreadCount();
        }, [])
    );

    const loadCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
            const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
            return unsubscribe;
        }
    };

    const loadNotifications = async (pageNum: number = 0, refresh: boolean = false) => {
        try {
            if (refresh) {
                setIsRefreshing(true);
            } else if (pageNum === 0) {
                setIsLoading(true);
            }

            const data = await getNotifications(pageNum, 20);

            if (refresh || pageNum === 0) {
                setNotifications(data);
            } else {
                setNotifications([...notifications, ...data]);
            }

            setHasMore(data.length === 20);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading notifications:', error);
            Alert.alert(t('common.error'), t('notifications.loadError'));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleRefresh = () => {
        loadNotifications(0, true);
        loadUnreadCount();
    };

    const handleNotificationPress = async (notification: any) => {
        if (!notification.read && notification.id && !notification.id.startsWith('demo')) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        if (notification.type === 'follow') {
            console.log('Navigate to user profile:', notification.actor_id);
        } else if (notification.post_id) {
            router.push({
                pathname: '/post-detail/[id]',
                params: { id: notification.post_id }
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
            Alert.alert(t('common.error'), t('notifications.markAllError'));
        }
    };

    // Group notifications by date
    const groupNotifications = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Use API notifications or static demo
        const notifs = notifications.length > 0 ? notifications : [];

        const grouped = {
            today: [] as any[],
            thisWeek: [] as any[],
            older: [] as any[],
        };

        if (notifs.length === 0) {
            // Use static demo data
            return STATIC_NOTIFICATIONS;
        }

        notifs.forEach(n => {
            const date = new Date(n.created_at);
            if (date >= today) {
                grouped.today.push(n);
            } else if (date >= weekAgo) {
                grouped.thisWeek.push(n);
            } else {
                grouped.older.push(n);
            }
        });

        return grouped;
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
        if (diffDays === 1) return t('time.yesterday');
        if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
        return t('time.lastWeek');
    };

    const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'like': return 'heart';
            case 'comment': return 'chatbubble';
            case 'follow': return 'person-add';
            case 'location': return 'location';
            default: return 'notifications';
        }
    };

    const getNotificationMessage = (notification: any): string => {
        const actorName = notification.actor_full_name || notification.actor_username || t('notifications.someone');

        switch (notification.type) {
            case 'like':
                return `${actorName} ${t('notifications.likedPost', { postTitle: notification.post_title || 'your post' })}`;
            case 'comment':
                return `${actorName} ${t('notifications.commented', { postTitle: notification.post_title || 'your post' })}`;
            case 'follow':
                return `${actorName} ${t('notifications.followed')}`;
            case 'location':
                return t('notifications.nearbyRoute', { locationName: notification.location_name });
            default:
                return t('notifications.newNotification');
        }
    };

    const groupedNotifications = groupNotifications();

    // Render notification card
    const renderNotificationCard = (notification: any, isOld: boolean = false, rotation: number = 0) => {
        const isUnread = !notification.read;

        return (
            <TouchableOpacity
                key={notification.id}
                style={styles.cardWrapper}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.8}
            >
                {/* Shadow layer */}
                {!isOld && (
                    <View style={[styles.cardShadow, { backgroundColor: `${letterTheme.waxRed}1A` }]} />
                )}

                {/* Main card */}
                <View style={[
                    styles.card,
                    {
                        backgroundColor: isOld ? letterTheme.paperOld : letterTheme.paper,
                        transform: [{ rotate: `${rotation}deg` }],
                    },
                    isOld && styles.cardOld,
                ]}>
                    {/* Paper texture gradient overlay */}
                    <View style={[styles.cardGradient, colorScheme === 'dark' ? styles.cardGradientDark : null]} />

                    {/* Wax seal for unread */}
                    {isUnread && (
                        <View style={styles.waxSeal}>
                            <View style={styles.waxSealInner} />
                            <Ionicons name="mail" size={10} color="rgba(255,255,255,0.9)" />
                        </View>
                    )}

                    {/* Content */}
                    <View style={styles.cardContent}>
                        {/* Stamp icon */}
                        <View style={[
                            styles.stampContainer,
                            { borderColor: isOld ? (colorScheme === 'dark' ? '#5D4037' : '#d4c5b0') : letterTheme.stampBorder },
                            { transform: [{ rotate: `${rotation * -2}deg` }] },
                            isOld && { opacity: 0.7 }
                        ]}>
                            <Ionicons
                                name={getNotificationIcon(notification.type)}
                                size={22}
                                color={isOld ? '#888' : letterTheme.stampBrown}
                                style={styles.stampIcon}
                            />
                        </View>

                        {/* Text content */}
                        <View style={styles.textContent}>
                            <Text style={[styles.messageText, { color: letterTheme.ink }]}>
                                {getNotificationMessage(notification)}
                            </Text>

                            {/* Comment preview */}
                            {notification.comment_preview && (
                                <View style={[styles.commentPreview, { borderLeftColor: colorScheme === 'dark' ? `${letterTheme.gold}33` : `${letterTheme.waxRed}33` }]}>
                                    <Text style={[styles.commentText, { color: letterTheme.inkMuted }]}>
                                        {notification.comment_preview}
                                    </Text>
                                </View>
                            )}

                            {/* Time */}
                            <Text style={[styles.timeText, { color: letterTheme.inkMuted }]}>
                                {getTimeAgo(notification.created_at)}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Render section divider
    const renderSectionDivider = (title: string, isActive: boolean = true) => (
        <View style={styles.sectionDivider}>
            <View style={[styles.dividerLine, { backgroundColor: isActive ? letterTheme.gold : letterTheme.inkMuted }]} />
            <Text style={[styles.sectionTitle, { color: isActive ? (colorScheme === 'dark' ? letterTheme.gold : letterTheme.waxRed) : letterTheme.inkMuted }]}>
                {title}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: isActive ? letterTheme.gold : letterTheme.inkMuted }]} />
        </View>
    );

    if (isLoading && notifications.length === 0) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: letterTheme.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: letterTheme.border }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? letterTheme.gold : letterTheme.ink} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: letterTheme.ink }]}>{t('notifications.title').toUpperCase()}</Text>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={letterTheme.gold} />
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: letterTheme.background }]}>
            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 12,
                backgroundColor: colorScheme === 'dark' ? `${letterTheme.background}E6` : `${letterTheme.background}E6`,
                borderBottomColor: letterTheme.border,
            }]}>
                <TouchableOpacity
                    style={[styles.backButton, { borderColor: colorScheme === 'dark' ? `${letterTheme.gold}33` : `${letterTheme.ink}20` }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? letterTheme.gold : letterTheme.ink} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: letterTheme.ink }]}>{t('notifications.title').toUpperCase()}</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={letterTheme.gold}
                    />
                }
            >
                {/* Today Section */}
                {groupedNotifications.today.length > 0 && (
                    <View style={styles.section}>
                        {renderSectionDivider(t('notifications.today'))}
                        <View style={styles.cardsContainer}>
                            {groupedNotifications.today.map((n, i) =>
                                renderNotificationCard(n, false, i % 2 === 0 ? 0.5 : -0.5)
                            )}
                        </View>
                    </View>
                )}

                {/* This Week Section */}
                {groupedNotifications.thisWeek.length > 0 && (
                    <View style={styles.section}>
                        {renderSectionDivider(t('notifications.thisWeek'))}
                        <View style={styles.cardsContainer}>
                            {groupedNotifications.thisWeek.map((n, i) =>
                                renderNotificationCard(n, false, i % 2 === 0 ? -0.5 : 1)
                            )}
                        </View>
                    </View>
                )}

                {/* Older Section */}
                {groupedNotifications.older.length > 0 && (
                    <View style={styles.section}>
                        {renderSectionDivider(t('notifications.older'), false)}
                        <View style={[styles.cardsContainer, { opacity: 0.8 }]}>
                            {groupedNotifications.older.map((n, i) =>
                                renderNotificationCard(n, true, i % 2 === 0 ? 1 : -0.5)
                            )}
                        </View>
                    </View>
                )}

                {/* Empty state footer */}
                <View style={styles.emptyFooter}>
                    <View style={[styles.emptyIconContainer, { borderColor: letterTheme.inkMuted }]}>
                        <Ionicons name="mail-open-outline" size={36} color={letterTheme.inkMuted} />
                    </View>
                    <Text style={[styles.emptyText, { color: letterTheme.inkMuted }]}>
                        {t('notifications.inboxUpToDate')}
                    </Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        ...Shadows.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 3,
        fontFamily: Typography.fonts.heading,
        textTransform: 'uppercase',
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        opacity: 0.5,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },

    // Cards
    cardsContainer: {
        gap: 20,
    },
    cardWrapper: {
        marginHorizontal: 4,
        position: 'relative',
    },
    cardShadow: {
        position: 'absolute',
        top: 4,
        left: 4,
        right: -4,
        bottom: -4,
        borderRadius: 4,
    },
    card: {
        padding: 20,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        ...Shadows.md,
    },
    cardOld: {
        ...Shadows.sm,
    },
    cardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        opacity: 0.3,
    },
    cardGradientDark: {
        opacity: 0.2,
    },
    cardContent: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
    },

    // Wax Seal
    waxSeal: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#c62828',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        ...Shadows.md,
    },
    waxSealInner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        borderStyle: 'dashed',
    },

    // Stamp
    stampContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stampIcon: {
        opacity: 0.85,
    },

    // Text
    textContent: {
        flex: 1,
    },
    messageText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
        fontFamily: Typography.fonts.heading,
    },
    commentPreview: {
        marginTop: 8,
        paddingLeft: 8,
        paddingVertical: 4,
        paddingRight: 4,
        borderLeftWidth: 2,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 2,
    },
    commentText: {
        fontSize: 13,
        fontStyle: 'italic',
        fontFamily: Typography.fonts.body,
    },
    timeText: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
        fontFamily: Typography.fonts.body,
    },

    // Empty Footer
    emptyFooter: {
        alignItems: 'center',
        paddingVertical: 32,
        opacity: 0.4,
    },
    emptyIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '12deg' }],
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        fontFamily: Typography.fonts.body,
    },
});
