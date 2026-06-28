/**
 * Tests for lib/interactions.ts
 */

jest.mock('../supabase', () => {
    const mockSingle = jest.fn();
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockOrder = jest.fn();
    const mockRange = jest.fn();

    const queryBuilder: any = {
        select: mockSelect,
        insert: mockInsert,
        delete: mockDelete,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
        single: mockSingle,
    };

    mockSelect.mockImplementation(() => queryBuilder);
    mockInsert.mockImplementation(() => queryBuilder);
    mockDelete.mockImplementation(() => queryBuilder);
    mockEq.mockImplementation(() => queryBuilder);
    mockOrder.mockImplementation(() => queryBuilder);
    mockRange.mockImplementation(() => queryBuilder);

    return {
        supabase: {
            auth: {
                getUser: jest.fn(),
            },
            from: jest.fn(() => queryBuilder),
        },
    };
});

jest.mock('../sentry', () => ({
    captureError: jest.fn(),
}));

import {
    likePost,
    unlikePost,
    checkIfLiked,
    bookmarkPost,
    unbookmarkPost,
    checkIfBookmarked,
    getBookmarkedPosts,
    getLikeCount,
} from '../interactions';
import { supabase } from '../supabase';

describe('interactions service', () => {
    const mockUser = { id: 'user-123' };
    const fromBuilder = supabase.from('likes') as any;

    beforeEach(() => {
        jest.clearAllMocks();
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
    });

    describe('likePost', () => {
        it('throws error if user is not authenticated', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
                error: new Error('Auth error'),
            });

            await expect(likePost('post-1')).rejects.toThrow('User not authenticated');
        });

        it('returns true on successful like insert', async () => {
            (fromBuilder.insert as jest.Mock).mockResolvedValueOnce({ error: null });

            const result = await likePost('post-1');
            expect(result).toBe(true);
            expect(supabase.from).toHaveBeenCalledWith('likes');
            expect(fromBuilder.insert).toHaveBeenCalledWith({
                user_id: 'user-123',
                post_id: 'post-1',
            });
        });

        it('returns false on duplicate like insert (error 23505)', async () => {
            (fromBuilder.insert as jest.Mock).mockResolvedValueOnce({
                error: { code: '23505', message: 'Duplicate key' },
            });

            const result = await likePost('post-1');
            expect(result).toBe(false);
        });

        it('throws database error if other error occurs', async () => {
            const dbError = new Error('Db failure');
            (dbError as any).code = 'some-error';
            (fromBuilder.insert as jest.Mock).mockResolvedValueOnce({
                error: dbError,
            });

            await expect(likePost('post-1')).rejects.toThrow('Db failure');
        });
    });

    describe('unlikePost', () => {
        it('deletes like record matching user and post', async () => {
            (fromBuilder.delete as jest.Mock).mockReturnValue({
                eq: jest.fn(() => ({
                    eq: jest.fn(() => Promise.resolve({ error: null })),
                })),
            });

            const result = await unlikePost('post-1');
            expect(result).toBe(true);
        });
    });

    describe('checkIfLiked', () => {
        it('returns true if like record exists', async () => {
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({
                data: { id: 'like-1' },
                error: null,
            });

            const result = await checkIfLiked('post-1');
            expect(result).toBe(true);
        });

        it('returns false if like record does not exist (PGRST116)', async () => {
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
            });

            const result = await checkIfLiked('post-1');
            expect(result).toBe(false);
        });
    });

    describe('bookmarkPost', () => {
        it('bookmarks post with optional collectionId', async () => {
            const bookmarkBuilder = supabase.from('bookmarks') as any;
            (bookmarkBuilder.insert as jest.Mock).mockResolvedValueOnce({ error: null });

            const result = await bookmarkPost('post-1', 'col-1');
            expect(result).toBe(true);
            expect(supabase.from).toHaveBeenCalledWith('bookmarks');
            expect(bookmarkBuilder.insert).toHaveBeenCalledWith({
                user_id: 'user-123',
                post_id: 'post-1',
                collection_id: 'col-1',
            });
        });
    });

    describe('unbookmarkPost', () => {
        it('deletes bookmark record matching user and post', async () => {
            const bookmarkBuilder = supabase.from('bookmarks') as any;
            (bookmarkBuilder.delete as jest.Mock).mockReturnValue({
                eq: jest.fn(() => ({
                    eq: jest.fn(() => Promise.resolve({ error: null })),
                })),
            });

            const result = await unbookmarkPost('post-1');
            expect(result).toBe(true);
        });
    });

    describe('checkIfBookmarked', () => {
        it('returns true if bookmark record exists', async () => {
            const bookmarkBuilder = supabase.from('bookmarks') as any;
            (bookmarkBuilder.single as jest.Mock).mockResolvedValueOnce({
                data: { id: 'bookmark-1' },
                error: null,
            });

            const result = await checkIfBookmarked('post-1');
            expect(result).toBe(true);
        });
    });

    describe('getBookmarkedPosts', () => {
        it('returns mapped list of posts', async () => {
            const mockData = [
                {
                    created_at: '2026-06-08',
                    posts: { id: 'post-1', title: 'Post 1' },
                },
                {
                    created_at: '2026-06-07',
                    posts: null, // edge case: post deleted in database but bookmark remains
                },
            ];

            const bookmarkBuilder = supabase.from('bookmarks') as any;
            (bookmarkBuilder.range as jest.Mock).mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await getBookmarkedPosts(0, 10);
            expect(result).toEqual([{ id: 'post-1', title: 'Post 1' }]);
        });
    });

    describe('getLikeCount', () => {
        it('returns count of likes', async () => {
            (fromBuilder.select as jest.Mock).mockReturnValue({
                eq: jest.fn(() => Promise.resolve({ count: 42, error: null })),
            });

            const result = await getLikeCount('post-1');
            expect(result).toBe(42);
        });
    });
});
