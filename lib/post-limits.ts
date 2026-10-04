/**
 * Photos per post. The website and the store listing say five, and the picker, the camera, the
 * upload and post editing all enforce the same number.
 */
export const MAX_IMAGES_PER_POST = 5;

/** How many more photos fit next to the ones already on the post (never negative). */
export function remainingImageSlots(currentCount: number, max: number = MAX_IMAGES_PER_POST): number {
    return Math.max(0, max - currentCount);
}
