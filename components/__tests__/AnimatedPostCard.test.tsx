import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimatedPostCard } from '../animated-post-card';
import { Post } from '@/lib/posts';

// Mock hook
jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

// Mock Ionicons dynamically to render their name so we can find specific icons in tests
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        Ionicons: ({ name }: any) => <Text>{name}</Text>,
    };
});

// Mock subcomponents for isolated testing
jest.mock('../animated-bookmark-button', () => ({
    AnimatedBookmarkButton: ({ isBookmarked, onToggle }: any) => {
        const React = require('react');
        const { TouchableOpacity, Text } = require('react-native');
        return (
            <TouchableOpacity onPress={onToggle}>
                <Text>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</Text>
            </TouchableOpacity>
        );
    },
}));

jest.mock('../animated-like-button', () => ({
    AnimatedLikeButton: ({ isLiked, likesCount, onPress }: any) => {
        const React = require('react');
        const { TouchableOpacity, Text } = require('react-native');
        return (
            <TouchableOpacity onPress={onPress}>
                <Text>{isLiked ? 'Liked' : 'Like'} ({likesCount})</Text>
            </TouchableOpacity>
        );
    },
}));

jest.mock('../image-carousel', () => ({
    ImageCarousel: ({ onImageLoad }: any) => {
        const React = require('react');
        const { View, Button } = require('react-native');
        return (
            <View testID="image-carousel">
                <Button title="Load Image" onPress={onImageLoad} />
            </View>
        );
    },
}));

describe('AnimatedPostCard Component', () => {
    const mockPost: Post = {
        id: 'post-1',
        user_id: 'user-123',
        title: 'Amazing Adventure',
        content: 'Had a wonderful time exploring the ancient ruins!',
        location: {
            latitude: 41.0082,
            longitude: 28.9784,
            city: 'Istanbul',
            country: 'Turkey',
        },
        images: ['http://example.com/ruins.jpg'],
        created_at: '2026-06-08T12:00:00Z',
        updated_at: '2026-06-08T12:00:00Z',
        likes_count: 5,
        comments_count: 2,
        profiles: {
            id: 'user-123',
            username: 'alice_explorer',
            full_name: 'Alice Explorer',
            avatar_url: 'http://example.com/alice.jpg',
        },
        isLiked: false,
        isBookmarked: false,
    };

    it('renders post content and formatted location details', () => {
        const { getByText } = render(
            <AnimatedPostCard post={mockPost} />
        );

        expect(getByText('Istanbul, TU')).toBeTruthy();
        expect(getByText('Alice Explorer')).toBeTruthy();
        expect(getByText('Had a wonderful time exploring the ancient ruins!')).toBeTruthy();
    });

    it('triggers callback and updates state on Like click', () => {
        const mockLike = jest.fn();
        const { getByText } = render(
            <AnimatedPostCard post={mockPost} onLike={mockLike} />
        );

        const likeBtn = getByText('Like (5)');
        fireEvent.press(likeBtn);

        expect(getByText('Liked (6)')).toBeTruthy();
        expect(mockLike).toHaveBeenCalledWith('post-1', true);
    });

    it('triggers callback and updates state on Bookmark click', () => {
        const mockBookmark = jest.fn();
        const { getByText } = render(
            <AnimatedPostCard post={mockPost} onBookmark={mockBookmark} />
        );

        const bookmarkBtn = getByText('Bookmark');
        fireEvent.press(bookmarkBtn);

        expect(getByText('Bookmarked')).toBeTruthy();
        expect(mockBookmark).toHaveBeenCalledWith('post-1', true);
    });

    it('triggers callback on Comment click', () => {
        const mockComment = jest.fn();
        const { getByText } = render(
            <AnimatedPostCard post={mockPost} onComment={mockComment} />
        );

        const commentBtn = getByText('2');
        fireEvent.press(commentBtn);

        expect(mockComment).toHaveBeenCalledTimes(1);
    });

    it('shows and handles Delete action menu for own post', () => {
        const mockDelete = jest.fn();
        const { getByText, queryByText } = render(
            <AnimatedPostCard post={mockPost} isOwnPost={true} onDelete={mockDelete} />
        );

        // Menu should be hidden initially
        expect(queryByText('Delete Post')).toBeNull();

        // Click ellipsis to toggle menu
        const menuToggle = getByText('ellipsis-horizontal');
        fireEvent.press(menuToggle);

        // Menu should be visible now
        const deleteBtn = getByText('Delete Post');
        expect(deleteBtn).toBeTruthy();

        // Click delete
        fireEvent.press(deleteBtn);
        expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('shows and handles Report action menu for other users posts', () => {
        const mockReport = jest.fn();
        const { getByText, queryByText } = render(
            <AnimatedPostCard post={mockPost} isOwnPost={false} onReport={mockReport} />
        );

        // Menu should be hidden initially
        expect(queryByText('Report Post')).toBeNull();

        // Click ellipsis to toggle menu
        const menuToggle = getByText('ellipsis-horizontal');
        fireEvent.press(menuToggle);

        // Menu should be visible now
        const reportBtn = getByText('Report Post');
        expect(reportBtn).toBeTruthy();

        // Click report
        fireEvent.press(reportBtn);
        expect(mockReport).toHaveBeenCalledTimes(1);
    });
});
