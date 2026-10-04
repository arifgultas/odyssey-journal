import { markOnboardingComplete } from '@/hooks/use-onboarding';
import { removePushToken } from '@/lib/push-notifications';
import { clearUserQueryCache } from '@/lib/query-persister';
import { clearSentryUser, setSentryUser } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    isLoading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();
    const queryClient = useQueryClient();
    // Whose data the query cache currently holds
    const cachedUserId = useRef<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const nextUserId = session?.user?.id ?? null;
                // Signed out (also when the session expires on its own), or a different account
                // signed in: drop the previous user's cached data. Not awaited - this callback
                // must not block the auth client.
                if (event === 'SIGNED_OUT' || (cachedUserId.current && nextUserId && nextUserId !== cachedUserId.current)) {
                    clearUserQueryCache(queryClient);
                }
                cachedUserId.current = nextUserId;
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
                // Track user in Sentry for error context
                if (session?.user) {
                    setSentryUser({ id: session.user.id, email: session.user.email });
                } else {
                    clearSentryUser();
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Protected Routes Logic
    useEffect(() => {
        if (isLoading) return;

        // Wait for segments to be populated
        if (!segments || !segments[0]) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboarding = segments[0] === 'onboarding';
        const inTabs = segments[0] === '(tabs)';

        if (!session) {
            // User is not logged in
            if (inTabs) {
                // Only when trying to reach the protected tabs; the index route picks onboarding
                // (first run) or sign-in
                router.replace('/');
            }
            // Allow staying in auth or onboarding screens
        } else {
            // User is logged in. Someone with a session has been through onboarding already - this
            // covers accounts signed in before the flag existed, who never pressed its buttons.
            markOnboardingComplete();
            if (inAuthGroup || inOnboarding) {
                // Redirect to home if authenticated and trying to access auth/onboarding screens
                router.replace('/(tabs)');
            }
        }
    }, [session, segments, isLoading]);

    const signOut = async () => {
        // Otherwise the next account signed in on this device gets this user's notifications
        await removePushToken();
        clearSentryUser();
        const { error } = await supabase.auth.signOut();
        // Offline (or a server error) signOut returns early and keeps the session on the device;
        // the route guard would then send the user straight back in. Drop it locally.
        if (error) await supabase.auth.signOut({ scope: 'local' });
        await clearUserQueryCache(queryClient);
        // Settings is pushed on top of the tabs, so a replace alone would leave this account's tabs
        // mounted underneath (reachable with Android's back button after the next sign-in)
        if (router.canDismiss()) router.dismissAll();
        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
