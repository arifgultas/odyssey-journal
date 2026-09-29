import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const ONBOARDING_COMPLETE_KEY = 'odyssey_onboarding_complete';

/*
 * Read once at startup and kept in memory. The splash screen waits for it (SplashGate in
 * app/_layout.tsx), so app/index.tsx can redirect on its very first render, the way it did before
 * the flag existed. Redirecting after an async read instead would replace whatever a deep link had
 * pushed in the meantime.
 */
let cached: boolean | null = null;
const loaded: Promise<boolean> = AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
    .then((value) => value === 'true')
    .catch(() => false)
    .then((complete) => {
        // markOnboardingComplete may have run while the read was in flight
        cached = cached === true || complete;
        return cached;
    });

/** Marks onboarding as seen; also used for people who were signed in before the flag existed. */
export async function markOnboardingComplete() {
    if (cached === true) return;
    cached = true;
    try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
        console.error('Error saving onboarding status:', error);
    }
}

/** True once the stored flag has been read; the splash screen stays up until then. */
export function useOnboardingLoaded() {
    const [isLoaded, setIsLoaded] = useState(cached !== null);
    useEffect(() => {
        if (!isLoaded) loaded.then(() => setIsLoaded(true));
    }, [isLoaded]);
    return isLoaded;
}

export function useOnboarding() {
    const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(cached);

    useEffect(() => {
        if (isOnboardingComplete === null) loaded.then(setIsOnboardingComplete);
    }, [isOnboardingComplete]);

    const completeOnboarding = async () => {
        setIsOnboardingComplete(true);
        await markOnboardingComplete();
    };

    const resetOnboarding = async () => {
        cached = false;
        setIsOnboardingComplete(false);
        try {
            await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
        } catch (error) {
            console.error('Error resetting onboarding status:', error);
        }
    };

    return {
        isOnboardingComplete,
        isLoading: isOnboardingComplete === null,
        completeOnboarding,
        resetOnboarding,
    };
}
