import { OfflineIndicator } from '@/components/offline-indicator';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/theme-context';
import { useBookFonts } from '@/hooks/use-book-fonts';
import { useDeepLinkHandler } from '@/hooks/use-deep-link-handler';
import { persistOptions, queryClientConfig } from '@/lib/query-persister';
import { initSentry, SentryErrorBoundary } from '@/lib/sentry';
import { validateEnv } from '@/lib/env';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect } from 'react';
import { I18nManager } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Arabic needs a right-to-left layout. React Native can only apply a direction change on
// the next launch, so allowRTL is set here, before anything renders, and the language
// context asks the reader to restart when the direction actually has to flip. The setting
// is persisted natively, which is why the second launch is already correct.
I18nManager.allowRTL(true);

// Initialize Sentry error monitoring
initSentry();

// Validate environment variables on start
validateEnv();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client with offline persistence
const queryClient = new QueryClient(queryClientConfig);

export const unstable_settings = {
  // Start with index which redirects to onboarding
  initialRouteName: 'index',
};

// Inner layout that uses theme context
function RootLayoutNav() {
  const { t } = useLanguage();
  const { colorScheme, isDark } = useTheme();
  useDeepLinkHandler();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: t('modal.title') }} />
        <Stack.Screen name="comments/[postId]" options={{ headerShown: false }} />
        <Stack.Screen name="post-detail/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="user-profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="followers/[userId]" options={{ headerShown: false }} />
        <Stack.Screen name="following/[userId]" options={{ headerShown: false }} />
        <Stack.Screen name="collection/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="destination-posts/[locationName]" options={{ headerShown: false }} />
        <Stack.Screen name="category-posts/[categoryId]" options={{ headerShown: false }} />
        <Stack.Screen name="popular-posts" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="blocked-users" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="map" options={{ headerShown: false }} />
        <Stack.Screen name="create-post" options={{ headerShown: false }} />
        <Stack.Screen name="chat/index" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineIndicator position="top" />
    </ThemeProvider>
  );
}

/**
 * Holds the splash screen until the app can paint in the right language and the right font.
 *
 * i18n starts on the device's locale (lib/i18n/index.ts) and the reader's saved choice only
 * lands after an async read, so painting before `isReady` shows one frame of the wrong
 * language to anyone whose choice differs from their device.
 */
function SplashGate({ children }: { children: ReactNode }) {
  const { fontsLoaded, fontError } = useBookFonts();
  const { isReady: languageReady } = useLanguage();
  const ready = (fontsLoaded || fontError) && languageReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}

// The crash screen is translated, so the boundary has to sit inside LanguageProvider - outside
// it the fallback reads the device locale instead of the language the reader picked.
const GuardedApp = SentryErrorBoundary(function GuardedApp() {
  return (
    <SplashGate>
      <AuthProvider>
        <AppThemeProvider>
          <RootLayoutNav />
        </AppThemeProvider>
      </AuthProvider>
    </SplashGate>
  );
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <LanguageProvider>
          <GuardedApp />
        </LanguageProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
