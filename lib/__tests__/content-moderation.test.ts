/**
 * Tests for lib/content-moderation.ts
 */

jest.mock('../supabase', () => ({
    supabase: {
        functions: {
            invoke: jest.fn(),
        },
    },
}));

import { supabase } from '../supabase';
import { moderateText, moderateImages } from '../content-moderation';

describe('content-moderation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
});
