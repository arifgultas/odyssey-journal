/**
 * Simple smoke test to verify Jest is working
 */
describe('Jest Configuration', () => {
    it('should run tests successfully', () => {
        expect(true).toBe(true);
    });

    it('should handle basic math', () => {
        expect(1 + 1).toBe(2);
    });

    it('should handle string operations', () => {
        const str = 'Hello World';
        expect(str).toContain('World');
    });

    it('should handle arrays', () => {
        const arr = [1, 2, 3];
        expect(arr).toHaveLength(3);
        expect(arr).toContain(2);
    });

    it('should handle objects', () => {
        const obj = { name: 'Test', value: 123 };
        expect(obj).toHaveProperty('name');
        expect(obj.name).toBe('Test');
    });
});
