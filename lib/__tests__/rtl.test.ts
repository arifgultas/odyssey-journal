/**
 * Arabic is the one supported language that reads right to left. React Native mirrors the
 * layout itself once forceRTL is set, but two things it cannot do are covered here: an icon
 * is a glyph and keeps pointing the same way, and isRTL has to stay true for Arabic only -
 * a language wrongly marked RTL would flip the whole app for its readers.
 */
import fs from 'fs';
import path from 'path';
import { I18nManager } from 'react-native';

import { getSupportedLanguages, isRTL, LanguageCode } from '../i18n';
import { mirrorIcon } from '../rtl';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
}));

describe('isRTL', () => {
    it('is true for Arabic and false for every other supported language', () => {
        expect(isRTL('ar')).toBe(true);
        for (const code of getSupportedLanguages().filter((c) => c !== 'ar')) {
            expect(isRTL(code)).toBe(false);
        }
    });

    it('covers every language the app offers', () => {
        // A language added to SUPPORTED_LANGUAGES without a decision here would silently
        // default to left-to-right, which is right for all of them today.
        const answered = getSupportedLanguages().map((code: LanguageCode) => isRTL(code));
        expect(answered.filter(Boolean)).toHaveLength(1);
    });
});

describe('mirrorIcon', () => {
    afterEach(() => {
        I18nManager.isRTL = false;
    });

    it('leaves every icon alone in a left-to-right layout', () => {
        I18nManager.isRTL = false;
        expect(mirrorIcon('arrow-back')).toBe('arrow-back');
        expect(mirrorIcon('chevron-forward')).toBe('chevron-forward');
        expect(mirrorIcon('heart')).toBe('heart');
    });

    it('swaps the direction-carrying icons in a right-to-left layout', () => {
        I18nManager.isRTL = true;
        expect(mirrorIcon('arrow-back')).toBe('arrow-forward');
        expect(mirrorIcon('arrow-forward')).toBe('arrow-back');
        expect(mirrorIcon('chevron-back')).toBe('chevron-forward');
        expect(mirrorIcon('chevron-forward')).toBe('chevron-back');
        expect(mirrorIcon('chevron-back-outline')).toBe('chevron-forward-outline');
    });

    it('leaves icons that carry no direction alone even in RTL', () => {
        I18nManager.isRTL = true;
        // Flipping these would be worse than doing nothing: a heart or a settings cog
        // has no reading direction to follow.
        for (const icon of ['heart', 'settings-outline', 'close', 'search', 'camera']) {
            expect(mirrorIcon(icon)).toBe(icon);
        }
    });

    it('mirrors back to the original, so the table has no one-way entries', () => {
        I18nManager.isRTL = true;
        for (const icon of [
            'arrow-back', 'arrow-forward', 'arrow-back-outline', 'arrow-forward-outline',
            'chevron-back', 'chevron-forward', 'chevron-back-outline', 'chevron-forward-outline',
        ]) {
            expect(mirrorIcon(mirrorIcon(icon))).toBe(icon);
        }
    });
});

describe('the stylesheets themselves', () => {
    // The RTL pass replaced these with marginStart/marginEnd, paddingStart/paddingEnd and
    // the borderStart/End family, which React Native mirrors on its own. A Left or Right
    // form reintroduced later would pin that one element to the wrong side in Arabic, and
    // nothing else in the suite would notice.
    const DIRECTIONAL = [
        'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight',
        'borderLeftWidth', 'borderRightWidth', 'borderLeftColor', 'borderRightColor',
        'borderTopLeftRadius', 'borderTopRightRadius',
        'borderBottomLeftRadius', 'borderBottomRightRadius',
    ];

    function sourceFiles(dir: string, out: string[] = []): string[] {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name !== 'node_modules' && entry.name !== '__tests__') {
                    sourceFiles(full, out);
                }
            } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                out.push(full);
            }
        }
        return out;
    }

    it('use logical edges rather than Left and Right', () => {
        const root = path.join(__dirname, '..', '..');
        const pattern = new RegExp(String.raw`\b(${DIRECTIONAL.join('|')})\s*:`);
        const offenders: string[] = [];

        for (const dir of ['app', 'components']) {
            for (const file of sourceFiles(path.join(root, dir))) {
                fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
                    const match = line.match(pattern);
                    if (match) {
                        offenders.push(`${path.relative(root, file)}:${index + 1}  ${match[1]}`);
                    }
                });
            }
        }

        expect(offenders).toEqual([]);
    });
});
