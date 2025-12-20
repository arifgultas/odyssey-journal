module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*|@tanstack/.*)',
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
        '**/*.(test|spec).(ts|tsx|js)',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testEnvironment: 'node',
};
