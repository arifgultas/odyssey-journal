/**
 * Input Sanitization Module
 * Provides HTML stripping, length validation, and text normalization
 * to protect against XSS and enforce content limits.
 */

// ============================================
// Character Limits
// ============================================
export const LIMITS = {
    POST_TITLE: 200,
    POST_CONTENT: 5000,
    COMMENT: 1000,
    USERNAME: 30,
    FULL_NAME: 50,
    BIO: 300,
    COLLECTION_NAME: 100,
    REPORT_DESCRIPTION: 500,
} as const;

// ============================================
// Core Sanitization Functions
// ============================================

/**
 * Strip HTML tags from text to prevent XSS
 */
export function stripHtmlTags(text: string): string {
    return text
        .replace(/<[^>]*>/g, '')           // Remove HTML tags
        .replace(/&lt;/g, '<')             // Decode common HTML entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

/**
 * Remove potentially dangerous characters and scripts
 */
export function removeScriptContent(text: string): string {
    return text
        .replace(/javascript:/gi, '')       // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '')        // Remove HTML event handlers (onclick=, etc.)
        .replace(/data:\s*text\/html/gi, '') // Remove data:text/html URIs
        .replace(/vbscript:/gi, '');        // Remove vbscript: protocol
}

/**
 * Normalize whitespace (collapse multiple spaces/newlines)
 */
export function normalizeWhitespace(text: string): string {
    return text
        .replace(/\r\n/g, '\n')           // Normalize line endings
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
        .replace(/[ \t]{2,}/g, ' ')        // Collapse multiple spaces/tabs
        .trim();
}

/**
 * Full sanitization pipeline for user input
 */
export function sanitizeText(text: string, maxLength?: number): string {
    if (!text || typeof text !== 'string') return '';

    let sanitized = text;
    sanitized = stripHtmlTags(sanitized);
    sanitized = removeScriptContent(sanitized);
    sanitized = normalizeWhitespace(sanitized);

    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

// ============================================
// Field-Specific Sanitizers
// ============================================

export function sanitizePostTitle(title: string): string {
    return sanitizeText(title, LIMITS.POST_TITLE);
}

export function sanitizePostContent(content: string): string {
    return sanitizeText(content, LIMITS.POST_CONTENT);
}

export function sanitizeComment(content: string): string {
    return sanitizeText(content, LIMITS.COMMENT);
}

export function sanitizeUsername(username: string): string {
    // Username: only alphanumeric, underscores, dots — no spaces
    const sanitized = sanitizeText(username, LIMITS.USERNAME);
    return sanitized.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();
}

export function sanitizeFullName(name: string): string {
    return sanitizeText(name, LIMITS.FULL_NAME);
}

export function sanitizeBio(bio: string): string {
    return sanitizeText(bio, LIMITS.BIO);
}

export function sanitizeCollectionName(name: string): string {
    return sanitizeText(name, LIMITS.COLLECTION_NAME);
}

// ============================================
// Validation Helpers
// ============================================

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validatePostTitle(title: string): ValidationResult {
    const sanitized = sanitizePostTitle(title);
    if (!sanitized || sanitized.trim().length === 0) {
        return { isValid: false, error: 'Title is required' };
    }
    if (sanitized.length < 3) {
        return { isValid: false, error: 'Title must be at least 3 characters' };
    }
    return { isValid: true };
}

export function validatePostContent(content: string): ValidationResult {
    const sanitized = sanitizePostContent(content);
    if (!sanitized || sanitized.trim().length === 0) {
        return { isValid: false, error: 'Content is required' };
    }
    if (sanitized.length < 10) {
        return { isValid: false, error: 'Content must be at least 10 characters' };
    }
    return { isValid: true };
}

export function validateComment(content: string): ValidationResult {
    const sanitized = sanitizeComment(content);
    if (!sanitized || sanitized.trim().length === 0) {
        return { isValid: false, error: 'Comment cannot be empty' };
    }
    return { isValid: true };
}
