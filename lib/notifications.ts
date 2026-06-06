import { getBlockedUsers } from './block';
import { supabase } from './supabase';
import { captureError } from './sentry';
import { t } from './i18n';

export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
    id: string;
    user_id: string;
    actor_id: string;
    type: NotificationType;
    post_id: string | null;
    read: boolean;
    created_at: string;
    // Actor info (from join)
    actor_username?: string | null;
    actor_full_name?: string | null;
    actor_avatar_url?: string | null;
    // Post info (from join)
    post_title?: string | null;
    post_images?: string[] | null;
}

interface RawNotification {
    id: string;
    user_id: string;
    actor_id: string;
    type: NotificationType;
    post_id: string | null;
    read: boolean;
    created_at: string;
    profiles: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    posts: {
        title: string;
        images: string[] | null;
    } | null;
}

/**
 * Get notifications for current user
 */
export async function getNotifications(
    page: number = 0,
    pageSize: number = 20,
    unreadOnly: boolean = false
): Promise<Notification[]> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('notifications')
            .select(`
                id,
                user_id,
                actor_id,
                type,
                post_id,
                read,
                created_at,
                profiles:actor_id (
                    username,
                    full_name,
                    avatar_url
                ),
                posts:post_id (
                    title,
                    images
                )
            `)
            .eq('user_id', user.id);

        const blockedUsers = await getBlockedUsers();
        if (blockedUsers.length > 0) {
            query = query.not('actor_id', 'in', `(${blockedUsers.join(',')})`);
        }

        query = query.order('created_at', { ascending: false }).range(from, to);

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Flatten the nested data
        return ((data as unknown as RawNotification[]) || []).map((notification) => ({
            id: notification.id,
            user_id: notification.user_id,
            actor_id: notification.actor_id,
            type: notification.type,
            post_id: notification.post_id,
            read: notification.read,
            created_at: notification.created_at,
            actor_username: notification.profiles?.username,
            actor_full_name: notification.profiles?.full_name,
            actor_avatar_url: notification.profiles?.avatar_url,
            post_title: notification.posts?.title,
            post_images: notification.posts?.images,
        }));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        captureError(error as Error, { context: 'getNotifications' });
        throw error;
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .eq('user_id', user.id);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        captureError(error as Error, { context: 'markNotificationAsRead', notificationId });
        throw error;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        captureError(error as Error, { context: 'markAllNotificationsAsRead' });
        throw error;
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return 0;
        }

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) {
            // Silently return 0 for non-critical badge count failures
            return 0;
        }

        return count || 0;
    } catch (error) {
        // Silently return 0 — badge count is non-critical
        return 0;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', user.id);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        captureError(error as Error, { context: 'deleteNotification', notificationId });
        throw error;
    }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
) {
    const channel = supabase
        .channel('notifications')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            async (payload) => {
                // Fetch full notification with actor info
                const { data } = await supabase
                    .from('notifications')
                    .select(`
                        *,
                        profiles:actor_id (
                            username,
                            full_name,
                            avatar_url
                        ),
                        posts:post_id (
                            title,
                            images
                        )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    const rawNotification = data as unknown as RawNotification;
                    const notification: Notification = {
                        id: rawNotification.id,
                        user_id: rawNotification.user_id,
                        actor_id: rawNotification.actor_id,
                        type: rawNotification.type,
                        post_id: rawNotification.post_id,
                        read: rawNotification.read,
                        created_at: rawNotification.created_at,
                        actor_username: rawNotification.profiles?.username,
                        actor_full_name: rawNotification.profiles?.full_name,
                        actor_avatar_url: rawNotification.profiles?.avatar_url,
                        post_title: rawNotification.posts?.title,
                        post_images: rawNotification.posts?.images,
                    };
                    onNotification(notification);
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Get notification message text
 */
export function getNotificationMessage(notification: Notification): string {
    const actorName = notification.actor_full_name || notification.actor_username || t('notifications.someone');

    switch (notification.type) {
        case 'like':
            return `${actorName} ${t('notifications.likedPost', { postTitle: notification.post_title || '' })}`;
        case 'comment':
            return `${actorName} ${t('notifications.commented', { postTitle: notification.post_title || '' })}`;
        case 'follow':
            return `${actorName} ${t('notifications.followed')}`;
        default:
            return t('notifications.newNotification');
    }
}
