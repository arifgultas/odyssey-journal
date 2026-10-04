import { hasAiConsent } from './ai-consent';
import { supabase } from './supabase';
import { t, hasTranslation } from './i18n';

/**
 * Thrown when content would go to OpenAI without the reader's permission (App Store 5.1.2(i)).
 * The screens ask first (context/ai-consent-context.tsx); this is the backstop for any other path
 * that reaches moderation, so it stops the post or comment instead of sending it.
 */
export class AiConsentRequiredError extends Error {
    constructor() {
        super('AI moderation consent required');
        this.name = 'AiConsentRequiredError';
    }
}

/**
 * Content the moderation check rejected. The message is already in the reader's language
 * (getModerationMessage), so screens show it as it is instead of a generic error.
 */
export class ModerationRejectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModerationRejectedError';
    }
}

async function assertAiConsent() {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId || !(await hasAiConsent(userId))) throw new AiConsentRequiredError();
}

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

    await assertAiConsent();

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

    await assertAiConsent();

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

    await assertAiConsent();

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
        return t('moderation.flaggedNoReasons');
    }
    
    const translatedCategories = flaggedCategories.map(cat => {
        const key = `moderation.categories.${cat}`;
        return hasTranslation(key) ? t(key) : cat;
    });
    
    const reasons = translatedCategories.join(', ');
    return t('moderation.flaggedWithReasons', { reasons });
}
