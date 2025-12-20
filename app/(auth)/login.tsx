import { BorderRadius, Shadows, Typography } from '@/constants/theme';
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

// Stitch design colors
const StitchColors = {
    light: {
        primary: '#f4c025',
        background: '#f8f8f5',
        surface: '#FFFDF5',
        text: '#221e10',
        textSecondary: '#181611',
        textMuted: '#8a8060',
        border: '#e6e3db',
        tealLink: '#008080',
        divider: '#e6e3db',
    },
    dark: {
        primary: '#f4c025',
        background: '#221e10',
        surface: '#2f2b1d',
        text: '#e6e3db',
        textSecondary: '#e6e3db',
        textMuted: '#8a8060',
        border: '#4a4430',
        tealLink: '#20b2aa',
        divider: '#4a4430',
    },
};

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? StitchColors.dark : StitchColors.light;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert('Giriş Hatası', error.message);
        setLoading(false);
    }

    async function signInWithGoogle() {
        Alert.alert('Yakında', 'Google ile giriş yakında aktif olacak!');
    }

    async function signInWithApple() {
        Alert.alert('Yakında', 'Apple ile giriş yakında aktif olacak!');
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
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={[styles.logoContainer, { backgroundColor: `${theme.primary}20` }]}>
                            <Image
                                source={require('@/assets/images/icon.png')}
                                style={styles.logoImage}
                                contentFit="cover"
                            />
                        </View>
                        <Text style={[styles.appTitle, { color: isDark ? theme.primary : theme.text }]}>
                            Odyssey Journal
                        </Text>
                        <Text style={[styles.tagline, { color: theme.textMuted }]}>
                            Dünyayı keşfet, hikayeni paylaş.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Email/Username Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>
                                E-posta veya Kullanıcı Adı
                            </Text>
                            <View style={[styles.inputContainer, {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                            }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="seyahatsever@mail.com"
                                    placeholderTextColor={theme.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color={theme.textMuted}
                                    style={styles.inputIcon}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>
                                Şifre
                            </Text>
                            <View style={[styles.inputContainer, {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                            }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="******"
                                    placeholderTextColor={theme.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.visibilityButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={theme.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password Link */}
                        <View style={styles.forgotPasswordContainer}>
                            <Link href="/forgot-password" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.forgotPasswordText, { color: theme.tealLink }]}>
                                        Şifremi Unuttum?
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        {/* Primary Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: theme.primary },
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={signInWithEmail}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={StitchColors.light.text} />
                            ) : (
                                <Text style={[styles.primaryButtonText, { color: StitchColors.light.text }]}>
                                    Giriş Yap
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
                            <Text style={[styles.dividerText, {
                                color: theme.textMuted,
                                backgroundColor: theme.background,
                            }]}>
                                veya şununla devam et
                            </Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
                        </View>

                        {/* Social Login Buttons */}
                        <View style={styles.socialButtonsContainer}>
                            {/* Google Button */}
                            <TouchableOpacity
                                style={[styles.socialButton, {
                                    backgroundColor: isDark ? theme.surface : '#FFFFFF',
                                    borderColor: theme.border,
                                }]}
                                onPress={signInWithGoogle}
                                activeOpacity={0.7}
                            >
                                <GoogleIcon />
                                <Text style={[styles.socialButtonText, { color: theme.text }]}>
                                    Google
                                </Text>
                            </TouchableOpacity>

                            {/* Apple Button */}
                            <TouchableOpacity
                                style={[styles.socialButton, {
                                    backgroundColor: isDark ? theme.surface : '#181611',
                                    borderColor: isDark ? theme.border : '#181611',
                                }]}
                                onPress={signInWithApple}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="logo-apple"
                                    size={20}
                                    color={isDark ? theme.text : '#FFFFFF'}
                                />
                                <Text style={[styles.socialButtonText, {
                                    color: isDark ? theme.text : '#FFFFFF',
                                }]}>
                                    Apple
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Button - Stitch Design: White bg with thin dark border */}
                        <Link href="/signup" asChild>
                            <TouchableOpacity
                                style={{
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: isDark ? '#4a4430' : '#221e10',
                                    backgroundColor: isDark ? '#2f2b1d' : '#FFFFFF',
                                    paddingVertical: 14,
                                    paddingHorizontal: 12,
                                    alignItems: 'center' as const,
                                    justifyContent: 'center' as const,
                                    marginTop: 16,
                                    shadowColor: '#2C1810',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1,
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={{
                                    fontFamily: Typography.fonts.uiBold,
                                    fontSize: 16,
                                    fontWeight: '700',
                                    color: isDark ? '#e6e3db' : '#221e10',
                                }}>
                                    Hesap Oluştur
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textMuted }]}>
                            © 2024 Odyssey Journal. Tüm hakları saklıdır.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Google Icon SVG Component
function GoogleIcon() {
    return (
        <View style={{ width: 20, height: 20 }}>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
        </View>
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
        paddingTop: 60,
        paddingBottom: 24,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        overflow: 'hidden',
        marginBottom: 16,
        ...Shadows.lg,
    },
    logoImage: {
        width: '100%',
        height: '100%',
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
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    formSection: {
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 56,
        ...Shadows.sm,
    },
    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        height: '100%',
    },
    inputIcon: {
        marginLeft: 8,
    },
    visibilityButton: {
        padding: 4,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
    },
    primaryButton: {
        borderRadius: BorderRadius.lg,
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
        fontFamily: Typography.fonts.uiBold,
        fontSize: 16,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        paddingHorizontal: 12,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingVertical: 14,
        ...Shadows.sm,
    },
    socialButtonText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1, // Thin border as shown in Stitch design
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        ...Shadows.sm,
    },
    secondaryButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
    },
});
