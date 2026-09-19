/**
 * Push Notification Service
 * Handles Expo Push Notifications registration, permissions, and token management
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and return the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    // Get project ID for Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId as string,
        });

        // Configure Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#D4A574',
            });
        }

        return tokenData.data;
    } catch (error) {
        return null;
    }
}

/**
 * Save this device's push token for the signed-in user
 */
export async function savePushToken(token: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Tokens live in push_tokens, which only their owner can read (030_security_fixes.sql)
        const { error } = await supabase.rpc('set_push_token', { p_token: token });

        return !error;
    } catch {
        return false;
    }
}

/**
 * Remove the signed-in user's push token (on logout)
 */
export async function removePushToken(): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.rpc('clear_push_token');

        return !error;
    } catch {
        return false;
    }
}

/**
 * Set the app badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
    try {
        await Notifications.setBadgeCountAsync(count);
    } catch {
        // Silently fail if badge is not supported
    }
}
