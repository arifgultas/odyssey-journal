import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Consent to send post and comment content to OpenAI's moderation API.
 *
 * App Store guideline 5.1.2(i) asks for explicit permission, naming the provider, before any
 * personal data reaches a third-party AI. The moderation call itself goes through the
 * `moderate-content` edge function (lib/content-moderation.ts); this only records whether the
 * reader agreed to it. Stored per account and per device: a new device asks again, which errs
 * on the side of asking.
 */
const keyFor = (userId: string) => `odyssey_ai_moderation_consent:${userId}`;

export async function hasAiConsent(userId: string): Promise<boolean> {
    try {
        return (await AsyncStorage.getItem(keyFor(userId))) === 'granted';
    } catch {
        return false;
    }
}

export async function setAiConsent(userId: string, granted: boolean): Promise<void> {
    if (granted) {
        await AsyncStorage.setItem(keyFor(userId), 'granted');
    } else {
        await AsyncStorage.removeItem(keyFor(userId));
    }
}
