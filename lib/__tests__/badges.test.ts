import { calculateBadges } from '../badge-service';
import type { ProfileStats } from '../types/profile';

const stats = (overrides: Partial<ProfileStats>): ProfileStats => ({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    countriesVisited: 0,
    totalDistanceKm: 0,
    foodPostsCount: 0,
    photoPostsCount: 0,
    travelDays: 0,
    visitedLocations: [],
    ...overrides,
});

const badge = (s: ProfileStats, id: string) => calculateBadges(s).find((b) => b.id === id)!;

describe('badges', () => {
    it('Gourmet unlocks at three food posts', () => {
        expect(badge(stats({ foodPostsCount: 2 }), 'gourmet')).toMatchObject({ unlocked: false, progress: 67 });
        expect(badge(stats({ foodPostsCount: 3 }), 'gourmet').unlocked).toBe(true);
    });

    it('Photographer counts posts with photos, not every post', () => {
        expect(badge(stats({ postsCount: 12, photoPostsCount: 9 }), 'photographer').unlocked).toBe(false);
        expect(badge(stats({ postsCount: 10, photoPostsCount: 10 }), 'photographer').unlocked).toBe(true);
    });
});
