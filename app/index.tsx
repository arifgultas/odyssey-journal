import { Redirect } from 'expo-router';

export default function Index() {
    // Always redirect to onboarding on app start
    // AuthContext will handle redirecting to tabs if user is already logged in
    return <Redirect href="/onboarding" />;
}
