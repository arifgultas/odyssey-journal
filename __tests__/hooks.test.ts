/**
 * Hook and i18n Tests
 * Verifies hooks and internationalization files exist
 */

import * as fs from 'fs';
import * as path from 'path';

const hooksDir = path.join(__dirname, '..', 'hooks');
const i18nDir = path.join(__dirname, '..', 'lib', 'i18n');

describe('Hook Files Exist', () => {
    const hookFiles = [
        'use-color-scheme.ts',
        'use-theme-color.ts',
        'use-book-fonts.ts',
        'use-translation.ts',
        'use-profile.ts',
    ];

    hookFiles.forEach(file => {
        it(`${file} exists`, () => {
            const filePath = path.join(hooksDir, file);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });
});

describe('i18n Structure', () => {
    it('i18n index.ts exists', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('translations directory exists', () => {
        const translationsDir = path.join(i18nDir, 'translations');
        expect(fs.existsSync(translationsDir)).toBe(true);
    });

    it('has 12 translation files', () => {
        const translationsDir = path.join(i18nDir, 'translations');
        const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));
        expect(files.length).toBe(12);
    });
});

describe('Translation Files Exist', () => {
    const languages = ['tr', 'en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'ko', 'zh', 'ar'];

    languages.forEach(lang => {
        it(`${lang}.ts exists`, () => {
            const filePath = path.join(i18nDir, 'translations', `${lang}.ts`);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });
});

describe('Translation File Content', () => {
    it('Turkish file has common key', () => {
        const filePath = path.join(i18nDir, 'translations', 'tr.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('common:');
    });

    it('Turkish file has auth key', () => {
        const filePath = path.join(i18nDir, 'translations', 'tr.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('auth:');
    });

    it('Turkish file has home key', () => {
        const filePath = path.join(i18nDir, 'translations', 'tr.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('home:');
    });

    it('Turkish file has profile key', () => {
        const filePath = path.join(i18nDir, 'translations', 'tr.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('profile:');
    });

    it('English file has common key', () => {
        const filePath = path.join(i18nDir, 'translations', 'en.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('common:');
    });

    it('Spanish file has common key', () => {
        const filePath = path.join(i18nDir, 'translations', 'es.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('common:');
    });

    it('French file has common key', () => {
        const filePath = path.join(i18nDir, 'translations', 'fr.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('common:');
    });
});

describe('i18n Index File Content', () => {
    it('exports SUPPORTED_LANGUAGES', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('SUPPORTED_LANGUAGES');
    });

    it('exports t function', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('export const t');
    });

    it('exports getCurrentLanguage', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('getCurrentLanguage');
    });

    it('exports setLanguage', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('setLanguage');
    });

    it('exports getLanguageInfo', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('getLanguageInfo');
    });

    it('has Turkish language config', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain("tr:");
        expect(content).toContain("'Türkçe'");
    });

    it('has English language config', () => {
        const filePath = path.join(i18nDir, 'index.ts');
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain("en:");
        expect(content).toContain("'English'");
    });
});
