import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const ONBOARDING_COMPLETE_KEY = 'odyssey_onboarding_complete';

export function useOnboarding() {
    const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
            setIsOnboardingComplete(value === 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setIsOnboardingComplete(false);
        } finally {
            setIsLoading(false);
        }
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            setIsOnboardingComplete(true);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
            setIsOnboardingComplete(false);
        } catch (error) {
            console.error('Error resetting onboarding status:', error);
        }
    };

    return {
        isOnboardingComplete,
        isLoading,
        completeOnboarding,
        resetOnboarding,
    };
}
