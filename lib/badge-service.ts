/**
 * Badge Service
 * Determines badge unlock status based on user's travel statistics
 */

import type { ProfileStats } from './types/profile';

export interface Badge {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
    progress: number; // 0-100
    featured: boolean;
    count?: number;
    requirement: string;
}

interface BadgeDefinition {
    id: string;
    name: string;
    icon: string;
    requirement: string;
    checkUnlocked: (stats: ProfileStats) => boolean;
    getProgress: (stats: ProfileStats) => number;
    getCount?: (stats: ProfileStats) => number;
    featured?: boolean;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
    {
        id: 'first-adventure',
        name: 'First Adventure',
        icon: 'walk-outline',
        requirement: 'Share your first post',
        checkUnlocked: (stats) => stats.postsCount >= 1,
        getProgress: (stats) => Math.min(stats.postsCount * 100, 100),
    },
    {
        id: 'world-traveler',
        name: 'World Traveler',
        icon: 'globe-outline',
        requirement: 'Visit 5 different countries',
        checkUnlocked: (stats) => stats.countriesVisited >= 5,
        getProgress: (stats) => Math.min((stats.countriesVisited / 5) * 100, 100),
        getCount: (stats) => stats.countriesVisited,
        featured: true,
    },
    {
        id: 'photographer',
        name: 'Photographer',
        icon: 'camera-outline',
        requirement: 'Share 10 posts with photos',
        checkUnlocked: (stats) => stats.postsCount >= 10,
        getProgress: (stats) => Math.min((stats.postsCount / 10) * 100, 100),
    },
    {
        id: 'gourmet',
        name: 'Gourmet',
        icon: 'restaurant-outline',
        requirement: 'Share 3 posts in the food category',
        checkUnlocked: (_stats) => false, // Requires category tracking - future feature
        getProgress: (_stats) => 0,
    },
    {
        id: 'marathon-traveler',
        name: 'Marathon Traveler',
        icon: 'fitness-outline',
        requirement: 'Travel 10,000 km',
        checkUnlocked: (stats) => stats.totalDistanceKm >= 10000,
        getProgress: (stats) => Math.min((stats.totalDistanceKm / 10000) * 100, 100),
    },
    {
        id: 'explorer',
        name: 'Explorer',
        icon: 'compass-outline',
        requirement: 'Travel for 30 days',
        checkUnlocked: (stats) => stats.travelDays >= 30,
        getProgress: (stats) => Math.min((stats.travelDays / 30) * 100, 100),
    },
];

export const BADGE_I18N_MAP: Record<string, string> = {
    'first-adventure': 'firstAdventure',
    'world-traveler': 'worldTraveler',
    'photographer': 'photographer',
    'gourmet': 'gourmet',
    'marathon-traveler': 'marathonTraveler',
    'explorer': 'explorer',
};

/**
 * Calculate badges based on user's profile statistics, with optional i18n translation function
 */
export function calculateBadges(
    stats: ProfileStats | null | undefined,
    t?: (key: string, options?: any) => string
): Badge[] {
    const getName = (def: BadgeDefinition) => {
        if (t) {
            const key = BADGE_I18N_MAP[def.id];
            if (key) return t(`badgeList.${key}.name`, { defaultValue: def.name });
        }
        return def.name;
    };
    const getReq = (def: BadgeDefinition) => {
        if (t) {
            const key = BADGE_I18N_MAP[def.id];
            if (key) return t(`badgeList.${key}.description`, { defaultValue: def.requirement });
        }
        return def.requirement;
    };

    if (!stats) {
        // Return all badges as locked if no stats available
        return BADGE_DEFINITIONS.map((def) => ({
            id: def.id,
            name: getName(def),
            icon: def.icon,
            unlocked: false,
            progress: 0,
            featured: def.featured || false,
            requirement: getReq(def),
        }));
    }

    return BADGE_DEFINITIONS.map((def) => ({
        id: def.id,
        name: getName(def),
        icon: def.icon,
        unlocked: def.checkUnlocked(stats),
        progress: Math.round(def.getProgress(stats)),
        featured: def.featured || false,
        count: def.getCount?.(stats),
        requirement: getReq(def),
    }));
}

/**
 * Get only unlocked badges
 */
export function getUnlockedBadges(stats: ProfileStats | null | undefined): Badge[] {
    return calculateBadges(stats).filter((badge) => badge.unlocked);
}

/**
 * Get featured badge (for display priority)
 */
export function getFeaturedBadge(stats: ProfileStats | null | undefined): Badge | null {
    const badges = calculateBadges(stats);
    return badges.find((badge) => badge.featured && badge.unlocked) || null;
}
