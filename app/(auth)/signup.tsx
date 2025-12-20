import { BorderRadius, Shadows, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
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

export default function SignUpScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? StitchColors.dark : StitchColors.light;

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    async function signUpWithEmail() {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (!acceptTerms) {
            Alert.alert('Hata', 'Devam etmek için kullanım koşullarını kabul etmelisiniz.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    display_name: fullName.split(' ')[0],
                },
            },
        });

        if (error) {
            Alert.alert('Kayıt Hatası', error.message);
        } else {
            Alert.alert(
                'Hesap Oluşturuldu!',
                'Hesabınızı doğrulamak için e-posta kutunuzu kontrol edin.',
                [{ text: 'Tamam', onPress: () => router.push('/login') }]
            );
        }
        setLoading(false);
    }

    async function signUpWithGoogle() {
        Alert.alert('Yakında', 'Google ile kayıt yakında aktif olacak!');
    }

    async function signUpWithApple() {
        Alert.alert('Yakında', 'Apple ile kayıt yakında aktif olacak!');
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
                            Yolculuğuna bugün başla.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Full Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>
                                Ad Soyad
                            </Text>
                            <View style={[styles.inputContainer, {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                            }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Ahmet Yılmaz"
                                    placeholderTextColor={theme.textMuted}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                />
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color={theme.textMuted}
                                    style={styles.inputIcon}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>
                                E-posta Adresi
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
                                    name="mail-outline"
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
                                    placeholder="En az 6 karakter"
                                    placeholderTextColor={theme.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="new-password"
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

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>
                                Şifre Tekrar
                            </Text>
                            <View style={[styles.inputContainer, {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                            }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Şifrenizi tekrar girin"
                                    placeholderTextColor={theme.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="new-password"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.visibilityButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={theme.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Terms Checkbox */}
                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, {
                                backgroundColor: acceptTerms ? theme.primary : 'transparent',
                                borderColor: acceptTerms ? theme.primary : theme.border,
                            }]}>
                                {acceptTerms && (
                                    <Ionicons name="checkmark" size={14} color={StitchColors.light.text} />
                                )}
                            </View>
                            <Text style={[styles.termsText, { color: theme.textMuted }]}>
                                <Text style={{ color: theme.tealLink }}>Kullanım Koşulları</Text>
                                {' '}ve{' '}
                                <Text style={{ color: theme.tealLink }}>Gizlilik Politikası</Text>
                                'nı kabul ediyorum.
                            </Text>
                        </TouchableOpacity>

                        {/* Primary Sign Up Button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: theme.primary },
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={signUpWithEmail}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={StitchColors.light.text} />
                            ) : (
                                <Text style={[styles.primaryButtonText, { color: StitchColors.light.text }]}>
                                    Hesap Oluştur
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
                                veya şununla kayıt ol
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
                                onPress={signUpWithGoogle}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-google" size={20} color="#4285F4" />
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
                                onPress={signUpWithApple}
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

                        {/* Login Link */}
                        <View style={styles.loginLinkContainer}>
                            <Text style={[styles.loginLinkText, { color: theme.textMuted }]}>
                                Zaten hesabın var mı?{' '}
                            </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.loginLink, { color: theme.tealLink }]}>
                                        Giriş Yap
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
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
        paddingTop: 48,
        paddingBottom: 24,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: 12,
        ...Shadows.lg,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    appTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    tagline: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        marginTop: 6,
        textAlign: 'center',
    },
    formSection: {
        gap: 14,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 15,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 52,
        ...Shadows.sm,
    },
    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 15,
        height: '100%',
    },
    inputIcon: {
        marginLeft: 8,
    },
    visibilityButton: {
        padding: 4,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    termsText: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        lineHeight: 20,
    },
    primaryButton: {
        borderRadius: BorderRadius.lg,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
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
        marginVertical: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
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
        gap: 10,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingVertical: 12,
        ...Shadows.sm,
    },
    socialButtonText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        fontWeight: '600',
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    loginLinkText: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
    },
    loginLink: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
    },
});
