/**
 * Tests for lib/content-moderation.ts
 */

// Mock the fetch function for OpenAI API calls
global.fetch = jest.fn();

// Mock process.env
const originalEnv = process.env;

describe('content-moderation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, EXPO_PUBLIC_OPENAI_API_KEY: 'test-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('moderateText', () => {
        it('approves clean text', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    results: [{
                        flagged: false,
                        categories: {},
                        category_scores: {},
                    }],
                }),
            });

            const { moderateText } = require('../content-moderation');
            const result = await moderateText('This is a beautiful travel post');
            expect(result.approved).toBe(true);
        });

        it('rejects flagged text', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    results: [{
                        flagged: true,
                        categories: { harassment: true },
                        category_scores: { harassment: 0.95 },
                    }],
                }),
            });

            const { moderateText } = require('../content-moderation');
            const result = await moderateText('bad content');
            expect(result.approved).toBe(false);
        });

        it('approves on API error (fail-open)', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const { moderateText } = require('../content-moderation');
            const result = await moderateText('test content');
            expect(result.approved).toBe(true);
        });

        it('approves on rate limit (fail-open)', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 429,
                text: () => Promise.resolve('Rate limited'),
            });

            const { moderateText } = require('../content-moderation');
            const result = await moderateText('test content');
            expect(result.approved).toBe(true);
        });
    });

    describe('moderateImages', () => {
        it('approves when no images provided', async () => {
            const { moderateImages } = require('../content-moderation');
            const result = await moderateImages([]);
            expect(result.approved).toBe(true);
        });
    });
});
