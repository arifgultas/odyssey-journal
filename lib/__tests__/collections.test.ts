/**
 * Tests for lib/collections.ts
 */

jest.mock('../supabase', () => {
    const mockSingle = jest.fn();
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockOrder = jest.fn();
    const mockRange = jest.fn();

    const queryBuilder: any = {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
        single: mockSingle,
    };

    mockSelect.mockImplementation(() => queryBuilder);
    mockInsert.mockImplementation(() => queryBuilder);
    mockUpdate.mockImplementation(() => queryBuilder);
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
    createCollection,
    updateCollection,
    deleteCollection,
    getCollections,
    getCollectionById,
    getCollectionPosts,
} from '../collections';
import { supabase } from '../supabase';

describe('collections service', () => {
    const mockUser = { id: 'user-123' };
    const fromBuilder = supabase.from('collections') as any;

    beforeEach(() => {
        jest.clearAllMocks();
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
    });

    describe('createCollection', () => {
        it('throws error if user is not authenticated', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
                error: new Error('Auth error'),
            });

            await expect(createCollection({ name: 'Favs' })).rejects.toThrow('User not authenticated');
        });

        it('inserts collection with default values if not provided', async () => {
            const mockCreated = { id: 'col-1', name: 'Favs', color: '#D4A574', is_private: false };
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockCreated, error: null });

            const result = await createCollection({ name: 'Favs' });
            expect(result).toEqual(mockCreated);
            expect(fromBuilder.insert).toHaveBeenCalledWith({
                user_id: 'user-123',
                name: 'Favs',
                cover_image_url: null,
                color: '#D4A574',
                is_private: false,
            });
        });
    });

    describe('updateCollection', () => {
        it('updates collection record matching user and collectionId', async () => {
            const mockUpdated = { id: 'col-1', name: 'New Name' };
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockUpdated, error: null });

            const result = await updateCollection('col-1', { name: 'New Name' });
            expect(result).toEqual(mockUpdated);
            expect(fromBuilder.update).toHaveBeenCalledWith({ name: 'New Name' });
        });
    });

    describe('deleteCollection', () => {
        it('clears collection_id from bookmarks and deletes collection record', async () => {
            const bookmarkBuilder = supabase.from('bookmarks') as any;
            (bookmarkBuilder.update as jest.Mock).mockReturnValue({
                eq: jest.fn(() => Promise.resolve({ error: null })),
            });
            (fromBuilder.delete as jest.Mock).mockReturnValue({
                eq: jest.fn(() => ({
                    eq: jest.fn(() => Promise.resolve({ error: null })),
                })),
            });

            const result = await deleteCollection('col-1');
            expect(result).toBe(true);
            expect(supabase.from).toHaveBeenCalledWith('bookmarks');
            expect(bookmarkBuilder.update).toHaveBeenCalledWith({ collection_id: null });
            expect(fromBuilder.delete).toHaveBeenCalled();
        });
    });

    describe('getCollections', () => {
        it('fetches collections for current user ordered by created_at', async () => {
            const mockCols = [{ id: 'col-1', name: 'Favs' }];
            (fromBuilder.order as jest.Mock).mockResolvedValueOnce({ data: mockCols, error: null });

            const result = await getCollections();
            expect(result).toEqual(mockCols);
            expect(fromBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
        });
    });

    describe('getCollectionById', () => {
        it('returns collection record if exists', async () => {
            const mockCol = { id: 'col-1', name: 'Favs' };
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockCol, error: null });

            const result = await getCollectionById('col-1');
            expect(result).toEqual(mockCol);
        });

        it('returns null if collection does not exist (PGRST116)', async () => {
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
            });

            const result = await getCollectionById('col-1');
            expect(result).toBeNull();
        });
    });

    describe('getCollectionPosts', () => {
        it('returns posts from bookmarks matching collectionId', async () => {
            const mockData = [
                {
                    created_at: '2026-06-08',
                    posts: { id: 'post-1', title: 'Post 1' },
                },
            ];

            const bookmarkBuilder = supabase.from('bookmarks') as any;
            (bookmarkBuilder.range as jest.Mock).mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await getCollectionPosts('col-1', 0, 20);
            expect(result).toEqual([{ id: 'post-1', title: 'Post 1' }]);
            expect(bookmarkBuilder.eq).toHaveBeenCalledWith('collection_id', 'col-1');
        });
    });
});
