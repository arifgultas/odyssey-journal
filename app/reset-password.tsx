/**
 * Password reset landing screen
 *
 * The reset email (forgot-password.tsx) links to odysseyjournal://reset-password. Supabase puts
 * a short-lived recovery session in that link: access and refresh tokens in the fragment, or a
 * `code` in the query string when the PKCE flow is used. This screen turns it into a session and
 * then asks for the new password.
 *
 * It sits outside the (auth) group on purpose: AuthContext sends a signed-in user away from
 * (auth) screens, and the recovery session signs the user in before the password is changed.
 */

import { ChangePasswordModal } from '@/components/change-password-modal';
import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/context/language-context';
import { localizedErrorKey } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';

/** Query and fragment parameters of the link, fragment winning */
function linkParams(url: string): Record<string, string> {
    const [beforeHash, hash = ''] = url.split('#');
    const query = beforeHash.split('?')[1] ?? '';
    return {
        ...Object.fromEntries(new URLSearchParams(query)),
        ...Object.fromEntries(new URLSearchParams(hash)),
    };
}

export default function ResetPasswordScreen() {
    const url = Linking.useURL();
    const router = useRouter();
    const { t } = useLanguage();
    const [ready, setReady] = useState(false);
    // A link is spent once used (a PKCE code cannot be exchanged twice), and this effect re-runs
    // whenever `t` changes with the language, so each URL is handled only once.
    const handledUrl = useRef<string | null>(null);

    useEffect(() => {
        if (!url || handledUrl.current === url) return;
        handledUrl.current = url;

        (async () => {
            const params = linkParams(url);
            try {
                if (params.error_code || params.error) {
                    // e.g. otp_expired when the link is older than an hour or was already used
                    throw { code: params.error_code, message: params.error_description ?? params.error };
                }
                if (params.code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
                    if (error) throw error;
                } else if (params.access_token && params.refresh_token) {
                    const { error } = await supabase.auth.setSession({
                        access_token: params.access_token,
                        refresh_token: params.refresh_token,
                    });
                    if (error) throw error;
                } else {
                    throw { code: 'otp_expired' }; // opened without the recovery tokens
                }
                setReady(true);
            } catch (error) {
                Alert.alert(t('common.error'), t(localizedErrorKey(error)));
                router.replace('/(auth)/forgot-password');
            }
        })();
    }, [url, router, t]);

    return (
        <ThemedView style={styles.container}>
            {ready ? (
                <ChangePasswordModal visible onClose={() => router.replace('/(tabs)')} />
            ) : (
                <ActivityIndicator size="large" />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
