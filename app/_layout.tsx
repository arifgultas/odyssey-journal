import { OfflineIndicator } from '@/components/offline-indicator';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/theme-context';
import { useBookFonts } from '@/hooks/use-book-fonts';
import { persistOptions, queryClientConfig } from '@/lib/query-persister';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  const { colorScheme, isDark } = useTheme();
  const { language } = useLanguage();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack key={language}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
        <Stack.Screen name="map" options={{ headerShown: false }} />
        <Stack.Screen name="create-post" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineIndicator position="top" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const { fontsLoaded, fontError } = useBookFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <LanguageProvider>
          <AuthProvider>
            <AppThemeProvider>
              <RootLayoutNav />
            </AppThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
