import { Alert } from 'react-native';
import { supabase } from './supabase';

export type ReportReason =
    | 'spam'
    | 'harassment'
    | 'hate_speech'
    | 'violence'
    | 'nudity'
    | 'false_information'
    | 'other';

export interface Report {
    id: string;
    reporter_id: string;
    post_id: string;
    reason: string;
    description: string | null;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    created_at: string;
    updated_at: string;
}

export interface CreateReportData {
    post_id: string;
    reason: ReportReason;
    description?: string;
}

/**
 * Report reasons with user-friendly labels
 */
export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
    {
        value: 'spam',
        label: 'Spam',
        description: 'Repetitive or irrelevant content',
    },
    {
        value: 'harassment',
        label: 'Harassment or Bullying',
        description: 'Targeting or attacking someone',
    },
    {
        value: 'hate_speech',
        label: 'Hate Speech',
        description: 'Discriminatory or offensive content',
    },
    {
        value: 'violence',
        label: 'Violence or Threats',
        description: 'Promoting or threatening violence',
    },
    {
        value: 'nudity',
        label: 'Nudity or Sexual Content',
        description: 'Inappropriate sexual content',
    },
    {
        value: 'false_information',
        label: 'False Information',
        description: 'Misleading or false content',
    },
    {
        value: 'other',
        label: 'Other',
        description: 'Something else',
    },
];

/**
 * Report a post
 */
export async function reportPost(data: CreateReportData): Promise<Report | null> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: report, error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                post_id: data.post_id,
                reason: data.reason,
                description: data.description || null,
            })
            .select()
            .single();

        if (error) {
            // Check if it's a duplicate report
            if (error.code === '23505') {
                Alert.alert(
                    'Already Reported',
                    'You have already reported this post. We will review it soon.'
                );
                return null;
            }
            throw error;
        }

        Alert.alert(
            'Report Submitted',
            'Thank you for your report. We will review it and take appropriate action.'
        );

        return report;
    } catch (error) {
        console.error('Error reporting post:', error);
        Alert.alert('Error', 'Failed to submit report. Please try again.');
        return null;
    }
}

/**
 * Check if user has already reported a post
 */
export async function hasReportedPost(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return false;
        }

        const { data, error } = await supabase
            .from('reports')
            .select('id')
            .eq('reporter_id', user.id)
            .eq('post_id', postId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error checking report status:', error);
        return false;
    }
}

/**
 * Get user's reports
 */
export async function getUserReports(
    page: number = 0,
    pageSize: number = 20
): Promise<Report[]> {
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

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('reporter_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
}

/**
 * Get report reason label
 */
export function getReportReasonLabel(reason: ReportReason): string {
    const reportReason = REPORT_REASONS.find(r => r.value === reason);
    return reportReason?.label || reason;
}
