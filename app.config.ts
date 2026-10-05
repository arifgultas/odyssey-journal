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
    buildNumber: "9",
    // Shared post links (https://odysseyjournal.app/[<lang>/]p/<id>) open in the app once the site
    // publishes /.well-known/apple-app-site-association; until then they open the site's /p/ page.
    // lib/deep-links.ts maps them to the post screen.
    associatedDomains: ["applinks:odysseyjournal.app"],
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
        // Simplified Chinese: must match the zh-Hans.lproj that `locales` below generates
        "zh-Hans",
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
    // Apple's privacy manifest for the app target (ITMS-91053). Without this key Expo writes no
    // PrivacyInfo.xcprivacy for the app itself; some libraries ship their own, React Native's
    // JS runtime and AsyncStorage still need these reasons declared at app level.
    // Tracking: none (no ads, no cross-app identifiers). Collected data types are declared in
    // App Store Connect → App Privacy (store_control.md §1.2).
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
          NSPrivacyAccessedAPITypeReasons: ["C617.1", "0A2A.1", "3B52.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategorySystemBootTime",
          NSPrivacyAccessedAPITypeReasons: ["35F9.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
          NSPrivacyAccessedAPITypeReasons: ["E174.1", "85F4.1"],
        },
      ],
    },
  },
  android: {
    package: "com.odysseyjournal.app",
    versionCode: 3,
    softwareKeyboardLayoutMode: "resize",
    // Shared post links, as on iOS above; verified against the site's /.well-known/assetlinks.json.
    // Only /p/ paths: claiming / would send every visit to the site into the app. pathPattern's "."
    // is any character, so "/../p/.*" is the language-prefixed form (/tr/p/<id>).
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: "https", host: "odysseyjournal.app", pathPrefix: "/p/" },
          { scheme: "https", host: "odysseyjournal.app", pathPattern: "/../p/.*" },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
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
      // Android 12 and older: expo-image-picker's requestMediaLibraryPermissionsAsync asks for READ
      // and WRITE together and reports "granted" only if both are (ImagePickerModule.kt), and
      // launchCameraAsync wants WRITE below Android 10. Blocking either would make every photo pick
      // in hooks/use-image-picker.ts and the edit-profile modal fail there.
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
    ],
    // Added by libraries but never used: the app records no audio and draws no overlays.
    // Declaring them would mean explaining them in Play's Data safety form for nothing.
    blockedPermissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.SYSTEM_ALERT_WINDOW",
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
