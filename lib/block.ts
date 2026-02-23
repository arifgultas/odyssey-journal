import { supabase } from '@/lib/supabase';

export interface BlockRecord {
    blocker_id: string;
    blocked_id: string;
    created_at: string;
}

/**
 * Block a user
 * @param blockedId The user ID to block
 */
export async function blockUser(blockedId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('user_blocks')
            .upsert({ blocker_id: user.id, blocked_id: blockedId });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error blocking user:', error);
        throw error;
    }
}

/**
 * Unblock a user
 * @param blockedId The user ID to unblock
 */
export async function unblockUser(blockedId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('user_blocks')
            .delete()
            .match({ blocker_id: user.id, blocked_id: blockedId });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error unblocking user:', error);
        throw error;
    }
}

/**
 * Get all users blocked by the current user
 */
export async function getBlockedUsers(): Promise<string[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_blocks')
            .select('blocked_id')
            .eq('blocker_id', user.id);

        if (error) throw error;
        return data.map(record => record.blocked_id);
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        return [];
    }
}

/**
 * Check if the current user has blocked a specific user
 */
export async function checkIfBlocked(userId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { count, error } = await supabase
            .from('user_blocks')
            .select('*', { count: 'exact', head: true })
            .eq('blocker_id', user.id)
            .eq('blocked_id', userId);

        if (error) throw error;
        return (count ?? 0) > 0;
    } catch (error) {
        console.error('Error checking block status:', error);
        return false;
    }
}
