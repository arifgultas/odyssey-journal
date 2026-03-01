/**
 * Content Moderation — Direct OpenAI Moderation API
 * Uses the free omni-moderation-latest model for text + image screening.
 * No Edge Function needed — calls OpenAI directly from the client.
 */

const OPENAI_MODERATION_URL = 'https://api.openai.com/v1/moderations';

function getApiKey(): string {
    return process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
}

export interface ModerationResult {
    approved: boolean;
    flaggedCategories: string[];
    error?: string;
}

// Human-readable labels for moderation categories
const CATEGORY_LABELS: Record<string, string> = {
    'sexual': 'Sexual Content',
    'sexual/minors': 'Sexual Content (Minors)',
    'harassment': 'Harassment',
    'harassment/threatening': 'Threatening Harassment',
    'hate': 'Hate Speech',
    'hate/threatening': 'Threatening Hate Speech',
    'illicit': 'Illicit Content',
    'illicit/violent': 'Violent Illicit Content',
    'self-harm': 'Self-Harm',
    'self-harm/intent': 'Self-Harm Intent',
    'self-harm/instructions': 'Self-Harm Instructions',
    'violence': 'Violence',
    'violence/graphic': 'Graphic Violence',
};

/**
 * Extract flagged category names from the API response
 */
function getFlaggedCategories(categories: Record<string, boolean>): string[] {
    return Object.entries(categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => CATEGORY_LABELS[category] || category);
}

/**
 * Moderate text content (post titles, content, comments)
 */
export async function moderateText(text: string): Promise<ModerationResult> {
    try {
        const apiKey = getApiKey();
        if (!apiKey || !text || text.trim().length === 0) {
            return { approved: true, flaggedCategories: [] };
        }

        const response = await fetch(OPENAI_MODERATION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'omni-moderation-latest',
                input: [{ type: 'text', text }],
            }),
        });

        if (!response.ok) {
            console.warn('OpenAI Moderation API error:', response.status);
            return { approved: true, flaggedCategories: [] }; // Fail-open
        }

        const data = await response.json();
        const result = data.results?.[0];

        if (!result) {
            return { approved: true, flaggedCategories: [] };
        }

        return {
            approved: !result.flagged,
            flaggedCategories: result.flagged ? getFlaggedCategories(result.categories) : [],
        };
    } catch (error) {
        console.warn('Content moderation error:', error);
        return { approved: true, flaggedCategories: [] }; // Fail-open
    }
}

/**
 * Moderate image content via OpenAI omni-moderation model
 */
export async function moderateImages(imageUrls: string[]): Promise<ModerationResult> {
    try {
        const apiKey = getApiKey();
        if (!apiKey || !imageUrls || imageUrls.length === 0) {
            return { approved: true, flaggedCategories: [] };
        }

        const allFlagged: string[] = [];
        let anyFlagged = false;

        // Check each image individually
        for (const url of imageUrls) {
            try {
                const response = await fetch(OPENAI_MODERATION_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'omni-moderation-latest',
                        input: [{ type: 'image_url', image_url: { url } }],
                    }),
                });

                if (!response.ok) {
                    console.warn('Image moderation API error:', response.status);
                    continue;
                }

                const data = await response.json();
                const result = data.results?.[0];

                if (result?.flagged) {
                    anyFlagged = true;
                    const categories = getFlaggedCategories(result.categories);
                    for (const cat of categories) {
                        if (!allFlagged.includes(cat)) {
                            allFlagged.push(cat);
                        }
                    }
                }
            } catch {
                // Skip individual image errors — don't block the whole post
                continue;
            }
        }

        return {
            approved: !anyFlagged,
            flaggedCategories: allFlagged,
        };
    } catch (error) {
        console.warn('Image moderation error:', error);
        return { approved: true, flaggedCategories: [] }; // Fail-open
    }
}

/**
 * Full moderation check for a post (text + images in parallel)
 */
export async function moderatePost(
    title: string,
    content: string,
    imageUrls?: string[]
): Promise<ModerationResult> {
    try {
        const fullText = [title, content].filter(Boolean).join('\n\n');

        const [textResult, imageResult] = await Promise.all([
            fullText ? moderateText(fullText) : Promise.resolve({ approved: true, flaggedCategories: [] } as ModerationResult),
            imageUrls && imageUrls.length > 0
                ? moderateImages(imageUrls)
                : Promise.resolve({ approved: true, flaggedCategories: [] } as ModerationResult),
        ]);

        const uniqueCategories = [...new Set([...textResult.flaggedCategories, ...imageResult.flaggedCategories])];

        return {
            approved: textResult.approved && imageResult.approved,
            flaggedCategories: uniqueCategories,
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
