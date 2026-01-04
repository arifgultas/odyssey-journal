/**
 * Jest Setup File
 * Configures mocks and test environment for React Native/Expo
 */

// Define __DEV__ for React Native
global.__DEV__ = true;

// Suppress console warnings/errors during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
    default: {
        call: () => { },
        createAnimatedComponent: (component) => component,
        Value: jest.fn(),
        event: jest.fn(),
        add: jest.fn(),
        eq: jest.fn(),
        set: jest.fn(),
        cond: jest.fn(),
        interpolate: jest.fn(),
        Extrapolate: { CLAMP: jest.fn() },
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn(),
    withDelay: jest.fn(),
    runOnJS: jest.fn((fn) => fn),
    Easing: {
        linear: jest.fn(),
        ease: jest.fn(),
        bezier: jest.fn(() => jest.fn()),
    },
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()),
    useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

// Mock Expo modules
jest.mock('expo-image', () => ({
    Image: 'Image',
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
    NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
    },
}));

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    MediaTypeOptions: { Images: 'Images', Videos: 'Videos', All: 'All' },
}));

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 0, longitude: 0 } })),
    reverseGeocodeAsync: jest.fn(() => Promise.resolve([{ city: 'Test City' }])),
}));

jest.mock('expo-localization', () => ({
    getLocales: jest.fn(() => [{ languageCode: 'tr', languageTag: 'tr-TR' }]),
    locale: 'tr-TR',
}));

jest.mock('expo-font', () => ({
    useFonts: jest.fn(() => [true, null]),
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true),
}));

jest.mock('expo-blur', () => ({
    BlurView: 'BlurView',
}));

jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

jest.mock('expo-sharing', () => ({
    shareAsync: jest.fn(() => Promise.resolve()),
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    },
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: jest.fn(),
    Link: 'Link',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: 'SafeAreaView',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
    MaterialIcons: 'MaterialIcons',
    FontAwesome: 'FontAwesome',
    MaterialCommunityIcons: 'MaterialCommunityIcons',
}));
