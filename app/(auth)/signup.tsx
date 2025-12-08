import { Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert(error.message);
        else Alert.alert('Check your inbox for email verification!');
        setLoading(false);
    }

    async function signUpWithGoogle() {
        Alert.alert('Coming Soon', 'Google Sign Up will be available soon!');
    }

    async function signUpWithApple() {
        Alert.alert('Coming Soon', 'Apple Sign Up will be available soon!');
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Logo/Brand */}
            <View style={styles.header}>
                <Text style={styles.logo}>Odyssey</Text>
            </View>

            {/* Welcome Text */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Join the journey.</Text>
                <Text style={styles.subtitle}>Start documenting your travels today</Text>
            </View>

            {!showEmailForm ? (
                <>
                    {/* Social Signup Buttons */}
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={signUpWithGoogle}
                    >
                        <AntDesign name="google" size={20} color="#DB4437" style={styles.socialButtonIcon} />
                        <Text style={styles.socialButtonText}>Sign up with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={signUpWithApple}
                    >
                        <FontAwesome name="apple" size={22} color="#000000" style={styles.socialButtonIcon} />
                        <Text style={styles.socialButtonText}>Sign up with Apple</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => setShowEmailForm(true)}
                    >
                        <AntDesign name="mail" size={20} color={Colors.light.textSecondary} style={styles.socialButtonIcon} />
                        <Text style={styles.socialButtonText}>Sign up with Email</Text>
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign in.</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </>
            ) : (
                <>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setShowEmailForm(false)}
                    >
                        <Text style={styles.backButtonText}>← All sign up options</Text>
                    </TouchableOpacity>

                    {/* Email Form */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="hello@example.com"
                            placeholderTextColor={Colors.light.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            placeholderTextColor={Colors.light.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={signUpWithEmail}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.light.surface} />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    contentContainer: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 80,
        paddingBottom: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        fontFamily: Typography.fonts.heading,
        fontSize: 32,
        color: Colors.light.primary,
        letterSpacing: -0.5,
    },
    welcomeSection: {
        marginBottom: 48,
    },
    welcomeText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 42,
        lineHeight: 52,
        color: Colors.light.primary,
        letterSpacing: -1,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: 17,
        color: Colors.light.textSecondary,
        lineHeight: 26,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        paddingVertical: 14,
        marginBottom: Spacing.md,
    },
    socialButtonIcon: {
        marginRight: 12,
    },
    socialButtonText: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
    },
    backButton: {
        marginBottom: Spacing.lg,
    },
    backButtonText: {
        fontFamily: Typography.fonts.body,
        fontSize: 15,
        color: Colors.light.textSecondary,
    },
    inputContainer: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.text,
        marginBottom: 8,
    },
    input: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    button: {
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 16,
        color: Colors.light.surface,
        letterSpacing: 0.3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    footerText: {
        fontFamily: Typography.fonts.body,
        fontSize: 15,
        color: Colors.light.textSecondary,
    },
    footerLink: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 15,
        color: Colors.light.primary,
        textDecorationLine: 'underline',
    },
});
