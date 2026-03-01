/**
 * Tests for lib/reports.ts
 */

// Mock supabase
jest.mock('../supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
                })),
            })),
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
                })),
            })),
        })),
        auth: {
            getUser: jest.fn(() => Promise.resolve({
                data: { user: { id: 'user-123' } },
                error: null,
            })),
        },
    },
}));

// Mock Alert
jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));

import { REPORT_REASON_KEYS, type ReportReason } from '../reports';

describe('reports', () => {
    describe('REPORT_REASON_KEYS', () => {
        it('contains all expected reasons', () => {
            expect(REPORT_REASON_KEYS).toContain('spam');
            expect(REPORT_REASON_KEYS).toContain('harassment');
            expect(REPORT_REASON_KEYS).toContain('hate_speech');
            expect(REPORT_REASON_KEYS).toContain('violence');
            expect(REPORT_REASON_KEYS).toContain('nudity');
            expect(REPORT_REASON_KEYS).toContain('false_information');
            expect(REPORT_REASON_KEYS).toContain('other');
        });

        it('has exactly 7 reasons', () => {
            expect(REPORT_REASON_KEYS).toHaveLength(7);
        });

        it('has correct type for each reason', () => {
            REPORT_REASON_KEYS.forEach((reason: ReportReason) => {
                expect(typeof reason).toBe('string');
            });
        });
    });
});
