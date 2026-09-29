import { existsSync, readFileSync } from "fs";
import { ConfigContext, ExpoConfig } from "expo/config";

// Firebase config for Android push (FCM). Kept out of git (public repo); the Android build
// works without it, but then Android devices never get a push token.
const GOOGLE_SERVICES_FILE = "./google-services.json";

// Sentry source map upload runs during the native build and fails it when there is no auth
// token, so the plugin is added only when one is available: SENTRY_AUTH_TOKEN as an EAS
// environment variable, or .env.sentry-build-plugin locally (both outside git).
const SENTRY_ENV_FILE = "./.env.sentry-build-plugin";
const SENTRY_UPLOAD =
  Boolean(process.env.SENTRY_AUTH_TOKEN) ||
  (existsSync(SENTRY_ENV_FILE) &&
    /^SENTRY_AUTH_TOKEN=\S+/m.test(readFileSync(SENTRY_ENV_FILE, "utf8")));

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Odyssey Journal",
  slug: "odyssey-journal",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "odysseyjournal",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: "app.odysseyjournal",
    buildNumber: "8",
    infoPlist: {
      // The twelve languages the app ships (lib/i18n). Declaring them lets iOS - and
      // MapKit with it - treat this as a localized app instead of an English-only one.
      // Map labels still follow the device's preferred language, not the in-app choice;
      // that is a MapKit limitation, not something this list overrides.
      CFBundleLocalizations: [
        "tr",
        "en",
        "es",
        "fr",
        "de",
        "pt",
        "it",
        "ru",
        "ja",
        "ko",
        "zh",
        "ar",
      ],
      ITSAppUsesNonExemptEncryption: false,
      // English fallback; the translations are in lang/<code>.json (see locales below)
      NSCameraUsageDescription:
        "Odyssey Journal uses your camera to take photos for your travel posts.",
      NSPhotoLibraryUsageDescription:
        "Odyssey Journal uses your photo library to add photos to your travel posts and profile.",
      NSLocationWhenInUseUsageDescription:
        "Odyssey Journal uses your location to tag your travel posts and set your home city.",
      NSPhotoLibraryAddUsageDescription:
        "Odyssey Journal saves photos to your library only when you ask it to.",
    },
  },
  android: {
    package: "com.odysseyjournal.app",
    versionCode: 2,
    softwareKeyboardLayoutMode: "resize",
    adaptiveIcon: {
      // Same cream as the iOS icon, so the Android icon reads as the same artwork
      backgroundColor: "#F7F6F0",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    ...(existsSync(GOOGLE_SERVICES_FILE) ? { googleServicesFile: GOOGLE_SERVICES_FILE } : {}),
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    permissions: [
      "CAMERA",
      // Android 12 and older: the gallery permission request in hooks/use-image-picker.ts asks
      // for this one; blocking it would make every photo pick fail there
      "READ_EXTERNAL_STORAGE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
    ],
    // Added by libraries but never used: the app records no audio, draws no overlays and writes
    // no files to shared storage. Declaring them would mean explaining them in Play's Data
    // safety form for nothing.
    blockedPermissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.WRITE_EXTERNAL_STORAGE",
    ],
  },
  // Permission prompts in the app's twelve languages (iOS; Android words its own prompts)
  locales: {
    tr: "./lang/tr.json",
    en: "./lang/en.json",
    es: "./lang/es.json",
    fr: "./lang/fr.json",
    de: "./lang/de.json",
    pt: "./lang/pt.json",
    it: "./lang/it.json",
    ru: "./lang/ru.json",
    ja: "./lang/ja.json",
    ko: "./lang/ko.json",
    "zh-Hans": "./lang/zh.json",
    ar: "./lang/ar.json",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/icon.png",
        imageWidth: 280,
        resizeMode: "contain",
        backgroundColor: "#F5F1E8",
        dark: {
          backgroundColor: "#1A1410",
          image: "./assets/images/icon.png",
        },
      },
    ],
    "expo-font",
    [
      "expo-notifications",
      {
        // Android draws notification icons as a white silhouette; a full-colour icon
        // shows up as a plain white square
        icon: "./assets/images/notification-icon.png",
        color: "#D4A574",
      },
    ],
    ...(SENTRY_UPLOAD
      ? [
          [
            "@sentry/react-native/expo",
            {
              url: "https://de.sentry.io/",
              organization: "gultas-software",
              project: "odyssey-journal",
            },
          ] as [string, Record<string, unknown>],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
