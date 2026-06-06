/**
 * Change Password Modal Component
 * UI component for changing user account password
 */

import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const DesignColors = {
    light: {
        background: '#F5F1E8',
        surface: '#FFFFFF',
        text: '#2C1810',
        textMuted: 'rgba(44, 24, 16, 0.6)',
        accent: '#D4A574',
        border: 'rgba(212, 165, 116, 0.2)',
        error: '#EF4444',
        success: '#10B981',
    },
    dark: {
        background: '#2C1810',
        surface: 'rgba(255, 255, 255, 0.05)',
        text: '#F5F1E8',
        textMuted: 'rgba(245, 241, 232, 0.6)',
        accent: '#D4A574',
        border: 'rgba(212, 165, 116, 0.2)',
        error: '#EF4444',
        success: '#10B981',
    },
};

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;
    const { t } = useLanguage();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = async () => {
        setErrorMessage('');

        if (password.length < 6) {
            setErrorMessage(t('auth.passwordLengthError') || 'Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(t('auth.passwordMatchError') || 'Şifreler eşleşmiyor.');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            Alert.alert(
                t('common.success') || 'Başarılı',
                t('settings.passwordChangeSuccess') || 'Şifreniz başarıyla güncellendi.'
            );
            handleClose();
        } catch (error: any) {
            console.error('Error changing password:', error);
            setErrorMessage(error.message || t('errors.generic') || 'Şifre güncellenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setConfirmPassword('');
        setErrorMessage('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalContent, { backgroundColor: theme.background }]}
                >
                    <SafeAreaView style={styles.safeArea}>
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.title, { color: theme.text }]}>
                                {t('settings.changePassword') || 'Şifre Değiştir'}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {errorMessage ? (
                                <View style={[styles.errorBox, { backgroundColor: `${theme.error}15`, borderColor: theme.error }]}>
                                    <Ionicons name="alert-circle-outline" size={20} color={theme.error} />
                                    <Text style={[styles.errorText, { color: theme.text }]}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            {/* Password input */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                                    {t('auth.newPassword') || 'Yeni Şifre'}
                                </Text>
                                <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder={t('auth.enterNewPassword') || 'Yeni şifrenizi girin'}
                                        placeholderTextColor={theme.textMuted}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color={theme.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm password input */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                                    {t('auth.confirmNewPassword') || 'Yeni Şifre (Tekrar)'}
                                </Text>
                                <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder={t('auth.confirmNewPasswordPlaceholder') || 'Yeni şifrenizi tekrar girin'}
                                        placeholderTextColor={theme.textMuted}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color={theme.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: theme.accent }]}
                                onPress={handleSave}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#2C1810" />
                                ) : (
                                    <>
                                        <Text style={styles.submitButtonText}>
                                            {t('common.save') || 'Şifreyi Güncelle'}
                                        </Text>
                                        <Ionicons name="key" size={18} color="#2C1810" style={{ marginLeft: 6 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '100%',
    },
    safeArea: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    form: {
        padding: Spacing.lg,
        gap: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    errorText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 14,
        flex: 1,
    },
    inputContainer: {
        gap: 6,
    },
    inputLabel: {
        fontFamily: Typography.fonts.heading,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
    },
    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 15,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    },
    eyeIcon: {
        padding: Spacing.xs,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
        paddingVertical: 14,
        marginTop: Spacing.md,
    },
    submitButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 15,
        color: '#2C1810',
    },
});

export default ChangePasswordModal;
