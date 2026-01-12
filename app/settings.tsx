import { EditProfileModal } from '@/components/edit-profile-modal';
import { LanguageSelectorModal } from '@/components/language-selector-modal';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { useCurrentProfile } from '@/hooks/use-profile';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Ayarlar renk paleti
const SettingsColors = {
    light: {
        background: '#F5F1E8',
        cardBg: 'rgba(255, 255, 255, 0.8)',
        cardBorder: '#D4A574',
        textPrimary: '#2C1810',
        textSecondary: 'rgba(44, 24, 16, 0.6)',
        accent: '#D4A574',
        accentDark: '#8B7355',
        sectionBg: 'rgba(212, 165, 116, 0.05)',
        border: 'rgba(212, 165, 116, 0.2)',
        stampRed: '#b91c1c',
    },
    dark: {
        background: '#2C1810',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        cardBorder: '#D4A574',
        textPrimary: '#F5F1E8',
        textSecondary: 'rgba(245, 241, 232, 0.6)',
        accent: '#D4A574',
        accentDark: '#8B7355',
        sectionBg: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(212, 165, 116, 0.2)',
        stampRed: '#b91c1c',
    },
};

export default function SettingsScreen() {
    const { colorScheme, isDark, themePreference, setThemePreference } = useTheme();
    const colors = isDark ? SettingsColors.dark : SettingsColors.light;
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { language } = useLanguage();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useCurrentProfile();

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: signOut,
                },
            ]
        );
    };

    const handleEditSuccess = async () => {
        await refetchProfile();
    };

    const displayProfile = profile || {
        id: user?.id || '',
        full_name: user?.email?.split('@')[0] || 'Gezgin',
        username: user?.email?.split('@')[0] || 'user',
        avatar_url: null,
        bio: null,
        website: null,
        updated_at: new Date().toISOString(),
    };

    if (profileLoading) {
        return (
            <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </ThemedView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(300)}
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        backgroundColor: isDark ? 'rgba(44, 24, 16, 0.9)' : 'rgba(245, 241, 232, 0.9)',
                        borderBottomColor: colors.border,
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={28} color={isDark ? colors.accent : colors.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
                    AYARLAR
                </Text>

                <View style={styles.headerSpacer} />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <Animated.View
                    entering={FadeInDown.delay(100).duration(400)}
                    style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.accent }]}
                >
                    {/* Corner Decorations */}
                    <View style={[styles.cornerDecoration, styles.cornerTopLeft, { borderColor: colors.accent }]} />
                    <View style={[styles.cornerDecoration, styles.cornerTopRight, { borderColor: colors.accent }]} />
                    <View style={[styles.cornerDecoration, styles.cornerBottomLeft, { borderColor: colors.accent }]} />
                    <View style={[styles.cornerDecoration, styles.cornerBottomRight, { borderColor: colors.accent }]} />

                    <View style={styles.profileContent}>
                        <Text style={[styles.profileSectionLabel, { color: colors.accent, borderBottomColor: colors.border }]}>
                            Pasaport Sahibi / Holder
                        </Text>

                        {/* Avatar */}
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={() => setEditModalVisible(true)}
                        >
                            <View style={[styles.avatarFrame, { borderColor: colors.accent }]}>
                                {displayProfile.avatar_url ? (
                                    <Image
                                        source={{ uri: displayProfile.avatar_url }}
                                        style={styles.avatarImage}
                                        contentFit="cover"
                                    />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.sectionBg }]}>
                                        <Ionicons name="person" size={40} color={colors.textSecondary} />
                                    </View>
                                )}
                            </View>
                            <View style={[styles.editAvatarButton, { backgroundColor: colors.textPrimary, borderColor: colors.background }]}>
                                <Ionicons name="create" size={12} color={colors.accent} />
                            </View>
                        </TouchableOpacity>

                        {/* Name & Email */}
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                                {displayProfile.full_name}
                            </Text>
                            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                                {user?.email}
                            </Text>
                        </View>

                        {/* Edit Profile Button */}
                        <TouchableOpacity
                            style={[styles.editProfileButton, { borderBottomColor: colors.accent }]}
                            onPress={() => setEditModalVisible(true)}
                        >
                            <Text style={[styles.editProfileButtonText, { color: colors.accent }]}>
                                Profili Düzenle
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Appearance Section */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(400)}
                    style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: `${colors.accent}99` }]}
                >
                    <View style={[styles.sectionHeader, { backgroundColor: colors.sectionBg, borderBottomColor: colors.border }]}>
                        <Ionicons name="eye-outline" size={20} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>GÖRÜNÜM</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Tema</Text>
                                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>Aydınlık / Karanlık</Text>
                            </View>
                            <View style={styles.themeToggle}>
                                <Ionicons
                                    name="sunny"
                                    size={24}
                                    color={!isDark ? colors.accent : colors.textSecondary}
                                    style={!isDark && styles.activeIcon}
                                />
                                <Switch
                                    value={isDark}
                                    onValueChange={(value) => setThemePreference(value ? 'dark' : 'light')}
                                    trackColor={{ false: `${colors.accentDark}30`, true: `${colors.accent}30` }}
                                    thumbColor={isDark ? colors.accent : colors.accentDark}
                                    ios_backgroundColor={`${colors.accentDark}30`}
                                    style={styles.themeSwitch}
                                />
                                <Ionicons
                                    name="moon"
                                    size={24}
                                    color={isDark ? colors.accent : colors.textSecondary}
                                    style={isDark && styles.activeIcon}
                                />
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Language Section */}
                <Animated.View
                    entering={FadeInDown.delay(300).duration(400)}
                    style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: `${colors.accent}99` }]}
                >
                    <View style={[styles.sectionHeader, { backgroundColor: colors.sectionBg, borderBottomColor: colors.border }]}>
                        <Ionicons name="language-outline" size={20} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>DİL SEÇENEKLERİ</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity
                            style={[styles.languageSelector, { backgroundColor: colors.sectionBg, borderColor: colors.border }]}
                            onPress={() => setLanguageModalVisible(true)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.languageSelectorLeft}>
                                <View style={[styles.flagContainer, { borderColor: colors.accent }]}>
                                    <Text style={styles.flagEmoji}>{SUPPORTED_LANGUAGES[language].flag}</Text>
                                </View>
                                <Text style={[styles.languageName, { color: colors.textPrimary }]}>
                                    {SUPPORTED_LANGUAGES[language].nativeName}
                                </Text>
                            </View>
                            <View style={[styles.chevronContainer, { backgroundColor: colors.sectionBg, borderColor: colors.border }]}>
                                <Ionicons name="chevron-down" size={20} color={colors.accent} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Logout Section */}
                <Animated.View
                    entering={FadeInDown.delay(400).duration(400)}
                    style={styles.logoutSection}
                >

                    <TouchableOpacity
                        style={[styles.logoutButton]}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <View style={styles.logoutButtonDashedBorder} />
                        <View style={[styles.logoutButtonInner, { backgroundColor: isDark ? 'rgba(30, 25, 20, 0.9)' : 'rgba(248, 247, 246, 0.9)' }]}>
                            <Ionicons name="log-out-outline" size={24} color={colors.stampRed} />
                            <Text style={[styles.logoutButtonText, { color: colors.stampRed }]}>
                                ÇIKIŞ / EXIT
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Version Info */}
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                        V. 1.0.0 • Build 2026
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={editModalVisible}
                profile={displayProfile}
                onClose={() => setEditModalVisible(false)}
                onSuccess={handleEditSuccess}
            />

            {/* Language Selector Modal */}
            <LanguageSelectorModal
                visible={languageModalVisible}
                onClose={() => setLanguageModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 3,
        fontFamily: Typography.fonts.heading,
    },
    headerSpacer: {
        width: 40,
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        gap: Spacing.lg,
    },

    // Profile Card
    profileCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 4,
        position: 'relative',
        overflow: 'hidden',
        ...Shadows.lg,
    },
    cornerDecoration: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderWidth: 2,
    },
    cornerTopLeft: {
        top: 8,
        left: 8,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 12,
    },
    cornerTopRight: {
        top: 8,
        right: 8,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 12,
    },
    cornerBottomLeft: {
        bottom: 8,
        left: 8,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 12,
    },
    cornerBottomRight: {
        bottom: 8,
        right: 8,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 12,
    },
    profileContent: {
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.md,
    },
    profileSectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        paddingBottom: 4,
        width: '100%',
        textAlign: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarFrame: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        overflow: 'hidden',
        ...Shadows.md,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    profileInfo: {
        alignItems: 'center',
        gap: 4,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: Typography.fonts.heading,
    },
    profileEmail: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    editProfileButton: {
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        paddingBottom: 2,
        marginTop: Spacing.sm,
    },
    editProfileButtonText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    // Section Card
    sectionCard: {
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        ...Shadows.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    sectionContent: {
        padding: Spacing.sm,
    },

    // Setting Row
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    settingInfo: {
        gap: 2,
    },
    settingLabel: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Typography.fonts.body,
    },
    settingSubLabel: {
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    themeSwitch: {
        transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [],
    },
    activeIcon: {
        opacity: 1,
    },

    // Language Selector
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        ...Shadows.sm,
    },
    languageSelectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    flagContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    flagEmoji: {
        fontSize: 20,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Typography.fonts.body,
        letterSpacing: 0.5,
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Logout Section
    logoutSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.lg,
    },
    logoutButton: {
        width: '100%',
        maxWidth: 280,
        position: 'relative',
        transform: [{ rotate: '-2deg' }],
    },
    logoutButtonDashedBorder: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderWidth: 3,
        borderStyle: 'dashed',
        borderColor: 'rgba(185, 28, 28, 0.4)',
        borderRadius: 12,
    },
    logoutButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderWidth: 4,
        borderColor: '#b91c1c',
        borderRadius: 8,
        ...Shadows.sm,
    },
    logoutButtonText: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    versionText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: Spacing.md,
    },
});
