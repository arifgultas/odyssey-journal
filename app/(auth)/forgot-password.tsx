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
        success: '#4CAF50',
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
        success: '#81C784',
    },
};

export default function ForgotPasswordScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? StitchColors.dark : StitchColors.light;

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    async function handleResetPassword() {
        if (!email) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'odysseyjournal://reset-password',
        });

        if (error) {
            Alert.alert('Hata', error.message);
        } else {
            setEmailSent(true);
        }
        setLoading(false);
    }

    if (emailSent) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.successContent}>
                    {/* Success Icon */}
                    <View style={[styles.successIconContainer, { backgroundColor: `${theme.success}20` }]}>
                        <Ionicons name="mail-open-outline" size={48} color={theme.success} />
                    </View>

                    <Text style={[styles.successTitle, { color: isDark ? theme.primary : theme.text }]}>
                        E-posta Gönderildi!
                    </Text>

                    <Text style={[styles.successMessage, { color: theme.textMuted }]}>
                        Şifre sıfırlama bağlantısı{'\n'}
                        <Text style={{ color: theme.tealLink, fontWeight: '600' }}>{email}</Text>
                        {'\n'}adresine gönderildi.
                    </Text>

                    <Text style={[styles.successHint, { color: theme.textMuted }]}>
                        E-posta gelen kutunuzu kontrol edin. Spam klasörünü de kontrol etmeyi unutmayın.
                    </Text>

                    {/* Back to Login Button */}
                    <Link href="/login" asChild>
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.primaryButtonText, { color: StitchColors.light.text }]}>
                                Giriş Sayfasına Dön
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    {/* Resend Link */}
                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={() => {
                            setEmailSent(false);
                            handleResetPassword();
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.resendText, { color: theme.tealLink }]}>
                            E-posta gelmedi mi? Tekrar gönder
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
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
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

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
                            Şifremi Unuttum
                        </Text>
                        <Text style={[styles.tagline, { color: theme.textMuted }]}>
                            Endişelenme, herkese olabilir.{'\n'}
                            Şifreni sıfırlamak için e-posta adresini gir.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Illustration */}
                        <View style={[styles.illustrationContainer, { backgroundColor: `${theme.primary}10` }]}>
                            <Ionicons name="key-outline" size={40} color={theme.primary} />
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
                                    autoFocus
                                />
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={theme.textMuted}
                                    style={styles.inputIcon}
                                />
                            </View>
                        </View>

                        {/* Reset Password Button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: theme.primary },
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleResetPassword}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={StitchColors.light.text} />
                            ) : (
                                <>
                                    <Ionicons name="send-outline" size={18} color={StitchColors.light.text} style={{ marginRight: 8 }} />
                                    <Text style={[styles.primaryButtonText, { color: StitchColors.light.text }]}>
                                        Sıfırlama Bağlantısı Gönder
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Remember Password Link */}
                        <View style={styles.loginLinkContainer}>
                            <Text style={[styles.loginLinkText, { color: theme.textMuted }]}>
                                Şifreni hatırladın mı?{' '}
                            </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.loginLink, { color: theme.tealLink }]}>
                                        Giriş Yap
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        {/* Security Note */}
                        <View style={[styles.securityNote, { backgroundColor: `${theme.primary}10` }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
                            <Text style={[styles.securityNoteText, { color: theme.textMuted }]}>
                                Güvenliğiniz için şifre sıfırlama bağlantısı 1 saat geçerlidir.
                            </Text>
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
        paddingTop: 60,
        paddingBottom: 24,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        zIndex: 10,
        padding: 8,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
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
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    tagline: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 22,
    },
    formSection: {
        gap: 20,
    },
    illustrationContainer: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
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
    primaryButton: {
        flexDirection: 'row',
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
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: BorderRadius.lg,
        marginTop: 8,
    },
    securityNoteText: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
    },
    // Success State Styles
    successContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 120,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    successIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
    },
    successMessage: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 12,
    },
    successHint: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    resendButton: {
        marginTop: 16,
        padding: 12,
    },
    resendText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        fontWeight: '600',
    },
});
