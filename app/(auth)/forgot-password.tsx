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

// Updated Stitch design colors matching login/signup screens
const StitchColors = {
    light: {
        primaryGold: '#D4A574',
        primaryDark: '#2C1810',
        background: '#F5F1E8',
        surface: '#FFFDF5',
        text: '#2C1810',
        textMuted: 'rgba(44, 24, 16, 0.6)',
        border: 'rgba(44, 24, 16, 0.2)',
        borderFocused: '#D4A574',
        tealLink: '#008080',
        divider: 'rgba(44, 24, 16, 0.1)',
        success: '#6B8E23',
    },
    dark: {
        primaryGold: '#D4A574',
        primaryDark: '#2C1810',
        background: '#2C1810',
        surface: '#3a2e26',
        text: '#F5F1E8',
        textMuted: 'rgba(212, 165, 116, 0.7)',
        border: 'rgba(212, 165, 116, 0.3)',
        borderFocused: '#D4A574',
        tealLink: '#20b2aa',
        divider: 'rgba(212, 165, 116, 0.2)',
        success: '#8FBC8F',
    },
};

export default function ForgotPasswordScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? StitchColors.dark : StitchColors.light;

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);

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
                    <View style={[styles.successIconContainer, {
                        backgroundColor: isDark ? 'rgba(143, 188, 143, 0.15)' : 'rgba(107, 142, 35, 0.1)',
                        borderWidth: 3,
                        borderColor: isDark ? 'rgba(143, 188, 143, 0.3)' : 'rgba(107, 142, 35, 0.2)',
                    }]}>
                        <Ionicons name="mail-open-outline" size={48} color={theme.success} />
                    </View>

                    <Text style={[styles.successTitle, {
                        color: isDark ? theme.primaryGold : theme.primaryDark
                    }]}>
                        E-posta Gönderildi!
                    </Text>

                    <Text style={[styles.successMessage, {
                        color: isDark ? 'rgba(245, 241, 232, 0.7)' : 'rgba(44, 24, 16, 0.7)'
                    }]}>
                        Şifre sıfırlama bağlantısı{'\n'}
                        <Text style={{ color: theme.tealLink, fontWeight: '600' }}>{email}</Text>
                        {'\n'}adresine gönderildi.
                    </Text>

                    <Text style={[styles.successHint, {
                        color: isDark ? 'rgba(245, 241, 232, 0.5)' : 'rgba(44, 24, 16, 0.5)'
                    }]}>
                        E-posta gelen kutunuzu kontrol edin. Spam klasörünü de kontrol etmeyi unutmayın.
                    </Text>

                    {/* Back to Login Button */}
                    <Link href="/login" asChild>
                        <TouchableOpacity
                            style={{
                                backgroundColor: isDark ? '#D4A574' : '#2C1810',
                                borderRadius: 12,
                                paddingVertical: 16,
                                paddingHorizontal: 32,
                                alignItems: 'center' as const,
                                justifyContent: 'center' as const,
                                shadowColor: isDark ? '#D4A574' : '#2C1810',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: isDark ? 0.3 : 0.15,
                                shadowRadius: 4,
                                elevation: 3,
                                width: '100%',
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={{
                                fontFamily: Typography.fonts.heading,
                                fontSize: 18,
                                fontWeight: '700',
                                color: isDark ? '#2C1810' : '#D4A574',
                            }}>
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
                        style={[styles.backButton, {
                            backgroundColor: isDark ? 'rgba(212, 165, 116, 0.1)' : 'rgba(44, 24, 16, 0.05)',
                        }]}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={isDark ? theme.primaryGold : theme.primaryDark} />
                    </TouchableOpacity>

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
                                Şifremi Unuttum
                            </Text>
                            <Text style={[styles.tagline, {
                                color: isDark ? 'rgba(245, 241, 232, 0.7)' : 'rgba(44, 24, 16, 0.7)'
                            }]}>
                                Endişelenme, herkese olabilir.{'\n'}
                                Şifreni sıfırlamak için e-posta adresini gir.
                            </Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Key Illustration */}
                        <View style={[styles.illustrationContainer, {
                            backgroundColor: isDark ? 'rgba(212, 165, 116, 0.1)' : 'rgba(212, 165, 116, 0.15)',
                            borderWidth: 2,
                            borderColor: isDark ? 'rgba(212, 165, 116, 0.2)' : 'rgba(212, 165, 116, 0.3)',
                        }]}>
                            <Ionicons name="key-outline" size={40} color={theme.primaryGold} />
                        </View>

                        {/* Email Input with Floating Label */}
                        <View style={styles.inputGroup}>
                            <View style={[styles.inputContainer, {
                                backgroundColor: isDark ? theme.surface : theme.surface,
                                borderColor: emailFocused ? theme.borderFocused : theme.border,
                                borderWidth: emailFocused ? 1.5 : 1,
                            }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="E-posta Adresi"
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
                                        E-posta Adresi
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Reset Password Button */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: isDark ? '#D4A574' : '#2C1810',
                                borderRadius: 12,
                                paddingVertical: 16,
                                flexDirection: 'row',
                                alignItems: 'center' as const,
                                justifyContent: 'center' as const,
                                marginTop: 8,
                                shadowColor: isDark ? '#D4A574' : '#2C1810',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: isDark ? 0.3 : 0.15,
                                shadowRadius: 4,
                                elevation: 3,
                                opacity: loading ? 0.7 : 1,
                            }}
                            onPress={handleResetPassword}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color={isDark ? '#2C1810' : '#D4A574'} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="send-outline"
                                        size={18}
                                        color={isDark ? '#2C1810' : '#D4A574'}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={{
                                        fontFamily: Typography.fonts.heading,
                                        fontSize: 16,
                                        fontWeight: '700',
                                        color: isDark ? '#2C1810' : '#D4A574',
                                    }}>
                                        Sıfırlama Bağlantısı Gönder
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Remember Password Link */}
                        <View style={styles.loginLinkContainer}>
                            <Text style={[styles.loginLinkText, {
                                color: isDark ? 'rgba(245, 241, 232, 0.6)' : 'rgba(44, 24, 16, 0.6)'
                            }]}>
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
                        <View style={[styles.securityNote, {
                            backgroundColor: isDark ? 'rgba(212, 165, 116, 0.08)' : 'rgba(212, 165, 116, 0.1)',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(212, 165, 116, 0.15)' : 'rgba(212, 165, 116, 0.2)',
                        }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={theme.primaryGold} />
                            <Text style={[styles.securityNoteText, {
                                color: isDark ? 'rgba(245, 241, 232, 0.6)' : 'rgba(44, 24, 16, 0.6)'
                            }]}>
                                Güvenliğiniz için şifre sıfırlama bağlantısı 1 saat geçerlidir.
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, {
                            color: isDark ? 'rgba(245, 241, 232, 0.4)' : 'rgba(44, 24, 16, 0.5)',
                        }]}>
                            © 2026 Odyssey Journal. Tüm hakları saklıdır.
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
        maxWidth: 380,
        width: '100%',
        alignSelf: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        zIndex: 10,
        padding: 10,
        borderRadius: 12,
    },
    logoSection: {
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        marginTop: 48,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
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
        gap: 8,
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
        fontStyle: 'italic',
        fontSize: 14,
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
        marginTop: 24,
        paddingTop: 16,
        paddingBottom: 16,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'System',
        fontSize: 11,
        letterSpacing: 0.5,
    },
    // Success State Styles
    successContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 120,
        alignItems: 'center',
        maxWidth: 380,
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
