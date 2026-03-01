/**
 * Tests for lib/sentry.ts
 */

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    setUser: jest.fn(),
    addBreadcrumb: jest.fn(),
    withScope: jest.fn((callback) => {
        const scope = {
            setExtra: jest.fn(),
        };
        callback(scope);
    }),
    wrap: jest.fn((component) => component),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
    expoConfig: { version: '1.0.0' },
}));

import { addBreadcrumb, captureError, clearSentryUser, initSentry, setSentryUser } from '../sentry';

describe('sentry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initSentry', () => {
        it('warns when no DSN is configured', () => {
            // DSN is not set in test env
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            initSentry();
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('No DSN found')
            );
            warnSpy.mockRestore();
        });
    });

    describe('captureError', () => {
        it('does not throw when DSN is not configured', () => {
            expect(() => captureError(new Error('test'))).not.toThrow();
        });
    });

    describe('setSentryUser', () => {
        it('does not throw when DSN is not configured', () => {
            expect(() => setSentryUser({ id: '123', email: 'test@test.com' })).not.toThrow();
        });
    });

    describe('clearSentryUser', () => {
        it('does not throw when DSN is not configured', () => {
            expect(() => clearSentryUser()).not.toThrow();
        });
    });

    describe('addBreadcrumb', () => {
        it('does not throw when DSN is not configured', () => {
            expect(() => addBreadcrumb('test message', 'test')).not.toThrow();
        });
    });
});
