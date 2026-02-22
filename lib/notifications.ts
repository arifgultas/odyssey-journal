import { supabase } from './supabase';

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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Flatten the nested data
        return (data || []).map((notification: any) => ({
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
                    const notification: Notification = {
                        id: data.id,
                        user_id: data.user_id,
                        actor_id: data.actor_id,
                        type: data.type,
                        post_id: data.post_id,
                        read: data.read,
                        created_at: data.created_at,
                        actor_username: (data as any).profiles?.username,
                        actor_full_name: (data as any).profiles?.full_name,
                        actor_avatar_url: (data as any).profiles?.avatar_url,
                        post_title: (data as any).posts?.title,
                        post_images: (data as any).posts?.images,
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
    const actorName = notification.actor_full_name || notification.actor_username || 'Someone';

    switch (notification.type) {
        case 'like':
            return `${actorName} liked your post`;
        case 'comment':
            return `${actorName} commented on your post`;
        case 'follow':
            return `${actorName} started following you`;
        default:
            return 'New notification';
    }
}
