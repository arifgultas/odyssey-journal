import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type Follow = Database['public']['Tables']['follows']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

/**
 * Mock user data
 */
export const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    full_name: 'Test User',
    bio: 'This is a test user bio',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

export const mockUser2: User = {
    id: 'user-2',
    email: 'test2@example.com',
    username: 'testuser2',
    full_name: 'Test User 2',
    bio: 'Another test user',
    avatar_url: 'https://example.com/avatar2.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock post data
 */
export const mockPost: Post = {
    id: 'post-1',
    user_id: 'user-1',
    title: 'Test Post',
    content: 'This is a test post content',
    images: ['https://example.com/image1.jpg'],
    location: {
        latitude: 40.7128,
        longitude: -74.006,
        address: 'New York, NY',
    },
    likes_count: 10,
    comments_count: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

export const mockPostWithMultipleImages: Post = {
    ...mockPost,
    id: 'post-2',
    images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
    ],
};

/**
 * Mock comment data
 */
export const mockComment: Comment = {
    id: 'comment-1',
    post_id: 'post-1',
    user_id: 'user-2',
    content: 'This is a test comment',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock follow data
 */
export const mockFollow: Follow = {
    id: 'follow-1',
    follower_id: 'user-1',
    following_id: 'user-2',
    created_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock notification data
 */
export const mockNotification: Notification = {
    id: 'notification-1',
    user_id: 'user-1',
    type: 'like',
    content: 'Test User 2 liked your post',
    post_id: 'post-1',
    from_user_id: 'user-2',
    read: false,
    created_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock post with user data (joined query result)
 */
export const mockPostWithUser = {
    ...mockPost,
    users: mockUser,
    is_liked: false,
    is_bookmarked: false,
};

/**
 * Mock comment with user data (joined query result)
 */
export const mockCommentWithUser = {
    ...mockComment,
    users: mockUser2,
};

/**
 * Mock arrays for list testing
 */
export const mockPosts = [
    mockPost,
    mockPostWithMultipleImages,
    { ...mockPost, id: 'post-3', title: 'Another Post' },
];

export const mockComments = [
    mockComment,
    { ...mockComment, id: 'comment-2', content: 'Another comment' },
    { ...mockComment, id: 'comment-3', content: 'Third comment' },
];

export const mockUsers = [mockUser, mockUser2];

/**
 * Mock Supabase response
 */
export const createMockSupabaseResponse = <T,>(data: T) => ({
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
});

export const createMockSupabaseError = (message: string) => ({
    data: null,
    error: {
        message,
        details: '',
        hint: '',
        code: 'ERROR',
    },
    count: null,
    status: 400,
    statusText: 'Bad Request',
});

/**
 * Mock image picker result
 */
export const mockImagePickerResult = {
    canceled: false,
    assets: [
        {
            uri: 'file:///path/to/image.jpg',
            width: 1920,
            height: 1080,
            type: 'image',
        },
    ],
};

/**
 * Mock location result
 */
export const mockLocationResult = {
    coords: {
        latitude: 40.7128,
        longitude: -74.006,
        altitude: null,
        accuracy: 5,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
    },
    timestamp: Date.now(),
};
