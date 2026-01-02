import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineIndicator } from '@/components/offline-indicator';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/language-context';
import { useBookFonts } from '@/hooks/use-book-fonts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { persistOptions, queryClientConfig } from '@/lib/query-persister';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client with offline persistence
const queryClient = new QueryClient(queryClientConfig);

export const unstable_settings = {
  // Start with index which redirects to onboarding
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
              <OfflineIndicator position="top" />
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
