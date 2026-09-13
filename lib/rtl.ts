/**
 * Right-to-left helpers.
 *
 * React Native mirrors layout under I18nManager.forceRTL, but an icon is just a glyph -
 * a back arrow keeps pointing left in Arabic unless something swaps it. These are the only
 * icons in the app whose meaning is "the way you came from" or "the way you are going",
 * so they are the only ones that flip.
 */
import { I18nManager } from 'react-native';

// Ionicons and MaterialIcons happen to use the same names for these, but they are separate
// name unions, so the helper is generic: it hands each icon set back its own type.
const MIRRORED: Record<string, string> = {
    'arrow-back': 'arrow-forward',
    'arrow-forward': 'arrow-back',
    'arrow-back-outline': 'arrow-forward-outline',
    'arrow-forward-outline': 'arrow-back-outline',
    'chevron-back': 'chevron-forward',
    'chevron-forward': 'chevron-back',
    'chevron-back-outline': 'chevron-forward-outline',
    'chevron-forward-outline': 'chevron-back-outline',
};

/**
 * The icon to draw for the current layout direction. Returns `name` unchanged in a
 * left-to-right layout, and for any icon that has no direction to mirror.
 */
export function mirrorIcon<Name extends string>(name: Name): Name {
    if (!I18nManager.isRTL) return name;
    return (MIRRORED[name] ?? name) as Name;
}

export default mirrorIcon;
