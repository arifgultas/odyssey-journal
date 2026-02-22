import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Odyssey Journal',
    slug: 'odyssey-journal',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'odysseyjournal',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.odysseyjournal.app',
        config: {
            googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
        infoPlist: {
            NSCameraUsageDescription: 'Odyssey Journal needs access to your camera to take photos for your travel posts.',
            NSPhotoLibraryUsageDescription: 'Odyssey Journal needs access to your photo library to select images for your travel posts.',
            NSLocationWhenInUseUsageDescription: 'Odyssey Journal needs your location to tag your travel posts and show nearby destinations.',
            NSPhotoLibraryAddUsageDescription: 'Odyssey Journal needs permission to save photos to your library.',
        },
    },
    android: {
        package: 'com.odysseyjournal.app',
        softwareKeyboardLayoutMode: 'resize',
        adaptiveIcon: {
            backgroundColor: '#F5F1E8',
            foregroundImage: './assets/images/android-icon-foreground.png',
            backgroundImage: './assets/images/android-icon-background.png',
            monochromeImage: './assets/images/android-icon-monochrome.png',
        },
        edgeToEdgeEnabled: true,
        config: {
            googleMaps: {
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
        },
        permissions: [
            'CAMERA',
            'READ_EXTERNAL_STORAGE',
            'WRITE_EXTERNAL_STORAGE',
            'ACCESS_FINE_LOCATION',
            'ACCESS_COARSE_LOCATION',
            'INTERNET',
            'ACCESS_NETWORK_STATE',
        ],
    },
    web: {
        output: 'static',
        favicon: './assets/images/favicon.png',
    },
    plugins: [
        'expo-router',
        [
            'expo-splash-screen',
            {
                image: './assets/images/icon.png',
                imageWidth: 280,
                resizeMode: 'contain',
                backgroundColor: '#F5F1E8',
                dark: {
                    backgroundColor: '#1A1410',
                    image: './assets/images/icon.png',
                },
            },
        ],
        'expo-font',
        [
            'expo-notifications',
            {
                icon: './assets/images/icon.png',
                color: '#D4A574',
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
        reactCompiler: true,
    },
});
