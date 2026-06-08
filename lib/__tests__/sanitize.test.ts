/**
 * Tests for lib/sanitize.ts
 */
import {
    LIMITS,
    normalizeWhitespace,
    removeScriptContent,
    sanitizeBio,
    sanitizeComment,
    sanitizeFullName,
    sanitizePostContent,
    sanitizePostTitle,
    sanitizeText,
    sanitizeUsername,
    stripHtmlTags,
    validateComment,
    validatePostContent,
    validatePostTitle,
    sanitizeCollectionName,
} from '../sanitize';

describe('sanitize', () => {
    describe('stripHtmlTags', () => {
        it('removes basic HTML tags', () => {
            expect(stripHtmlTags('<b>bold</b>')).toBe('bold');
            expect(stripHtmlTags('<script>alert("xss")</script>')).toBe('alert("xss")');
            expect(stripHtmlTags('<div class="test">content</div>')).toBe('content');
        });

        it('decodes HTML entities', () => {
            expect(stripHtmlTags('&lt;script&gt;')).toBe('<script>');
            expect(stripHtmlTags('&amp;&quot;&#039;')).toBe('&"\'');
            expect(stripHtmlTags('hello&nbsp;world')).toBe('hello world');
        });

        it('handles text without HTML', () => {
            expect(stripHtmlTags('plain text')).toBe('plain text');
        });
    });

    describe('removeScriptContent', () => {
        it('removes javascript: protocol', () => {
            expect(removeScriptContent('javascript:alert(1)')).toBe('alert(1)');
        });

        it('removes event handlers', () => {
            expect(removeScriptContent('onclick=doSomething')).toBe('doSomething');
            expect(removeScriptContent('onmouseover =hack()')).toBe('hack()');
        });

        it('removes data:text/html', () => {
            expect(removeScriptContent('data:text/html,<h1>hi</h1>')).toBe(',<h1>hi</h1>');
        });

        it('leaves normal text unchanged', () => {
            expect(removeScriptContent('hello world')).toBe('hello world');
        });
    });

    describe('normalizeWhitespace', () => {
        it('collapses multiple spaces', () => {
            expect(normalizeWhitespace('hello    world')).toBe('hello world');
        });

        it('limits consecutive newlines to 2', () => {
            expect(normalizeWhitespace('a\n\n\n\nb')).toBe('a\n\nb');
        });

        it('trims text', () => {
            expect(normalizeWhitespace('  hello  ')).toBe('hello');
        });

        it('normalizes line endings', () => {
            expect(normalizeWhitespace('a\r\nb')).toBe('a\nb');
            expect(normalizeWhitespace('a\rb')).toBe('a\nb');
        });
    });

    describe('sanitizeText', () => {
        it('applies full pipeline', () => {
            const result = sanitizeText('<b>hello</b>   world   javascript:alert(1)');
            expect(result).toBe('hello world alert(1)');
        });

        it('enforces max length', () => {
            const result = sanitizeText('a'.repeat(300), 100);
            expect(result.length).toBe(100);
        });

        it('handles empty/null input', () => {
            expect(sanitizeText('')).toBe('');
            expect(sanitizeText(null as any)).toBe('');
            expect(sanitizeText(undefined as any)).toBe('');
        });
    });

    describe('field-specific sanitizers', () => {
        it('sanitizePostTitle respects limit', () => {
            const result = sanitizePostTitle('a'.repeat(300));
            expect(result.length).toBe(LIMITS.POST_TITLE);
        });

        it('sanitizePostContent respects limit', () => {
            const result = sanitizePostContent('a'.repeat(6000));
            expect(result.length).toBe(LIMITS.POST_CONTENT);
        });

        it('sanitizeComment respects limit', () => {
            const result = sanitizeComment('a'.repeat(2000));
            expect(result.length).toBe(LIMITS.COMMENT);
        });

        it('sanitizeUsername allows only valid characters', () => {
            expect(sanitizeUsername('User Name!')).toBe('username');
            expect(sanitizeUsername('user_123.test')).toBe('user_123.test');
            expect(sanitizeUsername('UPPER')).toBe('upper');
        });

        it('sanitizeFullName respects limit', () => {
            const result = sanitizeFullName('a'.repeat(100));
            expect(result.length).toBe(LIMITS.FULL_NAME);
        });

        it('sanitizeBio respects limit', () => {
            const result = sanitizeBio('a'.repeat(500));
            expect(result.length).toBe(LIMITS.BIO);
        });

        it('sanitizeCollectionName respects limit', () => {
            const result = sanitizeCollectionName('a'.repeat(200));
            expect(result.length).toBe(LIMITS.COLLECTION_NAME);
        });
    });

    describe('validators', () => {
        it('validatePostTitle requires non-empty', () => {
            expect(validatePostTitle('').isValid).toBe(false);
            expect(validatePostTitle('  ').isValid).toBe(false);
        });

        it('validatePostTitle requires min 3 chars', () => {
            expect(validatePostTitle('ab').isValid).toBe(false);
            expect(validatePostTitle('abc').isValid).toBe(true);
        });

        it('validatePostContent requires min 10 chars', () => {
            expect(validatePostContent('short').isValid).toBe(false);
            expect(validatePostContent('long enough content here').isValid).toBe(true);
        });

        it('validateComment requires non-empty', () => {
            expect(validateComment('').isValid).toBe(false);
            expect(validateComment('nice post!').isValid).toBe(true);
        });
    });
});
