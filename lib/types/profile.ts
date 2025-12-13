export interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    updated_at: string | null;
}

export interface ProfileStats {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    countriesVisited: number;
}

export interface ProfileWithStats extends Profile {
    stats: ProfileStats;
    isFollowing?: boolean;
}

export interface UpdateProfileData {
    username?: string;
    full_name?: string;
    bio?: string;
    website?: string;
    avatar_url?: string;
}
