import { supabase } from './supabase';

export interface ModerationResult {
    approved: boolean;
    flaggedCategories: string[];
    error?: string;
}

/**
 * Moderate text content (post titles, content, comments) via Edge Function
 */
export async function moderateText(text: string): Promise<ModerationResult> {
    if (!text || text.trim().length === 0) {
        return { approved: true, flaggedCategories: [] };
    }

    try {
        const { data, error } = await supabase.functions.invoke<{
            approved: boolean;
            flaggedCategories: string[];
            error?: string;
        }>('moderate-content', {
            body: { text },
        });

        if (error) {
            console.warn('Edge Function invocation error:', error);
            return { approved: true, flaggedCategories: [] }; // Fail-open
        }

        return {
            approved: data?.approved ?? true,
            flaggedCategories: data?.flaggedCategories || [],
        };
    } catch (error) {
        console.warn('Content moderation error:', error);
        return { approved: true, flaggedCategories: [] }; // Fail-open
    }
}

/**
 * Moderate image content via Edge Function
 */
export async function moderateImages(imageUrls: string[]): Promise<ModerationResult> {
    if (!imageUrls || imageUrls.length === 0) {
        return { approved: true, flaggedCategories: [] };
    }

    try {
        const { data, error } = await supabase.functions.invoke<{
            approved: boolean;
            flaggedCategories: string[];
            error?: string;
        }>('moderate-content', {
            body: { imageUrls },
        });

        if (error) {
            console.warn('Edge Function invocation error:', error);
            return { approved: true, flaggedCategories: [] }; // Fail-open
        }

        return {
            approved: data?.approved ?? true,
            flaggedCategories: data?.flaggedCategories || [],
        };
    } catch (error) {
        console.warn('Image moderation error:', error);
        return { approved: true, flaggedCategories: [] }; // Fail-open
    }
}

/**
 * Full moderation check for a post (text + images) via Edge Function
 */
export async function moderatePost(
    title: string,
    content: string,
    imageUrls?: string[]
): Promise<ModerationResult> {
    const text = [title, content].filter(Boolean).join('\n\n');
    
    if (!text && (!imageUrls || imageUrls.length === 0)) {
        return { approved: true, flaggedCategories: [] };
    }

    try {
        const { data, error } = await supabase.functions.invoke<{
            approved: boolean;
            flaggedCategories: string[];
            error?: string;
        }>('moderate-content', {
            body: { text, imageUrls },
        });

        if (error) {
            console.warn('Edge Function invocation error:', error);
            return { approved: true, flaggedCategories: [] }; // Fail-open
        }

        return {
            approved: data?.approved ?? true,
            flaggedCategories: data?.flaggedCategories || [],
        };
    } catch (error) {
        console.warn('Post moderation error:', error);
        return { approved: true, flaggedCategories: [] }; // Fail-open
    }
}

/**
 * Get user-friendly rejection message
 */
export function getModerationMessage(flaggedCategories: string[]): string {
    if (flaggedCategories.length === 0) {
        return 'Your content was flagged for review. Please ensure it follows our community guidelines.';
    }
    const reasons = flaggedCategories.join(', ');
    return `Your content was flagged for: ${reasons}. Please ensure your post follows our community guidelines.`;
}
