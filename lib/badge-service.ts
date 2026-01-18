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
        name: 'İlk Macera',
        icon: 'walk-outline',
        requirement: 'İlk postunu paylaş',
        checkUnlocked: (stats) => stats.postsCount >= 1,
        getProgress: (stats) => Math.min(stats.postsCount * 100, 100),
    },
    {
        id: 'world-traveler',
        name: 'Dünya Gezgini',
        icon: 'globe-outline',
        requirement: '5 farklı ülkeyi ziyaret et',
        checkUnlocked: (stats) => stats.countriesVisited >= 5,
        getProgress: (stats) => Math.min((stats.countriesVisited / 5) * 100, 100),
        getCount: (stats) => stats.countriesVisited,
        featured: true,
    },
    {
        id: 'photographer',
        name: 'Fotoğraf Ustası',
        icon: 'camera-outline',
        requirement: '10 fotoğraflı post paylaş',
        checkUnlocked: (stats) => stats.postsCount >= 10,
        getProgress: (stats) => Math.min((stats.postsCount / 10) * 100, 100),
    },
    {
        id: 'gourmet',
        name: 'Gurme',
        icon: 'restaurant-outline',
        requirement: 'Yemek kategorisiyle 3 post paylaş',
        checkUnlocked: (_stats) => false, // Requires category tracking - future feature
        getProgress: (_stats) => 0,
    },
    {
        id: 'marathon-traveler',
        name: 'Maraton Gezgin',
        icon: 'fitness-outline',
        requirement: '10.000 km seyahat et',
        checkUnlocked: (stats) => stats.totalDistanceKm >= 10000,
        getProgress: (stats) => Math.min((stats.totalDistanceKm / 10000) * 100, 100),
    },
    {
        id: 'explorer',
        name: 'Kaşif',
        icon: 'compass-outline',
        requirement: '30 gün seyahat et',
        checkUnlocked: (stats) => stats.travelDays >= 30,
        getProgress: (stats) => Math.min((stats.travelDays / 30) * 100, 100),
    },
];

/**
 * Calculate badges based on user's profile statistics
 */
export function calculateBadges(stats: ProfileStats | null | undefined): Badge[] {
    if (!stats) {
        // Return all badges as locked if no stats available
        return BADGE_DEFINITIONS.map((def) => ({
            id: def.id,
            name: def.name,
            icon: def.icon,
            unlocked: false,
            progress: 0,
            featured: def.featured || false,
            requirement: def.requirement,
        }));
    }

    return BADGE_DEFINITIONS.map((def) => ({
        id: def.id,
        name: def.name,
        icon: def.icon,
        unlocked: def.checkUnlocked(stats),
        progress: Math.round(def.getProgress(stats)),
        featured: def.featured || false,
        count: def.getCount?.(stats),
        requirement: def.requirement,
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
