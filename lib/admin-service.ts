/**
 * Admin Service
 * Handles admin-only operations: report management, user banning, and post deletion.
 * All functions verify admin status via SECURITY DEFINER database functions.
 */

import { supabase } from './supabase';

export interface ReportWithDetails {
    id: string;
    reporter_id: string;
    post_id: string;
    reason: string;
    description: string | null;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    created_at: string;
    updated_at: string;
    // Joined data
    reporter?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
    post?: {
        title: string;
        content: string;
        images: string[] | null;
        user_id: string;
        profiles?: {
            username: string | null;
            full_name: string | null;
        };
    };
}

export interface AdminStats {
    pendingReports: number;
    totalReports: number;
    bannedUsers: number;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (error) return false;
        return data?.is_admin === true;
    } catch {
        return false;
    }
}

/**
 * Get all reports with details (admin only)
 */
export async function getReports(
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
    page: number = 0,
    pageSize: number = 20
): Promise<ReportWithDetails[]> {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('reports')
            .select(`
                *,
                reporter:reporter_id (
                    username,
                    full_name,
                    avatar_url
                ),
                post:post_id (
                    title,
                    content,
                    images,
                    user_id,
                    profiles:user_id (
                        username,
                        full_name
                    )
                )
            `)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data || []) as unknown as ReportWithDetails[];
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
    reportId: string,
    status: 'reviewed' | 'resolved' | 'dismissed'
): Promise<void> {
    try {
        const { error } = await supabase
            .from('reports')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', reportId);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating report status:', error);
        throw error;
    }
}

/**
 * Delete a reported post (admin only — calls SECURITY DEFINER function)
 */
export async function adminDeletePost(postId: string): Promise<void> {
    try {
        const { error } = await supabase.rpc('admin_delete_post', {
            target_post_id: postId,
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}

/**
 * Ban a user (admin only — calls SECURITY DEFINER function)
 */
export async function banUser(userId: string): Promise<void> {
    try {
        const { error } = await supabase.rpc('admin_ban_user', {
            target_user_id: userId,
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error banning user:', error);
        throw error;
    }
}

/**
 * Unban a user (admin only — calls SECURITY DEFINER function)
 */
export async function unbanUser(userId: string): Promise<void> {
    try {
        const { error } = await supabase.rpc('admin_unban_user', {
            target_user_id: userId,
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error unbanning user:', error);
        throw error;
    }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
    try {
        const [pendingResult, totalResult, bannedResult] = await Promise.all([
            supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending'),
            supabase
                .from('reports')
                .select('*', { count: 'exact', head: true }),
            supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_banned', true),
        ]);

        return {
            pendingReports: pendingResult.count || 0,
            totalReports: totalResult.count || 0,
            bannedUsers: bannedResult.count || 0,
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return { pendingReports: 0, totalReports: 0, bannedUsers: 0 };
    }
}
