import { EditProfileModal } from '@/components/edit-profile-modal';
import { LanguageSelectorModal } from '@/components/language-selector-modal';
import { ChangePasswordModal } from '@/components/change-password-modal';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { ProfileCard } from '@/components/settings/profile-card';
import { SettingsRow } from '@/components/settings/settings-row';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { useCurrentProfile } from '@/hooks/use-profile';
import { isAdmin } from '@/lib/admin-service';
import { exportUserData } from '@/lib/export-data';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { removePushToken } from '@/lib/push-notifications';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
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
    const { t, language } = useLanguage();
    const { contentContainerStyle } = useResponsive();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useCurrentProfile();

    // Check admin status on mount
    React.useEffect(() => {
        isAdmin().then(setIsUserAdmin);
    }, []);

    const handleLogout = () => {
        Alert.alert(
            t('auth.logout'),
            t('settings.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('auth.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await removePushToken();
                        signOut();
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('settings.deleteAccount'),
            t('settings.deleteAccountConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('settings.deleteAccountButton'),
                    style: 'destructive',
                    onPress: () => {
                        // Second confirmation
                        Alert.alert(
                            `⚠️ ${t('settings.deleteAccount')}`,
                            t('settings.deleteAccountWarning'),
                            [
                                { text: t('common.cancel'), style: 'cancel' },
                                {
                                    text: t('settings.deleteAccountButton'),
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            // Call the database function to delete all user data
                                            const { error } = await supabase.rpc('delete_user_account');
                                            if (error) throw error;
                                            Alert.alert(t('common.success'), t('settings.accountDeleted'));
                                            signOut();
                                        } catch (error) {
                                            // Fallback: sign out even if server-side deletion fails
                                            // The user can contact support for data deletion
                                            console.error('Account deletion error:', error);
                                            Alert.alert(
                                                t('common.error'),
                                                t('errors.generic'),
                                            );
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const handleTogglePreference = async (key: 'likes' | 'comments' | 'follows', currentValue: boolean) => {
        if (!profile) return;

        const currentPrefs = profile.notification_preferences || { likes: true, comments: true, follows: true };
        const newPrefs = {
            ...currentPrefs,
            [key]: !currentValue
        };

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    notification_preferences: newPrefs,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (error) throw error;
            refetchProfile();
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            Alert.alert(t('common.error') || 'Hata', 'Tercihler güncellenirken bir hata oluştu.');
        }
    };

    const handleDownloadData = async () => {
        Alert.alert(
            t('settings.exportDataTitle') || 'Download Data',
            t('settings.exportDataDesc') || 'This will generate a file containing all your profile information, posts, comments, collections, and connections. The process may take a moment. Do you want to proceed?',
            [
                { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('settings.download') || 'Download',
                    onPress: async () => {
                        const success = await exportUserData(t);
                        if (success) {
                            Alert.alert('Success', t('settings.exportSuccess') || 'Data exported successfully.');
                        }
                    }
                }
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
            <View style={[{ flex: 1 }, contentContainerStyle]}>
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
                    {t('settings.title').toUpperCase()}
                </Text>

                <View style={styles.headerSpacer} />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <ProfileCard
                    colors={colors}
                    displayProfile={displayProfile}
                    user={user}
                    t={t}
                    onEditPress={() => setEditModalVisible(true)}
                />

                {/* Appearance Section */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(400)}
                    style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: `${colors.accent}99` }]}
                >
                    <View style={[styles.sectionHeader, { backgroundColor: colors.sectionBg, borderBottomColor: colors.border }]}>
                        <Ionicons name="eye-outline" size={20} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.appearance').toUpperCase()}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('settings.theme')}</Text>
                                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>{t('settings.lightDark')}</Text>
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
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.languageOptions').toUpperCase()}</Text>
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

                {/* Notification Preferences Section */}
                <Animated.View
                    entering={FadeInDown.delay(320).duration(400)}
                    style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: `${colors.accent}99` }]}
                >
                    <View style={[styles.sectionHeader, { backgroundColor: colors.sectionBg, borderBottomColor: colors.border }]}>
                        <Ionicons name="notifications-outline" size={20} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.notificationPreferences') || 'BİLDİRİM TERCİHLERİ'}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        {(() => {
                            const prefs = profile?.notification_preferences || { likes: true, comments: true, follows: true };
                            return (
                                <>
                                    <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: Spacing.sm }]}>
                                        <View style={styles.settingInfo}>
                                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('settings.likeNotifications') || 'Beğeniler'}</Text>
                                            <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>{t('settings.likeNotificationsDesc') || 'Gönderileriniz beğenildiğinde bildirim alın'}</Text>
                                        </View>
                                        <Switch
                                            value={prefs.likes}
                                            onValueChange={() => handleTogglePreference('likes', prefs.likes)}
                                            trackColor={{ false: `${colors.accentDark}30`, true: `${colors.accent}30` }}
                                            thumbColor={prefs.likes ? colors.accent : colors.accentDark}
                                            ios_backgroundColor={`${colors.accentDark}30`}
                                        />
                                    </View>

                                    <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: Spacing.sm }]}>
                                        <View style={styles.settingInfo}>
                                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('settings.commentNotifications') || 'Yorumlar'}</Text>
                                            <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>{t('settings.commentNotificationsDesc') || 'Gönderilerinize yorum yapıldığında bildirim alın'}</Text>
                                        </View>
                                        <Switch
                                            value={prefs.comments}
                                            onValueChange={() => handleTogglePreference('comments', prefs.comments)}
                                            trackColor={{ false: `${colors.accentDark}30`, true: `${colors.accent}30` }}
                                            thumbColor={prefs.comments ? colors.accent : colors.accentDark}
                                            ios_backgroundColor={`${colors.accentDark}30`}
                                        />
                                    </View>

                                    <View style={[styles.settingRow, { paddingTop: Spacing.sm }]}>
                                        <View style={styles.settingInfo}>
                                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('settings.followNotifications') || 'Takipçiler'}</Text>
                                            <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>{t('settings.followNotificationsDesc') || 'Biri sizi takip etmeye başladığında bildirim alın'}</Text>
                                        </View>
                                        <Switch
                                            value={prefs.follows}
                                            onValueChange={() => handleTogglePreference('follows', prefs.follows)}
                                            trackColor={{ false: `${colors.accentDark}30`, true: `${colors.accent}30` }}
                                            thumbColor={prefs.follows ? colors.accent : colors.accentDark}
                                            ios_backgroundColor={`${colors.accentDark}30`}
                                        />
                                    </View>
                                </>
                            );
                        })()}
                    </View>
                </Animated.View>

                {/* Admin Panel (only visible to admins) */}
                {isUserAdmin && (
                    <Animated.View
                        entering={FadeInDown.delay(350).duration(400)}
                        style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: `${colors.accent}99` }]}
                    >
                        <View style={[styles.sectionHeader, { backgroundColor: colors.sectionBg, borderBottomColor: colors.border }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.adminTitle') || 'ADMIN'}</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <SettingsRow
                                label={t('settings.moderationPanel') || 'Moderation Panel'}
                                description={t('settings.moderationPanelDesc') || 'Review reports, manage users'}
                                onPress={() => router.push('/admin' as any)}
                                colors={colors}
                            />
                        </View>
                    </Animated.View>
                )}

                {/* Community & Legal Section */}
                <Animated.View
                    entering={FadeInDown.delay(350).duration(400)}
                    style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: `${colors.accent}99`, marginBottom: Spacing.md }]}
                >
                    <View style={[styles.sectionHeader, { backgroundColor: colors.sectionBg, borderBottomColor: colors.border }]}>
                        <Ionicons name="book-outline" size={20} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.legal').toUpperCase() || 'LEGAL & COMMUNITY'}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <SettingsRow
                            label={t('settings.communityGuidelines') || 'Community Guidelines'}
                            description={t('settings.communityGuidelinesDesc') || 'Rules to keep our community safe'}
                            onPress={() => router.push('/community-guidelines' as any)}
                            colors={colors}
                        />
                    </View>
                </Animated.View>

                {/* Account Section */}
                <Animated.View
                    entering={FadeInDown.delay(400).duration(400)}
                    style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: `${colors.accent}99` }]}
                >
                    <View style={[styles.sectionHeader, { backgroundColor: colors.sectionBg, borderBottomColor: colors.border }]}>
                        <Ionicons name="person-outline" size={20} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.account').toUpperCase()}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <SettingsRow
                            label={t('settings.changePassword') || 'Şifre Değiştir'}
                            description={t('settings.changePasswordDesc') || 'Hesap şifrenizi güncelleyin'}
                            onPress={() => setChangePasswordModalVisible(true)}
                            colors={colors}
                            rightElement={<Ionicons name="key-outline" size={22} color={colors.accent} />}
                        />

                        <SettingsRow
                            label={t('settings.blockedUsers') || 'Blocked Users'}
                            description={t('settings.blockedUsersDesc') || 'Manage and unblock users you have blocked'}
                            onPress={() => router.push('/blocked-users' as any)}
                            colors={colors}
                            rightElement={<Ionicons name="ban-outline" size={22} color={colors.accent} />}
                        />

                        <SettingsRow
                            label={t('settings.exportDataTitle') || 'Download My Data'}
                            description={t('settings.exportDataSubdesc') || 'Request a copy of your personal data'}
                            onPress={handleDownloadData}
                            colors={colors}
                            rightElement={<Ionicons name="download-outline" size={22} color={colors.accent} />}
                        />

                        <SettingsRow
                            label={t('settings.deleteAccount')}
                            description={t('settings.deleteAccountWarning')}
                            onPress={handleDeleteAccount}
                            colors={{ ...colors, textPrimary: colors.stampRed }}
                            rightElement={<Ionicons name="trash-outline" size={22} color={colors.stampRed} />}
                        />
                    </View>
                </Animated.View>

                {/* Logout Section */}
                <Animated.View
                    entering={FadeInDown.delay(500).duration(400)}
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
                                {t('settings.exitLabel')}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Version Info */}
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                        V. {Constants.expoConfig?.version || '1.0.0'} • Build {Constants.expoConfig?.android?.versionCode || Constants.expoConfig?.ios?.buildNumber || '1'}
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

            {/* Change Password Modal */}
            <ChangePasswordModal
                visible={changePasswordModalVisible}
                onClose={() => setChangePasswordModalVisible(false)}
            />
            </View>
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



    // Section Card
    sectionCard: {
        width: '100%',
        alignSelf: 'stretch',
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        ...Shadows.md,
        elevation: 0,
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
        width: '100%',
    },

    // Setting Row
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        width: '100%',
    },
    settingInfo: {
        flex: 1,
        gap: 2,
        marginRight: Spacing.sm,
    },
    settingLabel: {
        fontSize: 18,
        fontFamily: Typography.fonts.bodyBold,
        flexShrink: 1,
    },
    settingSubLabel: {
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.5,
        flexShrink: 1,
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
        elevation: 0,
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
        elevation: 0,
    },
    flagEmoji: {
        fontSize: 20,
    },
    languageName: {
        fontSize: 18,
        fontFamily: Typography.fonts.bodyBold,
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
        elevation: 0,
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
    deleteAccountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        width: '100%',
    },
});
