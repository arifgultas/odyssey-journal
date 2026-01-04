/**
 * API and Library Tests
 * Verifies API modules, constants, and project structure
 */

import * as fs from 'fs';
import * as path from 'path';

const libDir = path.join(__dirname, '..', 'lib');
const constantsDir = path.join(__dirname, '..', 'constants');
const contextDir = path.join(__dirname, '..', 'context');
const appDir = path.join(__dirname, '..', 'app');

describe('API Files Exist', () => {
    const apiFiles = [
        'posts.ts',
        'interactions.ts',
        'comments.ts',
        'profile-service.ts',
        'follow.ts',
        'share.ts',
        'reports.ts',
        'notifications.ts',
        'supabase.ts',
        'search-service.ts',
        'image-upload.ts',
    ];

    apiFiles.forEach(file => {
        it(`${file} exists`, () => {
            const filePath = path.join(libDir, file);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });
});

describe('Constants Files', () => {
    it('theme.ts exists', () => {
        const filePath = path.join(constantsDir, 'theme.ts');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('theme.ts has Colors', () => {
        const content = fs.readFileSync(path.join(constantsDir, 'theme.ts'), 'utf-8');
        expect(content).toContain('Colors');
    });

    it('theme.ts has Typography', () => {
        const content = fs.readFileSync(path.join(constantsDir, 'theme.ts'), 'utf-8');
        expect(content).toContain('Typography');
    });

    it('theme.ts has Spacing', () => {
        const content = fs.readFileSync(path.join(constantsDir, 'theme.ts'), 'utf-8');
        expect(content).toContain('Spacing');
    });

    it('theme.ts has BorderRadius', () => {
        const content = fs.readFileSync(path.join(constantsDir, 'theme.ts'), 'utf-8');
        expect(content).toContain('BorderRadius');
    });

    it('theme.ts has Shadows', () => {
        const content = fs.readFileSync(path.join(constantsDir, 'theme.ts'), 'utf-8');
        expect(content).toContain('Shadows');
    });

    it('theme.ts has light theme', () => {
        const content = fs.readFileSync(path.join(constantsDir, 'theme.ts'), 'utf-8');
        expect(content).toContain('light:');
    });

    it('theme.ts has dark theme', () => {
        const content = fs.readFileSync(path.join(constantsDir, 'theme.ts'), 'utf-8');
        expect(content).toContain('dark:');
    });
});

describe('Context Files Exist', () => {
    it('AuthContext.tsx exists', () => {
        const filePath = path.join(contextDir, 'AuthContext.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('language-context.tsx exists', () => {
        const filePath = path.join(contextDir, 'language-context.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });
});

describe('App Structure', () => {
    it('app/_layout.tsx exists', () => {
        const filePath = path.join(appDir, '_layout.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('(tabs) directory exists', () => {
        const tabsDir = path.join(appDir, '(tabs)');
        expect(fs.existsSync(tabsDir)).toBe(true);
    });

    it('(auth) directory exists', () => {
        const authDir = path.join(appDir, '(auth)');
        expect(fs.existsSync(authDir)).toBe(true);
    });

    it('(tabs)/_layout.tsx exists', () => {
        const filePath = path.join(appDir, '(tabs)', '_layout.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('(tabs)/index.tsx exists', () => {
        const filePath = path.join(appDir, '(tabs)', 'index.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('(tabs)/profile.tsx exists', () => {
        const filePath = path.join(appDir, '(tabs)', 'profile.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('(tabs)/explore.tsx exists', () => {
        const filePath = path.join(appDir, '(tabs)', 'explore.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('(tabs)/saved.tsx exists', () => {
        const filePath = path.join(appDir, '(tabs)', 'saved.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });
});

describe('Auth Screens Exist', () => {
    const authDir = path.join(appDir, '(auth)');

    it('login.tsx exists', () => {
        const filePath = path.join(authDir, 'login.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('signup.tsx exists', () => {
        const filePath = path.join(authDir, 'signup.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('forgot-password.tsx exists', () => {
        const filePath = path.join(authDir, 'forgot-password.tsx');
        expect(fs.existsSync(filePath)).toBe(true);
    });
});

describe('Share Module Content', () => {
    it('share.ts has sharePost function', () => {
        const content = fs.readFileSync(path.join(libDir, 'share.ts'), 'utf-8');
        expect(content).toContain('sharePost');
    });

    it('share.ts has generatePostShareUrl', () => {
        const content = fs.readFileSync(path.join(libDir, 'share.ts'), 'utf-8');
        expect(content).toContain('generatePostShareUrl');
    });
});

describe('Posts Module Content', () => {
    it('posts.ts has fetchPosts', () => {
        const content = fs.readFileSync(path.join(libDir, 'posts.ts'), 'utf-8');
        expect(content).toContain('fetchPosts');
    });

    it('posts.ts has createPost', () => {
        const content = fs.readFileSync(path.join(libDir, 'posts.ts'), 'utf-8');
        expect(content).toContain('createPost');
    });
});

describe('i18n Directory', () => {
    it('i18n directory exists', () => {
        const i18nDir = path.join(libDir, 'i18n');
        expect(fs.existsSync(i18nDir)).toBe(true);
    });

    it('translations directory exists', () => {
        const translationsDir = path.join(libDir, 'i18n', 'translations');
        expect(fs.existsSync(translationsDir)).toBe(true);
    });
});
