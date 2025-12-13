export interface Category {
    id: string;
    name: string;
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
        id: 'adventure',
        name: 'Adventure',
        icon: 'trail-sign',
        color: '#FF6B6B',
    },
    {
        id: 'beach',
        name: 'Beach',
        icon: 'water',
        color: '#4ECDC4',
    },
    {
        id: 'city',
        name: 'City',
        icon: 'business',
        color: '#95E1D3',
    },
    {
        id: 'nature',
        name: 'Nature',
        icon: 'leaf',
        color: '#38A169',
    },
    {
        id: 'culture',
        name: 'Culture',
        icon: 'library',
        color: '#9B59B6',
    },
    {
        id: 'food',
        name: 'Food',
        icon: 'restaurant',
        color: '#F39C12',
    },
    {
        id: 'mountain',
        name: 'Mountain',
        icon: 'triangle',
        color: '#8B4513',
    },
    {
        id: 'wildlife',
        name: 'Wildlife',
        icon: 'paw',
        color: '#27AE60',
    },
];
