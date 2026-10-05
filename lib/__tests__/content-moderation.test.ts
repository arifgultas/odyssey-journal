/**
 * Tests for lib/content-moderation.ts
 */

jest.mock('../supabase', () => ({
    supabase: {
        functions: {
            invoke: jest.fn(),
        },
        auth: {
            getSession: jest.fn(async () => ({ data: { session: { user: { id: 'user-1' } } } })),
        },
    },
}));

jest.mock('../ai-consent', () => ({
    hasAiConsent: jest.fn(async () => true),
}));

import { hasAiConsent } from '../ai-consent';
import { supabase } from '../supabase';
import { AiConsentRequiredError, getModerationMessage, moderateText, moderateImages } from '../content-moderation';

describe('content-moderation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sends nothing to OpenAI without consent (App Store 5.1.2(i))', async () => {
        (hasAiConsent as jest.Mock).mockResolvedValueOnce(false);

        await expect(moderateText('A post')).rejects.toBeInstanceOf(AiConsentRequiredError);
        expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    describe('moderateText', () => {
        it('approves clean text', async () => {
            (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
                data: {
                    approved: true,
                    flaggedCategories: [],
                },
                error: null,
            });

            const result = await moderateText('This is a beautiful travel post');
            expect(result.approved).toBe(true);
            expect(supabase.functions.invoke).toHaveBeenCalledWith('moderate-content', { body: { text: 'This is a beautiful travel post' } });
        });

        it('rejects flagged text', async () => {
            (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
                data: {
                    approved: false,
                    flaggedCategories: ['Harassment'],
                },
                error: null,
            });

            const result = await moderateText('bad content');
            expect(result.approved).toBe(false);
            expect(result.flaggedCategories).toContain('Harassment');
        });

        it('approves on API error (fail-open)', async () => {
            (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
                data: null,
                error: new Error('Network error'),
            });

            const result = await moderateText('test content');
            expect(result.approved).toBe(true);
        });
    });

    describe('moderateImages', () => {
        it('approves when no images provided', async () => {
            const result = await moderateImages([]);
            expect(result.approved).toBe(true);
        });
    });

    it('tells the writer how to contest a rejection', () => {
        expect(getModerationMessage([])).toContain('support@odysseyjournal.app');
        expect(getModerationMessage(['harassment'])).toContain('support@odysseyjournal.app');
    });
});
