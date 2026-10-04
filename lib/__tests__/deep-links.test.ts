import { mapAppLink } from '../deep-links';

describe('app links', () => {
    it('maps the site banner link to the post screen', () => {
        expect(mapAppLink('odysseyjournal://post/abc-123')).toBe('/post-detail/abc-123');
        expect(mapAppLink('/post/abc-123')).toBe('/post-detail/abc-123');
    });

    it('maps users and collections', () => {
        expect(mapAppLink('odysseyjournal://user/u1')).toBe('/user-profile/u1');
        expect(mapAppLink('odysseyjournal://collection/c1?x=1')).toBe('/collection/c1');
    });

    it('leaves every other link alone (password reset carries its tokens)', () => {
        const reset = 'odysseyjournal://reset-password#access_token=t&type=recovery';
        expect(mapAppLink(reset)).toBe(reset);
        expect(mapAppLink('/post-detail/abc')).toBe('/post-detail/abc');
        expect(mapAppLink('odysseyjournal://post/')).toBe('odysseyjournal://post/');
    });
});
