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

// Updated Stitch design colors matching the login screen
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

    // Focus states for floating labels
    const [fullNameFocused, setFullNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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
                                Yolculuğuna bugün başla.
                            </Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Full Name Input with Floating Label */}
                        <View style={styles.inputGroup}>
                            <View style={[styles.inputContainer, {
                                backgroundColor: isDark ? theme.surface : theme.surface,
                                borderColor: fullNameFocused ? theme.borderFocused : theme.border,
                                borderWidth: fullNameFocused ? 1.5 : 1,
                            }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Ad Soyad"
                                    placeholderTextColor={theme.textMuted}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    onFocus={() => setFullNameFocused(true)}
                                    onBlur={() => setFullNameFocused(false)}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                />
                            </View>
                            {(fullNameFocused || fullName.length > 0) && (
                                <View style={[styles.floatingLabelContainer, {
                                    backgroundColor: isDark ? theme.surface : theme.surface,
                                }]}>
                                    <Text style={[styles.floatingLabel, {
                                        color: fullNameFocused ? theme.primaryGold : theme.textMuted,
                                    }]}>
                                        Ad Soyad
                                    </Text>
                                </View>
                            )}
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

                        {/* Password Input with Floating Label */}
                        <View style={styles.inputGroup}>
                            <View style={[styles.inputContainer, {
                                backgroundColor: isDark ? theme.surface : theme.surface,
                                borderColor: passwordFocused ? theme.borderFocused : theme.border,
                                borderWidth: passwordFocused ? 1.5 : 1,
                            }]}>
                                <TextInput
                                    style={[styles.input, styles.inputWithIcon, { color: theme.text }]}
                                    placeholder="Şifre (en az 6 karakter)"
                                    placeholderTextColor={theme.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    secureTextEntry={!showPassword}
                                    autoComplete="new-password"
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
                                        Şifre
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Confirm Password Input with Floating Label */}
                        <View style={styles.inputGroup}>
                            <View style={[styles.inputContainer, {
                                backgroundColor: isDark ? theme.surface : theme.surface,
                                borderColor: confirmPasswordFocused ? theme.borderFocused : theme.border,
                                borderWidth: confirmPasswordFocused ? 1.5 : 1,
                            }]}>
                                <TextInput
                                    style={[styles.input, styles.inputWithIcon, { color: theme.text }]}
                                    placeholder="Şifre Tekrar"
                                    placeholderTextColor={theme.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() => setConfirmPasswordFocused(true)}
                                    onBlur={() => setConfirmPasswordFocused(false)}
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="new-password"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.visibilityButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={isDark ? 'rgba(212, 165, 116, 0.5)' : 'rgba(44, 24, 16, 0.4)'}
                                    />
                                </TouchableOpacity>
                            </View>
                            {(confirmPasswordFocused || confirmPassword.length > 0) && (
                                <View style={[styles.floatingLabelContainer, {
                                    backgroundColor: isDark ? theme.surface : theme.surface,
                                }]}>
                                    <Text style={[styles.floatingLabel, {
                                        color: confirmPasswordFocused ? theme.primaryGold : theme.textMuted,
                                    }]}>
                                        Şifre Tekrar
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Terms Checkbox */}
                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, {
                                backgroundColor: acceptTerms ? theme.primaryGold : 'transparent',
                                borderColor: acceptTerms ? theme.primaryGold : theme.border,
                            }]}>
                                {acceptTerms && (
                                    <Ionicons name="checkmark" size={14} color="#2C1810" />
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
                                opacity: loading ? 0.7 : 1,
                            }}
                            onPress={signUpWithEmail}
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
                                    Hesap Oluştur
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
                                    veya şununla kayıt ol
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
                                onPress={signUpWithGoogle}
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
                                onPress={signUpWithApple}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="logo-apple"
                                    size={24}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.loginLinkContainer}>
                            <Text style={[styles.loginLinkText, {
                                color: isDark ? 'rgba(245, 241, 232, 0.6)' : 'rgba(44, 24, 16, 0.6)'
                            }]}>
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
        paddingTop: 48,
        paddingBottom: 24,
        maxWidth: 380,
        width: '100%',
        alignSelf: 'center',
    },
    logoSection: {
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
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
        gap: 4,
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
        fontSize: 15,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    formSection: {
        gap: 16,
    },
    inputGroup: {
        position: 'relative',
    },
    inputContainer: {
        borderRadius: BorderRadius.lg,
        paddingHorizontal: 16,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        ...Shadows.sm,
    },
    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 15,
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
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
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
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
        fontFamily: 'System',
        fontSize: 11,
        letterSpacing: 0.5,
    },
});
