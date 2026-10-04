import type { ImageSourcePropType } from 'react-native';

// A post without photos needs a cover on the screens built around one. It used to be a stock
// Unsplash photo - on the post page a stranger's portrait, as if it were the author. The app's own
// landscape is neutral and needs no network.
const PLACEHOLDER_COVER: ImageSourcePropType = require('@/assets/images/onboarding-cappadocia.jpg');

export function postCoverSource(images?: string[] | null): ImageSourcePropType {
    const first = images?.[0];
    return first ? { uri: first } : PLACEHOLDER_COVER;
}
