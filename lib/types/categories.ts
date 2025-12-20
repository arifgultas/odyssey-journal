export interface Category {
    id: string;
    name: string;
    nameTr: string;
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
        name: 'Nature',
        nameTr: 'Doğa',
        icon: 'leaf',
        color: '#38A169',
    },
    {
        id: 'city',
        name: 'City',
        nameTr: 'Şehir',
        icon: 'business',
        color: '#95E1D3',
    },
    {
        id: 'food',
        name: 'Food',
        nameTr: 'Yemek',
        icon: 'restaurant',
        color: '#F39C12',
    },
    {
        id: 'culture',
        name: 'Culture',
        nameTr: 'Tarih',
        icon: 'library',
        color: '#9B59B6',
    },
    {
        id: 'art',
        name: 'Art',
        nameTr: 'Sanat',
        icon: 'color-palette',
        color: '#E91E63',
    },
    {
        id: 'adventure',
        name: 'Adventure',
        nameTr: 'Macera',
        icon: 'trail-sign',
        color: '#FF6B6B',
    },
    {
        id: 'beach',
        name: 'Beach',
        nameTr: 'Plaj',
        icon: 'water',
        color: '#4ECDC4',
    },
    {
        id: 'mountain',
        name: 'Mountain',
        nameTr: 'Dağ',
        icon: 'triangle',
        color: '#8B4513',
    },
];

