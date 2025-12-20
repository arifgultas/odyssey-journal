import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
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
                // Only redirect to onboarding if trying to access protected tabs
                router.replace('/onboarding');
            }
            // Allow staying in auth or onboarding screens
        } else {
            // User is logged in
            if (inAuthGroup || inOnboarding) {
                // Redirect to home if authenticated and trying to access auth/onboarding screens
                router.replace('/(tabs)');
            }
        }
    }, [session, segments, isLoading]);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
