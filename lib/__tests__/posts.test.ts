/**
 * Tests for lib/posts.ts
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
    const mockNot = jest.fn();

    const queryBuilder: any = {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
        not: mockNot,
        single: mockSingle,
    };

    mockSelect.mockImplementation(() => queryBuilder);
    mockInsert.mockImplementation(() => queryBuilder);
    mockUpdate.mockImplementation(() => queryBuilder);
    mockDelete.mockImplementation(() => queryBuilder);
    mockEq.mockImplementation(() => queryBuilder);
    mockOrder.mockImplementation(() => queryBuilder);
    mockRange.mockImplementation(() => queryBuilder);
    mockNot.mockImplementation(() => queryBuilder);

    return {
        supabase: {
            auth: {
                getUser: jest.fn(),
            },
            from: jest.fn(() => queryBuilder),
        },
    };
});

jest.mock('../image-upload', () => ({
    uploadMultipleImages: jest.fn(),
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
}));

jest.mock('../content-moderation', () => ({
    moderateText: jest.fn(),
    moderatePost: jest.fn(),
    getModerationMessage: jest.fn((cats) => `Moderation Flagged: ${cats?.join(', ')}`),
}));

jest.mock('../block', () => ({
    getBlockedUsers: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../sentry', () => ({
    captureError: jest.fn(),
}));

import { createPost, updatePost, deletePost, fetchPosts, fetchPostById, fetchPostsByUser } from '../posts';
import { supabase } from '../supabase';
import { uploadMultipleImages, uploadImage, deleteImage } from '../image-upload';
import { moderateText, moderatePost } from '../content-moderation';
import { getBlockedUsers } from '../block';

describe('posts service', () => {
    const mockUser = { id: 'user-123' };
    const fromBuilder = supabase.from('posts') as any;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default auth mock
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
        // Setup default moderation mocks
        (moderateText as jest.Mock).mockResolvedValue({ approved: true, flaggedCategories: [] });
        (moderatePost as jest.Mock).mockResolvedValue({ approved: true, flaggedCategories: [] });
    });

    describe('createPost', () => {
        it('throws error if user is not authenticated', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
                error: new Error('Auth error'),
            });

            await expect(createPost({ title: 'My Trip', content: 'Fun times!' })).rejects.toThrow('User not authenticated');
        });

        it('creates post successfully without images', async () => {
            const mockCreatedPost = { id: 'post-1', title: 'My Trip', content: 'Fun times!', user_id: 'user-123' };
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockCreatedPost, error: null });

            const result = await createPost({ title: 'My Trip', content: 'Fun times!' });
            expect(result).toEqual(mockCreatedPost);
            expect(supabase.from).toHaveBeenCalledWith('posts');
            expect(fromBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: 'user-123',
                    title: 'My Trip',
                    content: 'Fun times!',
                })
            );
        });

        it('uploads images and moderation runs for images', async () => {
            const mockCreatedPost = { id: 'post-1', title: 'My Trip', content: 'Fun times!', images: ['url-1', 'url-2'] };
            (uploadMultipleImages as jest.Mock).mockResolvedValueOnce(['url-1', 'url-2']);
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockCreatedPost, error: null });

            const result = await createPost({
                title: 'My Trip',
                content: 'Fun times!',
                images: ['local-uri-1', 'local-uri-2'],
            });

            expect(result).toEqual(mockCreatedPost);
            expect(uploadMultipleImages).toHaveBeenCalledWith(['local-uri-1', 'local-uri-2'], 'posts', 'user-123');
            expect(moderatePost).toHaveBeenCalledWith('', '', ['url-1', 'url-2']);
        });

        it('throws moderation error if text is not approved', async () => {
            (moderateText as jest.Mock).mockResolvedValueOnce({ approved: false, flaggedCategories: ['Violence'] });

            await expect(createPost({ title: 'Violent Post', content: 'Bad content!' })).rejects.toThrow('Moderation Flagged: Violence');
        });

        it('cleans up uploaded images if database insert fails', async () => {
            (uploadMultipleImages as jest.Mock).mockResolvedValueOnce(['url-1']);
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: null, error: new Error('Db error') });

            await expect(createPost({ title: 'My Trip', content: 'Fun times!', images: ['local-uri'] })).rejects.toThrow('Db error');
            expect(deleteImage).toHaveBeenCalledWith('url-1', 'posts');
        });

        it('deletes post and images if image moderation fails', async () => {
            const mockCreatedPost = { id: 'post-1', images: ['url-1'] };
            (uploadMultipleImages as jest.Mock).mockResolvedValueOnce(['url-1']);
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockCreatedPost, error: null });
            (moderatePost as jest.Mock).mockResolvedValueOnce({ approved: false, flaggedCategories: ['Adult'] });

            await expect(createPost({ title: 'My Trip', content: 'Fun times!', images: ['local-uri'] })).rejects.toThrow('Moderation Flagged: Adult');
            expect(fromBuilder.delete).toHaveBeenCalled();
            expect(fromBuilder.eq).toHaveBeenCalledWith('id', 'post-1');
            expect(deleteImage).toHaveBeenCalledWith('url-1', 'posts');
        });
    });

    describe('updatePost', () => {
        it('updates text fields and handles new images', async () => {
            const mockOldPost = { id: 'post-1', images: ['old-url'] };
            const mockUpdatedPost = { id: 'post-1', title: 'New Title', images: ['old-url', 'new-url'] };

            // Fetch old post images mock
            (fromBuilder.single as jest.Mock)
                .mockResolvedValueOnce({ data: mockOldPost, error: null }) // for fetch old
                .mockResolvedValueOnce({ data: mockUpdatedPost, error: null }); // for update result

            (uploadImage as jest.Mock).mockResolvedValueOnce('new-url');

            const result = await updatePost('post-1', {
                title: 'New Title',
                images: ['old-url', 'local-new-uri'],
            });

            expect(result).toEqual(mockUpdatedPost);
            expect(uploadImage).toHaveBeenCalledWith('local-new-uri', 'posts', 'user-123');
            expect(deleteImage).not.toHaveBeenCalled();
        });

        it('deletes removed images from storage', async () => {
            const mockOldPost = { id: 'post-1', images: ['old-url-1', 'old-url-2'] };
            const mockUpdatedPost = { id: 'post-1', images: ['old-url-1'] };

            (fromBuilder.single as jest.Mock)
                .mockResolvedValueOnce({ data: mockOldPost, error: null })
                .mockResolvedValueOnce({ data: mockUpdatedPost, error: null });

            await updatePost('post-1', { images: ['old-url-1'] });
            expect(deleteImage).toHaveBeenCalledWith('old-url-2', 'posts');
        });
    });

    describe('deletePost', () => {
        it('fetches post, deletes storage images, and deletes record', async () => {
            const mockPost = { id: 'post-1', images: ['url-1'] };
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockPost, error: null });
            (fromBuilder.delete as jest.Mock).mockReturnValue({
                eq: jest.fn(() => ({
                    eq: jest.fn(() => Promise.resolve({ error: null })),
                })),
            });

            await deletePost('post-1');
            expect(deleteImage).toHaveBeenCalledWith('url-1', 'posts');
            expect(fromBuilder.delete).toHaveBeenCalled();
        });
    });

    describe('fetchPosts', () => {
        it('includes profile data and filters blocked users', async () => {
            (getBlockedUsers as jest.Mock).mockResolvedValueOnce(['blocked-user-1']);
            const mockPosts = [{ id: 'post-1', user_id: 'user-2' }];
            (fromBuilder.range as jest.Mock).mockResolvedValueOnce({ data: mockPosts, error: null });

            const result = await fetchPosts(0, 10);
            expect(result).toEqual(mockPosts);
            expect(fromBuilder.not).toHaveBeenCalledWith('user_id', 'in', '(blocked-user-1)');
            expect(fromBuilder.range).toHaveBeenCalledWith(0, 9);
        });
    });

    describe('fetchPostById', () => {
        it('queries single post by id', async () => {
            const mockPost = { id: 'post-1' };
            (fromBuilder.single as jest.Mock).mockResolvedValueOnce({ data: mockPost, error: null });

            const result = await fetchPostById('post-1');
            expect(result).toEqual(mockPost);
            expect(fromBuilder.eq).toHaveBeenCalledWith('id', 'post-1');
        });
    });

    describe('fetchPostsByUser', () => {
        it('queries posts by user id', async () => {
            const mockPosts = [{ id: 'post-1', user_id: 'user-123' }];
            (fromBuilder.range as jest.Mock).mockResolvedValueOnce({ data: mockPosts, error: null });

            const result = await fetchPostsByUser('user-123', 0, 10);
            expect(result).toEqual(mockPosts);
            expect(fromBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
        });
    });
});
