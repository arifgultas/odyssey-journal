/**
 * Push Notification Registration Hook
 * Registers for push notifications when user is authenticated
 * and handles incoming notification navigation
 */

import { registerForPushNotificationsAsync, savePushToken, setBadgeCount } from '@/lib/push-notifications';
import { type EventSubscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export function usePushNotifications(userId: string | undefined) {
    const router = useRouter();
    const notificationListener = useRef<EventSubscription>(undefined);
    const responseListener = useRef<EventSubscription>(undefined);

    useEffect(() => {
        if (!userId) return;

        // Register for push notifications and save token
        registerForPushNotificationsAsync().then(async (token) => {
            if (token) {
                await savePushToken(token);
            }
        });

        // Listen for incoming notifications while app is open
        notificationListener.current = Notifications.addNotificationReceivedListener(() => {
            // Notification received while app is in foreground
            // In-app notification system already handles the UI
        });

        // Handle notification taps (when user taps a push notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;

            if (data) {
                const { type, post_id, actor_id } = data as {
                    type?: string;
                    post_id?: string;
                    actor_id?: string;
                };

                switch (type) {
                    case 'like':
                    case 'comment':
                        if (post_id) {
                            router.push(`/post-detail/${post_id}` as any);
                        }
                        break;
                    case 'follow':
                        if (actor_id) {
                            router.push(`/user-profile/${actor_id}` as any);
                        }
                        break;
                    default:
                        break;
                }
            }
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [userId]);

    // Update badge count
    const updateBadge = async (count: number) => {
        await setBadgeCount(count);
    };

    return { updateBadge };
}

export default usePushNotifications;
