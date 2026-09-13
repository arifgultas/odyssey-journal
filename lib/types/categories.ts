/**
 * A travel category. The display label is not stored here on purpose: it comes from
 * the `categories.<id>` translation key so every supported language is covered.
 */
export interface Category {
    id: string;
    icon: string;
    color: string;
    postCount?: number;
}

export interface Tag {
    id: string;
    name: string;
    postCount: number;
    trending?: boolean;
}

export const TRAVEL_CATEGORIES: Category[] = [
    {
        id: 'nature',
        icon: 'leaf',
        color: '#38A169',
    },
    {
        id: 'city',
        icon: 'business',
        color: '#95E1D3',
    },
    {
        id: 'food',
        icon: 'restaurant',
        color: '#F39C12',
    },
    {
        id: 'history',
        icon: 'hourglass',
        color: '#8B7355',
    },
    {
        id: 'culture',
        icon: 'library',
        color: '#9B59B6',
    },
    {
        id: 'art',
        icon: 'color-palette',
        color: '#E91E63',
    },
    {
        id: 'adventure',
        icon: 'trail-sign',
        color: '#FF6B6B',
    },
    {
        id: 'beach',
        icon: 'water',
        color: '#4ECDC4',
    },
    {
        id: 'mountain',
        icon: 'triangle',
        color: '#8B4513',
    },
];

