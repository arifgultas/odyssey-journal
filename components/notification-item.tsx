import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { Notification, getNotificationMessage } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationItemProps {
    notification: Notification;
    onPress?: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
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

    const getIcon = () => {
        switch (notification.type) {
            case 'like':
                return <Ionicons name="heart" size={20} color={Colors.light.error} />;
            case 'comment':
                return <Ionicons name="chatbubble" size={20} color={Colors.light.accent} />;
            case 'follow':
                return <Ionicons name="person-add" size={20} color={Colors.light.success} />;
            default:
                return <Ionicons name="notifications" size={20} color={Colors.light.textMuted} />;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                !notification.read && styles.unreadContainer,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Unread Indicator */}
            {!notification.read && <View style={styles.unreadDot} />}

            {/* Actor Avatar */}
            <View style={styles.avatar}>
                {notification.actor_avatar_url ? (
                    <Image
                        source={{ uri: notification.actor_avatar_url }}
                        style={styles.avatarImage}
                        contentFit="cover"
                    />
                ) : (
                    <Ionicons name="person" size={20} color={Colors.light.textMuted} />
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.message}>
                        {getNotificationMessage(notification)}
                    </Text>
                    {notification.post_title && (
                        <Text style={styles.postTitle} numberOfLines={1}>
                            "{notification.post_title}"
                        </Text>
                    )}
                </View>
                <Text style={styles.timestamp}>{formatDate(notification.created_at)}</Text>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
                {getIcon()}
            </View>

            {/* Post Thumbnail (if available) */}
            {notification.post_images && notification.post_images.length > 0 && (
                <Image
                    source={{ uri: notification.post_images[0] }}
                    style={styles.postThumbnail}
                    contentFit="cover"
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        gap: Spacing.sm,
    },
    unreadContainer: {
        backgroundColor: Colors.light.background,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.accent,
        position: 'absolute',
        left: Spacing.xs,
        top: '50%',
        marginTop: -4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginLeft: Spacing.xs,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        gap: 4,
    },
    textContainer: {
        gap: 2,
    },
    message: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.text,
        lineHeight: 20,
    },
    postTitle: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        color: Colors.light.textSecondary,
        fontStyle: 'italic',
    },
    timestamp: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.textMuted,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postThumbnail: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.sm,
    },
});
