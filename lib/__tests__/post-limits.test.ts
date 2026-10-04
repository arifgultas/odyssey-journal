import { MAX_IMAGES_PER_POST, remainingImageSlots } from '../post-limits';

describe('photo limit', () => {
    it('is five, as the site and the store listing say', () => {
        expect(MAX_IMAGES_PER_POST).toBe(5);
    });

    it('counts the photos already on the post', () => {
        expect(remainingImageSlots(0)).toBe(5);
        expect(remainingImageSlots(3)).toBe(2);
    });

    // expo-image-picker reads selectionLimit 0 as "no limit", so a full post must report 0 and
    // the caller must not open the picker at all
    it('never goes negative', () => {
        expect(remainingImageSlots(5)).toBe(0);
        expect(remainingImageSlots(7)).toBe(0);
    });
});
