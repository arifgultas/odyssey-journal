import { BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';

// Updated Stitch design colors matching the new HTML
const StitchColors = {
    light: {
        primaryGold: '#D4A574',
        primaryDark: '#2C1810',
        background: '#F5F1E8',
        surface: '#FFFDF5',
        surfaceDark: '#3a2e26',
        text: '#2C1810',
        textMuted: 'rgba(44, 24, 16, 0.6)',
        border: 'rgba(44, 24, 16, 0.2)',
        borderFocused: '#D4A574',
        tealLink: '#008080',
        divider: 'rgba(44, 24, 16, 0.1)',
    },
    dark: {
        primaryGold: '#D4A574',
        primaryDark: '#2C1810',
        background: '#2C1810',
        surface: '#3a2e26',
        surfaceDark: '#3a2e26',
        text: '#F5F1E8',
        textMuted: 'rgba(212, 165, 116, 0.7)',
        border: 'rgba(212, 165, 116, 0.3)',
        borderFocused: '#D4A574',
        tealLink: '#20b2aa',
        divider: 'rgba(212, 165, 116, 0.2)',
    },
};

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? StitchColors.dark : StitchColors.light;
    const { t, language } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert(t('common.error'), t('auth.enterEmailPassword'));
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert(t('auth.loginError'), error.message);
        setLoading(false);
    }

    async function signInWithGoogle() {
        Alert.alert(t('auth.comingSoon'), t('auth.googleLoginSoon'));
    }

    async function signInWithApple() {
        Alert.alert(t('auth.comingSoon'), t('auth.appleLoginSoon'));
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Spacer Top */}
                    <View style={styles.spacerTop} />

                    {/* Main Content */}
                    <View style={styles.mainContent}>
                        {/* Logo Section */}
                        <View style={styles.logoSection}>
                            <View style={[styles.logoContainer, {
                                borderColor: 'rgba(212, 165, 116, 0.4)',
                                backgroundColor: isDark ? 'rgba(212, 165, 116, 0.1)' : 'rgba(44, 24, 16, 0.05)',
                            }]}>
                                <Image
                                    source={require('@/assets/images/icon.png')}
                                    style={styles.logoImage}
                                    contentFit="cover"
                                />
                            </View>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.appTitle, {
                                    color: isDark ? theme.primaryGold : theme.primaryDark
                                }]}>
                                    Odyssey Journal
                                </Text>
                                <Text style={[styles.tagline, {
                                    color: isDark ? 'rgba(245, 241, 232, 0.7)' : 'rgba(44, 24, 16, 0.7)'
                                }]}>
                                    {t('auth.tagline')}
                                </Text>
                            </View>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formSection}>
                            {/* Email/Username Input with Floating Label */}
                            <View style={styles.inputGroup}>
                                <View style={[styles.inputContainer, {
                                    backgroundColor: isDark ? theme.surface : theme.surface,
                                    borderColor: emailFocused ? theme.borderFocused : theme.border,
                                    borderWidth: emailFocused ? 1.5 : 1,
                                }]}>
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        placeholder={t('auth.emailOrUsername')}
                                        placeholderTextColor={theme.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                    />
                                </View>
                                {(emailFocused || email.length > 0) && (
                                    <View style={[styles.floatingLabelContainer, {
                                        backgroundColor: isDark ? theme.surface : theme.surface,
                                    }]}>
                                        <Text style={[styles.floatingLabel, {
                                            color: emailFocused ? theme.primaryGold : theme.textMuted,
                                        }]}>
                                            {t('auth.emailOrUsername')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Password Input with Floating Label */}
                            <View style={styles.inputGroup}>
                                <View style={[styles.inputContainer, {
                                    backgroundColor: isDark ? theme.surface : theme.surface,
                                    borderColor: passwordFocused ? theme.borderFocused : theme.border,
                                    borderWidth: passwordFocused ? 1.5 : 1,
                                }]}>
                                    <TextInput
                                        style={[styles.input, styles.inputWithIcon, { color: theme.text }]}
                                        placeholder={t('auth.password')}
                                        placeholderTextColor={theme.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        secureTextEntry={!showPassword}
                                        autoComplete="password"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.visibilityButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color={isDark ? 'rgba(212, 165, 116, 0.5)' : 'rgba(44, 24, 16, 0.4)'}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {(passwordFocused || password.length > 0) && (
                                    <View style={[styles.floatingLabelContainer, {
                                        backgroundColor: isDark ? theme.surface : theme.surface,
                                    }]}>
                                        <Text style={[styles.floatingLabel, {
                                            color: passwordFocused ? theme.primaryGold : theme.textMuted,
                                        }]}>
                                            {t('auth.password')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Forgot Password Link */}
                            <View style={styles.forgotPasswordContainer}>
                                <Link href="/forgot-password" asChild>
                                    <TouchableOpacity activeOpacity={0.7}>
                                        <Text style={[styles.forgotPasswordText, { color: theme.tealLink }]}>
                                            {t('auth.forgotPassword')}
                                        </Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>

                            {/* Primary Login Button */}
                            <TouchableOpacity
                                style={{
                                    backgroundColor: isDark ? '#D4A574' : '#2C1810',
                                    borderRadius: 12,
                                    paddingVertical: 16,
                                    alignItems: 'center' as const,
                                    justifyContent: 'center' as const,
                                    marginTop: 8,
                                    shadowColor: isDark ? '#D4A574' : '#2C1810',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: isDark ? 0.3 : 0.15,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                                onPress={signInWithEmail}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <ActivityIndicator color={isDark ? '#2C1810' : '#D4A574'} />
                                ) : (
                                    <Text style={{
                                        fontFamily: Typography.fonts.heading,
                                        fontSize: 18,
                                        fontWeight: '700',
                                        color: isDark ? '#2C1810' : '#D4A574',
                                    }}>
                                        {t('auth.login')}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
                                <View style={[styles.dividerTextContainer, { backgroundColor: theme.background }]}>
                                    <Text style={[styles.dividerText, {
                                        color: isDark ? 'rgba(212, 165, 116, 0.5)' : 'rgba(44, 24, 16, 0.5)',
                                    }]}>
                                        {t('auth.orContinueWith')}
                                    </Text>
                                </View>
                                <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
                            </View>

                            {/* Social Login Buttons - Circular */}
                            <View style={styles.socialButtonsContainer}>
                                {/* Google Button */}
                                <TouchableOpacity
                                    style={[styles.socialButtonCircle, {
                                        backgroundColor: isDark ? theme.surface : '#FFFFFF',
                                        borderColor: isDark ? 'rgba(212, 165, 116, 0.2)' : 'rgba(44, 24, 16, 0.1)',
                                    }]}
                                    onPress={signInWithGoogle}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={require('@/assets/icons/icon _google.png')}
                                        style={styles.socialIcon}
                                        contentFit="contain"
                                    />
                                </TouchableOpacity>

                                {/* Apple Button */}
                                <TouchableOpacity
                                    style={[styles.socialButtonCircle, {
                                        backgroundColor: '#181611',
                                        borderColor: '#000000',
                                    }]}
                                    onPress={signInWithApple}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="logo-apple"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        {/* Sign Up Button */}
                        <Link href="/signup" asChild>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: isDark ? '#3a2e26' : '#FFFFFF',
                                    borderColor: isDark ? 'rgba(212, 165, 116, 0.5)' : 'rgba(44, 24, 16, 0.25)',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    paddingVertical: 14,
                                    paddingHorizontal: 12,
                                    alignItems: 'center' as const,
                                    justifyContent: 'center' as const,
                                    shadowColor: '#2C1810',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={{
                                    fontFamily: Typography.fonts.heading,
                                    fontSize: 16,
                                    fontWeight: '700',
                                    color: isDark ? '#D4A574' : '#2C1810',
                                }}>
                                    {t('auth.createAccount')}
                                </Text>
                            </TouchableOpacity>
                        </Link>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={[styles.footerText, {
                                color: isDark ? 'rgba(245, 241, 232, 0.4)' : 'rgba(44, 24, 16, 0.5)',
                            }]}>
                                {t('auth.copyright')}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        minHeight: '100%',
    },
    spacerTop: {
        height: 16,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        maxWidth: 380,
        width: '100%',
        alignSelf: 'center',
        gap: 24,
    },
    logoSection: {
        alignItems: 'center',
        gap: 20,
        marginBottom: 8,
    },
    logoContainer: {
        width: 112,
        height: 112,
        borderRadius: 56,
        overflow: 'hidden',
        borderWidth: 3,
        ...Shadows.lg,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    titleContainer: {
        alignItems: 'center',
        gap: 4,
    },
    appTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    tagline: {
        fontFamily: Typography.fonts.body,
        fontStyle: 'italic',
        fontSize: 15,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    formSection: {
        gap: 20,
        marginTop: 8,
    },
    inputGroup: {
        position: 'relative',
    },
    inputContainer: {
        borderRadius: BorderRadius.lg,
        paddingHorizontal: 16,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        ...Shadows.sm,
    },
    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        height: '100%',
    },
    inputWithIcon: {
        paddingRight: 40,
    },
    floatingLabelContainer: {
        position: 'absolute',
        top: -10,
        left: 12,
        paddingHorizontal: 4,
    },
    floatingLabel: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
    },
    visibilityButton: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginTop: -4,
    },
    forgotPasswordText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
        fontWeight: '500',
    },
    primaryButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        ...Shadows.md,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    primaryButtonText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerTextContainer: {
        paddingHorizontal: 16,
    },
    dividerText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
        fontWeight: '500',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
    },
    socialButtonCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    socialIcon: {
        width: 24,
        height: 24,
    },
    bottomSection: {
        maxWidth: 380,
        width: '100%',
        alignSelf: 'center',
        gap: 24,
        marginTop: 16,
        marginBottom: 8,
    },
    secondaryButton: {
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    secondaryButtonText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 8,
    },
    footerText: {
        fontFamily: 'System',
        fontSize: 11,
        letterSpacing: 0.5,
    },
});
