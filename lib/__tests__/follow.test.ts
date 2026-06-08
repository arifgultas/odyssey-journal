/**
 * Tests for lib/follow.ts
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
    followUser,
    unfollowUser,
    checkIfFollowing,
    getFollowers,
    getFollowing,
} from '../follow';
import { supabase } from '../supabase';

describe('follow service', () => {
    const mockUser = { id: 'user-123' };
    const fromBuilder = supabase.from('follows') as any;

    beforeEach(() => {
        jest.clearAllMocks();
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
    });

    describe('followUser', () => {
        it('throws error if user is not authenticated', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
                error: new Error('Auth error'),
            });

            await expect(followUser('user-456')).rejects.toThrow('User not authenticated');
        });

        it('throws error when trying to follow self', async () => {
            await expect(followUser('user-123')).rejects.toThrow('Cannot follow yourself');
        });

        it('returns true on successful follow insert', async () => {
            (fromBuilder.insert as jest.Mock).mockResolvedValueOnce({ error: null });

            const result = await followUser('user-456');
            expect(result).toBe(true);
            expect(supabase.from).toHaveBeenCalledWith('follows');
            expect(fromBuilder.insert).toHaveBeenCalledWith({
                follower_id: 'user-123',
                following_id: 'user-456',
            });
        });

        it('returns false on duplicate follow insert (error 23505)', async () => {
            (fromBuilder.insert as jest.Mock).mockResolvedValueOnce({
                error: { code: '23505', message: 'Duplicate key' },
            });

            const result = await followUser('user-456');
            expect(result).toBe(false);
        });
    });

    describe('unfollowUser', () => {
        it('deletes follow record matching follower and following', async () => {
            (fromBuilder.delete as jest.Mock).mockReturnValue({
                eq: jest.fn(() => ({
                    eq: jest.fn(() => Promise.resolve({ error: null })),
                })),
            });

            const result = await unfollowUser('user-456');
            expect(result).toBe(true);
        });
    });

    describe('checkIfFollowing', () => {
        it('returns true if follow record exists', async () => {
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({
                data: { follower_id: 'user-123' },
                error: null,
            });

            const result = await checkIfFollowing('user-456');
            expect(result).toBe(true);
        });

        it('returns false if follow record does not exist (PGRST116)', async () => {
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
            });

            const result = await checkIfFollowing('user-456');
            expect(result).toBe(false);
        });
    });

    describe('getFollowers', () => {
        it('returns followers list mapped to profiles', async () => {
            const mockData = [
                {
                    follower_id: 'follower-1',
                    profiles: { id: 'follower-1', username: 'follower_one' },
                },
            ];

            (fromBuilder.range as jest.Mock).mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await getFollowers('user-123', 0, 20);
            expect(result).toEqual([{ id: 'follower-1', username: 'follower_one' }]);
            expect(fromBuilder.eq).toHaveBeenCalledWith('following_id', 'user-123');
        });
    });

    describe('getFollowing', () => {
        it('returns following list mapped to profiles', async () => {
            const mockData = [
                {
                    following_id: 'following-1',
                    profiles: { id: 'following-1', username: 'following_one' },
                },
            ];

            (fromBuilder.range as jest.Mock).mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await getFollowing('user-123', 0, 20);
            expect(result).toEqual([{ id: 'following-1', username: 'following_one' }]);
            expect(fromBuilder.eq).toHaveBeenCalledWith('follower_id', 'user-123');
        });
    });
});
