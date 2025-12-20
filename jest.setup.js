// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
    default: {
        call: () => { },
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()),
}));

// Mock Expo Image
jest.mock('expo-image', () => ({
    Image: 'Image',
}));

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
}));

// Mock Expo Image Picker
jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: {
        Images: 'Images',
    },
}));

// Mock Expo Location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

// Silence warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Reduce console noise
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
