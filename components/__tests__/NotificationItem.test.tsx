import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationItem } from '../notification-item';
import { Notification } from '@/lib/notifications';

// Mock hook
jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

// Mock i18n
jest.mock('@/lib/i18n', () => ({
    t: (key: string, options?: any) => {
        if (options && options.postTitle) {
            return `${key} (postTitle: ${options.postTitle})`;
        }
        return key;
    },
}));

describe('NotificationItem Component', () => {
    const baseNotification: Notification = {
        id: 'not-1',
        user_id: 'user-123',
        actor_id: 'actor-456',
        type: 'like',
        post_id: 'post-789',
        read: false,
        created_at: new Date().toISOString(),
        actor_username: 'janedoe',
        actor_full_name: 'Jane Doe',
        actor_avatar_url: 'http://example.com/avatar.jpg',
        post_title: 'My Journey',
        post_images: ['http://example.com/image.jpg'],
    };

    it('renders unread notification correctly with details', () => {
        const { getByText } = render(
            <NotificationItem notification={baseNotification} />
        );

        // Jane Doe is actor_full_name, should be used for actor name
        // t('notifications.likedPost') mock is 'notifications.likedPost (postTitle: My Journey)'
        expect(getByText('Jane Doe notifications.likedPost (postTitle: My Journey)')).toBeTruthy();
        expect(getByText('"My Journey"')).toBeTruthy();
    });

    it('renders fallback username when full name is missing', () => {
        const notificationWithoutFullName: Notification = {
            ...baseNotification,
            actor_full_name: null,
        };

        const { getByText } = render(
            <NotificationItem notification={notificationWithoutFullName} />
        );

        expect(getByText('janedoe notifications.likedPost (postTitle: My Journey)')).toBeTruthy();
    });

    it('renders fallback translation if both full name and username are missing', () => {
        const anonymousNotification: Notification = {
            ...baseNotification,
            actor_full_name: null,
            actor_username: null,
        };

        const { getByText } = render(
            <NotificationItem notification={anonymousNotification} />
        );

        expect(getByText('notifications.someone notifications.likedPost (postTitle: My Journey)')).toBeTruthy();
    });

    it('handles interaction when pressed', () => {
        const mockPress = jest.fn();
        const { getByText } = render(
            <NotificationItem notification={baseNotification} onPress={mockPress} />
        );

        // TouchableOpacity maps to generic link or button role in tests usually, 
        // or we can find by message text and fireEvent
        const card = getByText('"My Journey"');
        fireEvent.press(card);

        expect(mockPress).toHaveBeenCalledTimes(1);
    });
});
