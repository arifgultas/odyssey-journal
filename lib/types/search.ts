export interface SearchFilters {
    location?: string;
    tags?: string[];
    username?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'recent' | 'popular' | 'trending';
}

export interface SearchResult {
    posts: any[];
    users: any[];
    locations: LocationResult[];
}

export interface LocationResult {
    name: string;
    country?: string;
    city?: string;
    postCount: number;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface TrendingLocation extends LocationResult {
    trendScore: number;
    recentPostCount: number;
}

export interface RecommendedPlace {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    location: {
        city?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
    };
    postCount: number;
    rating?: number;
}

export interface SearchHistoryItem {
    id: string;
    query: string;
    type: 'location' | 'username' | 'tag';
    timestamp: string;
    userId: string;
}
