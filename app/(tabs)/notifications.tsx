import { NotificationItem } from '@/components/notification-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
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
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
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
            // Subscribe to real-time notifications
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
            Alert.alert('Error', 'Failed to load notifications');
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

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            loadNotifications(page + 1);
        }
    };

    const handleNotificationPress = async (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
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

        // Navigate based on notification type
        if (notification.type === 'follow') {
            // TODO: Navigate to user profile
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
            Alert.alert('Error', 'Failed to mark all as read');
        }
    };

    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="notifications-outline" size={80} color={Colors.light.textMuted} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                    No Notifications
                </ThemedText>
                <ThemedText style={styles.emptyText}>
                    When you get notifications, they'll show up here
                </ThemedText>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoading || notifications.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.light.accent} />
            </View>
        );
    };

    if (isLoading && notifications.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.headerTitle}>
                        Notifications
                    </ThemedText>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.accent} />
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.headerTitle}>
                    Notifications
                </ThemedText>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                        <ThemedText style={styles.markAllText}>Mark all read</ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationItem
                        notification={item}
                        onPress={() => handleNotificationPress(item)}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.light.accent}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
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
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
    },
    markAllButton: {
        padding: Spacing.xs,
    },
    markAllText: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.accent,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl * 2,
        gap: Spacing.md,
    },
    emptyTitle: {
        marginTop: Spacing.md,
        fontFamily: Typography.fonts.heading,
    },
    emptyText: {
        color: Colors.light.textMuted,
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
});
