const mockLikes = jest.fn();
const mockBookmarks = jest.fn();

jest.mock('../supabase', () => ({
    supabase: {
        auth: { getUser: jest.fn(async () => ({ data: { user: { id: 'me' } } })) },
        from: jest.fn((table: string) => {
            const result = table === 'likes' ? mockLikes() : mockBookmarks();
            const builder: any = {
                select: () => builder,
                eq: () => builder,
                in: () => Promise.resolve(result),
            };
            return builder;
        }),
    },
}));

import { populateInteractions } from '../post-interactions';

describe('populateInteractions', () => {
    it('marks the posts the user has liked and saved', async () => {
        mockLikes.mockReturnValue({ data: [{ post_id: 'a' }] });
        mockBookmarks.mockReturnValue({ data: [{ post_id: 'b' }] });

        const posts = await populateInteractions([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

        expect(posts.map((p) => [p.id, p.isLiked, p.isBookmarked])).toEqual([
            ['a', true, false],
            ['b', false, true],
            ['c', false, false],
        ]);
    });

    it('returns an empty list without querying', async () => {
        expect(await populateInteractions([])).toEqual([]);
    });
});
