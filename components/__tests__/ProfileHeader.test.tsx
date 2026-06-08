import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileHeader } from '../profile-header';
import { Profile } from '@/lib/types/profile';

// Mock hook
jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

describe('ProfileHeader Component', () => {
    const mockProfile: Profile = {
        id: 'user-123',
        username: 'traveler_bob',
        full_name: 'Bob Traveler',
        avatar_url: 'http://example.com/avatar.jpg',
        bio: 'Wanderlust explorer.',
        website: 'bobtravels.com',
        updated_at: '2026-06-08T12:00:00Z',
    };

    it('renders profile details correctly', () => {
        const { getByText } = render(
            <ProfileHeader profile={mockProfile} />
        );

        expect(getByText('Bob Traveler')).toBeTruthy();
        expect(getByText('@traveler_bob')).toBeTruthy();
        expect(getByText('Wanderlust explorer.')).toBeTruthy();
        expect(getByText('bobtravels.com')).toBeTruthy();
    });

    it('renders Edit Profile button when isCurrentUser is true', () => {
        const mockEditPress = jest.fn();
        const { getByText, queryByText } = render(
            <ProfileHeader 
                profile={mockProfile} 
                isCurrentUser={true} 
                onEditPress={mockEditPress} 
            />
        );

        expect(getByText('Edit Profile')).toBeTruthy();
        expect(queryByText('Follow')).toBeNull();
        expect(queryByText('Following')).toBeNull();

        fireEvent.press(getByText('Edit Profile'));
        expect(mockEditPress).toHaveBeenCalledTimes(1);
    });

    it('renders Follow button when isCurrentUser is false and not following', () => {
        const mockFollowPress = jest.fn();
        const { getByText, queryByText } = render(
            <ProfileHeader 
                profile={mockProfile} 
                isCurrentUser={false} 
                isFollowing={false} 
                onFollowPress={mockFollowPress} 
            />
        );

        expect(getByText('Follow')).toBeTruthy();
        expect(queryByText('Edit Profile')).toBeNull();

        fireEvent.press(getByText('Follow'));
        expect(mockFollowPress).toHaveBeenCalledTimes(1);
    });

    it('renders Following button when isCurrentUser is false and following', () => {
        const mockFollowPress = jest.fn();
        const { getByText, queryByText } = render(
            <ProfileHeader 
                profile={mockProfile} 
                isCurrentUser={false} 
                isFollowing={true} 
                onFollowPress={mockFollowPress} 
            />
        );

        expect(getByText('Following')).toBeTruthy();
        expect(queryByText('Edit Profile')).toBeNull();

        fireEvent.press(getByText('Following'));
        expect(mockFollowPress).toHaveBeenCalledTimes(1);
    });

    it('renders initials fallback if avatar_url is missing', () => {
        const profileWithoutAvatar: Profile = {
            ...mockProfile,
            avatar_url: null,
        };

        const { getByText } = render(
            <ProfileHeader profile={profileWithoutAvatar} />
        );

        expect(getByText('B')).toBeTruthy(); // First letter of Bob
    });
});
