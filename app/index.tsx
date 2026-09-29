import { useOnboarding } from '@/hooks/use-onboarding';
import { Redirect } from 'expo-router';

export default function Index() {
    // Onboarding on the first launch only, sign-in after that.
    // AuthContext will handle redirecting to tabs if user is already logged in
    const { isOnboardingComplete, isLoading } = useOnboarding();

    if (isLoading) {
        return null;
    }

    return <Redirect href={isOnboardingComplete ? '/(auth)/login' : '/onboarding'} />;
}
