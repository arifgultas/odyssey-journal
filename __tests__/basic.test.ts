/**
 * Basic Jest test to verify setup
 */

describe('Basic Tests', () => {
    it('should pass basic assertion', () => {
        expect(1 + 1).toBe(2);
    });

    it('should handle strings', () => {
        expect('hello').toBe('hello');
    });

    it('should handle arrays', () => {
        expect([1, 2, 3]).toHaveLength(3);
    });
});
