import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

// Completed callback for WebBrowser authentication sessions
WebBrowser.maybeCompleteAuthSession();

export function useOAuth() {
    const signInWithProvider = async (provider: 'google' | 'apple') => {
        try {
            // Create redirect URL matching our application scheme
            const redirectUrl = Linking.createURL('/(auth)/login');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) {
                throw error;
            }

            if (!data?.url) {
                throw new Error('No redirect URL returned from Supabase');
            }

            // Open auth session in web browser
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type === 'success' && result.url) {
                // Parse the hash parameters from redirect url
                const hash = result.url.split('#')[1];
                if (hash) {
                    const params = Object.fromEntries(new URLSearchParams(hash));
                    const { access_token, refresh_token } = params;
                    
                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });
                        if (sessionError) {
                            throw sessionError;
                        }
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error(`OAuth error with provider ${provider}:`, error);
            const providerName = provider === 'google' ? 'Google' : 'Apple';
            Alert.alert('Giriş Hatası', `${providerName} ile oturum açılırken bir sorun oluştu.`);
            return false;
        }
    };

    return { signInWithProvider };
}
