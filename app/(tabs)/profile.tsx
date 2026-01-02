import { EditProfileModal } from '@/components/edit-profile-modal';
import { LanguageSelectorModal } from '@/components/language-selector-modal';
import { ThemedView } from '@/components/themed-view';
import { Colors, Shadows, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrentProfile, useProfileStats, useUserPosts } from '@/hooks/use-profile';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Passport Theme Colors
const PassportColors = {
    light: {
        background: '#f8f7f6',
        paper: '#fdfbf7',
        paperDark: '#e8e4dc',
        gold: '#d47311',
        goldDim: '#8c5e2a',
        text: '#2c241b',
        textMuted: '#8c7b6d',
        textSecondary: '#5c4d3c',
        border: '#d4c5b0',
        parchment: '#F5F1E8',
        passportLeather: '#4a3b2a',
    },
    dark: {
        background: '#2C1810',
        paper: '#2a241e',
        paperDark: '#383028',
        gold: '#d47311',
        goldDim: '#8c5e2a',
        text: '#F5F1E8',
        textMuted: '#b9ab9d',
        textSecondary: '#8c7b6d',
        border: '#3d3228',
        parchment: '#F5F1E8',
        passportLeather: '#4a3b2a',
    }
};

// Static badge data
const BADGES = [
    { id: 'adventure', icon: 'walk-outline', name: 'İlk Macera', unlocked: true, count: null },
    { id: 'world', icon: 'globe-outline', name: 'Dünya Gezgini', unlocked: true, count: 10, featured: true },
    { id: 'camera', icon: 'camera-outline', name: 'Fotoğraf Ustası', unlocked: true, count: null },
    { id: 'food', icon: 'restaurant-outline', name: 'Gurme', unlocked: false, count: null },
];

// Static journal entries for masonry grid
const STATIC_JOURNAL_ENTRIES = [
    {
        id: '1',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPvQid-qG8dt0kKXecq6aqnmKYuyQL6UaDXpPvTb6WSciDSPE92OoyfwITqZ9yUd-8HIROrz9Az0gkbPLKILs34EjUMrz2UmRQSF1YezODjnFEZYCiPLE_Ixd3cA4eWgph9FHfEt5_4vk1QatZuJAyT4Iv_g3XZmo3SpSWGzGs8s5wtDhQYIr6x0dT7AawvxmWlFhfAKqy_VzsBqc1yc-h3PhS2Z916zAl0A-NqrYALJYQCneTl5_MIX67MvA0sDIhCSE0eV7gD1g',
        caption: 'Alpler, 2023',
        aspectRatio: 0.75,
        rotation: -2,
    },
    {
        id: '2',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFl6B_CfMdC7lVjFVgQwJEwajO4KysaH7YIHpyhRx_jUfkQadtQwVL9XgAx1xjn3oOS_wrOWBZCGq2rusMeE8CjKtEvhCDlxpgXM1Gq_p8cB0EEYVUwtnGUUFxRx0vHl6qCatD_gYJoAyqft6sYUyQawf6m7FMAlyGIQ7vw0mrUkOYyEAoqeU6nVjiWkU8-MNWds9737E2VDD17DUpToAZOPNyB_NnKYzaDMADqJOVAc6RzqzG98A_qGaBoGmkezcRRJY5xarkDp0',
        caption: 'Rotamız',
        aspectRatio: 1,
        rotation: 1,
    },
    {
        id: '3',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2658R0-yTwa-netR90H-4rv-EbFivpcle_PJFY8zK60G7WMvoGAWVStFVeEEPilRgKGDb2QCK2GjkuTuAVFEaO0W9eRrsX87oC3MBZp3j4fGdkZwbIYEIO9DpJC0t6mRPGfitSLRdSEdRznX1G3dKurp6NJSE_XPNKzf20vneSW5urHhgSe9iuaa76wQUtCR9K7fCK9mI7FWXknlKOALGKKTH1x75nSeFbCQ1Ge_i2Za-SSqsJ57tlimw21tbXYQYW-wPnviywzU',
        caption: 'Cinque Terre',
        aspectRatio: 0.8,
        rotation: 2,
    },
    {
        id: '4',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2DpTYVbgaTsz9G-iTVzx_Gu4gcj2GYrR5dPKzZj8FvLrWgVWcSCC9kvojh5KtN_PYJnCs1FfTRF1S-cxw7defxMPN5OFixR1bR5Gi2BAsea6LJCNDze1tVPlKn72tB4ZB_97cpTh7T3bpsVm0H8YYvGOkNdYpYyUL-pDJeKWaVZ85nqFSBtdmHUsvietVyHOah2mUUquBJW50QeiizX_QFhJxQa0uYo1v41LTZH3LG0PfMTR1Lh4XsGCSq8enn9PjkMIYy3Ysdn0',
        caption: 'Sabah Kahvesi',
        aspectRatio: 1,
        rotation: -1,
    },
];

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const passportTheme = PassportColors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { language, t } = useLanguage();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useCurrentProfile();
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useProfileStats(user?.id || null);
    const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useUserPosts(user?.id || null);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            refetchProfile(),
            refetchStats(),
            refetchPosts(),
        ]);
        setRefreshing(false);
    };

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
        await Promise.all([
            refetchProfile(),
            refetchStats(),
        ]);
    };

    const handlePostPress = (postId: string) => {
        router.push(`/post-detail/${postId}`);
    };

    if (profileLoading || !profile) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={passportTheme.gold} />
            </ThemedView>
        );
    }

    // Parse name into surname and given names
    const nameParts = (profile.full_name || 'Gezgin').split(' ');
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : nameParts[0].toUpperCase();
    const givenNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ').toUpperCase() : '';

    // Use API posts or static entries
    const journalEntries = posts && posts.length > 0
        ? posts.slice(0, 4).map((post: Post, index: number) => ({
            id: post.id,
            image: post.images?.[0] || STATIC_JOURNAL_ENTRIES[index % 4].image,
            caption: post.title || post.location?.city || post.location?.address || STATIC_JOURNAL_ENTRIES[index % 4].caption,
            aspectRatio: STATIC_JOURNAL_ENTRIES[index % 4].aspectRatio,
            rotation: STATIC_JOURNAL_ENTRIES[index % 4].rotation,
        }))
        : STATIC_JOURNAL_ENTRIES;

    return (
        <ThemedView style={[styles.container, { backgroundColor: passportTheme.background }]}>
            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 12,
                backgroundColor: passportTheme.parchment,
                borderBottomColor: `${passportTheme.gold}66`,
            }]}>
                <TouchableOpacity
                    style={[styles.headerButton, { borderColor: colorScheme === 'dark' ? `${passportTheme.gold}33` : `${passportTheme.text}20` }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={20} color={colorScheme === 'dark' ? passportTheme.gold : passportTheme.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.headerBranding}>
                        <Ionicons name="airplane" size={10} color={colorScheme === 'dark' ? `${passportTheme.gold}CC` : `${passportTheme.text}B3`} />
                        <Text style={[styles.headerSubtitle, { color: colorScheme === 'dark' ? `${passportTheme.gold}CC` : `${passportTheme.text}B3` }]}>
                            Republic of
                        </Text>
                        <Ionicons name="airplane" size={10} color={colorScheme === 'dark' ? `${passportTheme.gold}CC` : `${passportTheme.text}B3`} style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                    <Text style={[styles.headerTitle, { color: colorScheme === 'dark' ? passportTheme.gold : passportTheme.text }]}>
                        ODYSSEY JOURNAL
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.headerButton, { borderColor: colorScheme === 'dark' ? `${passportTheme.gold}33` : `${passportTheme.text}20` }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="settings-outline" size={20} color={colorScheme === 'dark' ? passportTheme.gold : passportTheme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={passportTheme.gold}
                    />
                }
            >
                {/* Passport Card */}
                <View style={styles.passportSection}>
                    <View style={[styles.passportCard, {
                        backgroundColor: passportTheme.paper,
                        borderColor: `${passportTheme.gold}33`,
                    }]}>
                        {/* Passport Content */}
                        <View style={styles.passportContent}>
                            {/* Photo and Info Row */}
                            <View style={styles.passportRow}>
                                {/* Photo */}
                                <View style={styles.photoContainer}>
                                    <View style={[styles.photoFrame, { borderColor: colorScheme === 'dark' ? `${passportTheme.gold}99` : passportTheme.passportLeather }]}>
                                        {profile.avatar_url ? (
                                            <Image
                                                source={{ uri: profile.avatar_url }}
                                                style={styles.photoImage}
                                                contentFit="cover"
                                            />
                                        ) : (
                                            <View style={[styles.photoPlaceholder, { backgroundColor: passportTheme.paperDark }]}>
                                                <Ionicons name="person" size={50} color={passportTheme.textMuted} />
                                            </View>
                                        )}
                                    </View>
                                    {/* Verified Stamp */}
                                    <View style={styles.verifiedStamp}>
                                        <Ionicons name="checkmark-circle" size={40} color={`${passportTheme.gold}CC`} />
                                    </View>
                                </View>

                                {/* Info Section */}
                                <View style={styles.infoSection}>
                                    {/* Surname */}
                                    <View style={[styles.infoField, { borderBottomColor: `${passportTheme.gold}33` }]}>
                                        <Text style={[styles.fieldLabel, { color: passportTheme.textMuted }]}>Soyad / Surname</Text>
                                        <Text style={[styles.fieldValue, { color: passportTheme.text }]}>{surname}</Text>
                                    </View>

                                    {/* Given Names */}
                                    <View style={styles.infoField}>
                                        <Text style={[styles.fieldLabel, { color: passportTheme.textMuted }]}>Ad / Given Names</Text>
                                        <Text style={[styles.fieldValueSmall, { color: passportTheme.text }]}>
                                            {givenNames || surname}
                                        </Text>
                                    </View>

                                    {/* Nationality & ID Row */}
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoFieldSmall}>
                                            <Text style={[styles.fieldLabelSmall, { color: passportTheme.textMuted }]}>Uyruk / Nationality</Text>
                                            <Text style={[styles.fieldValueMono, { color: passportTheme.text }]}>TUR</Text>
                                        </View>
                                        <View style={styles.infoFieldSmall}>
                                            <Text style={[styles.fieldLabelSmall, { color: passportTheme.textMuted }]}>ID</Text>
                                            <Text style={[styles.fieldValueMono, { color: passportTheme.gold }]}>@{profile.username || 'user'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Bio Section */}
                            {profile.bio && (
                                <View style={[styles.bioContainer, { backgroundColor: passportTheme.paperDark }]}>
                                    <Ionicons name="airplane" size={48} color={passportTheme.textSecondary} style={styles.bioIcon1} />
                                    <Ionicons name="globe-outline" size={48} color={passportTheme.textSecondary} style={styles.bioIcon2} />
                                    <Text style={[styles.bioText, { color: colorScheme === 'dark' ? '#d4c5b0' : passportTheme.passportLeather }]}>
                                        "{profile.bio}"
                                    </Text>
                                </View>
                            )}

                            {/* Edit Profile Button */}
                            <TouchableOpacity
                                style={[styles.editButton, { backgroundColor: passportTheme.text, borderColor: `${passportTheme.gold}33` }]}
                                onPress={() => setEditModalVisible(true)}
                            >
                                <Ionicons name="create-outline" size={18} color={passportTheme.gold} />
                                <Text style={[styles.editButtonText, { color: passportTheme.gold }]}>{t('profile.editProfile')}</Text>
                            </TouchableOpacity>

                            {/* Language Selector Button */}
                            <TouchableOpacity
                                style={[styles.languageButton, { backgroundColor: theme.surface, borderColor: `${passportTheme.gold}33` }]}
                                onPress={() => setLanguageModalVisible(true)}
                            >
                                <Text style={styles.languageFlag}>{SUPPORTED_LANGUAGES[language].flag}</Text>
                                <Text style={[styles.languageButtonText, { color: passportTheme.text }]}>
                                    {SUPPORTED_LANGUAGES[language].nativeName}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={passportTheme.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        {/* Countries */}
                        <View style={[styles.statCard, { backgroundColor: passportTheme.parchment, borderColor: colorScheme === 'dark' ? passportTheme.border : '#e6e0d4' }]}>
                            <Ionicons name="globe-outline" size={28} color={passportTheme.goldDim} style={styles.statIconBg} />
                            <Ionicons name="globe-outline" size={28} color={colorScheme === 'dark' ? passportTheme.gold : passportTheme.goldDim} style={styles.statIcon} />
                            <Text style={[styles.statNumber, { color: passportTheme.text }]}>{stats?.countriesVisited || 12}</Text>
                            <Text style={[styles.statLabel, { color: passportTheme.textSecondary }]}>Ülkeler</Text>
                        </View>

                        {/* Distance */}
                        <View style={[styles.statCard, { backgroundColor: passportTheme.parchment, borderColor: colorScheme === 'dark' ? passportTheme.border : '#e6e0d4' }]}>
                            <Ionicons name="airplane" size={28} color={passportTheme.goldDim} style={[styles.statIconBg, { transform: [{ rotate: '30deg' }] }]} />
                            <Ionicons name="airplane" size={28} color={colorScheme === 'dark' ? passportTheme.gold : passportTheme.goldDim} style={[styles.statIcon, { transform: [{ rotate: '30deg' }] }]} />
                            <Text style={[styles.statNumber, { color: passportTheme.text }]}>15.4k</Text>
                            <Text style={[styles.statLabel, { color: passportTheme.textSecondary }]}>Km</Text>
                        </View>

                        {/* Days */}
                        <View style={[styles.statCard, { backgroundColor: passportTheme.parchment, borderColor: colorScheme === 'dark' ? passportTheme.border : '#e6e0d4' }]}>
                            <Ionicons name="calendar-outline" size={28} color={passportTheme.goldDim} style={styles.statIconBg} />
                            <Ionicons name="calendar-outline" size={28} color={colorScheme === 'dark' ? passportTheme.gold : passportTheme.goldDim} style={[styles.statIcon, { transform: [{ rotate: '2deg' }] }]} />
                            <Text style={[styles.statNumber, { color: passportTheme.text }]}>45</Text>
                            <Text style={[styles.statLabel, { color: passportTheme.textSecondary }]}>Gün</Text>
                        </View>
                    </View>
                </View>

                {/* Travel Map Section */}
                <View style={styles.mapSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: passportTheme.text }]}>Seyahat Haritası</Text>
                        <Ionicons name="map-outline" size={16} color={`${passportTheme.gold}E6`} />
                    </View>
                    <View style={[styles.mapContainer, { borderColor: passportTheme.border }]}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnQZPpAXGKcQfXWnl8_LRXafmvBnDyX37eSi11Gb4UPacUHaRq5XKK6-CvYEP0sSDBkG-VvRJMJvFQjixToeJt4tXn_7-4aK_RAc3sbcdv27gSqw3liqVxqUt47iCRhCh5ZLZMZz25i9d8XlloALaaXkQrveE-TN3XyPS0bdbZreYL9hIMwCY9hwbnnOs86_0BJ_lsrYPbnmZ6yqZfTHrsZTkTjvtnlp4HMH_cOqTatORc2WD3M9kg3fhlVr9rPOnwpMm44pzugBg' }}
                            style={styles.mapImage}
                            contentFit="cover"
                        />
                        {/* Map Markers */}
                        <View style={[styles.mapMarker, { top: '35%', left: '52%' }]}>
                            <Ionicons name="ellipse" size={16} color="#8b0000" />
                        </View>
                        <View style={[styles.mapMarker, { top: '42%', left: '48%' }]}>
                            <Ionicons name="ellipse" size={12} color="#8b000099" />
                        </View>
                        <View style={[styles.mapMarker, { top: '38%', left: '54%' }]}>
                            <Ionicons name="location" size={28} color="#a62c2b" />
                        </View>
                        <View style={styles.mapOverlay} />
                    </View>
                </View>

                {/* Badges Section */}
                <View style={styles.badgesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: passportTheme.text }]}>Rozetler</Text>
                        <TouchableOpacity>
                            <Text style={[styles.seeAllText, { color: `${passportTheme.gold}E6` }]}>Tümü</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.badgesScroll}
                    >
                        {BADGES.map((badge) => (
                            <View key={badge.id} style={styles.badgeItem}>
                                <View style={[
                                    styles.badgeCircle,
                                    badge.unlocked
                                        ? badge.featured
                                            ? styles.badgeFeatured
                                            : [styles.badgeUnlocked, { borderColor: `${passportTheme.gold}66` }]
                                        : [styles.badgeLocked, { borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }],
                                    { backgroundColor: badge.featured ? undefined : passportTheme.text }
                                ]}>
                                    {badge.unlocked && !badge.featured && (
                                        <View style={[styles.badgeInnerBorder, { borderColor: `${passportTheme.gold}4D` }]} />
                                    )}
                                    <Ionicons
                                        name={badge.icon as any}
                                        size={28}
                                        color={badge.unlocked ? (badge.featured ? 'white' : passportTheme.gold) : (colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)')}
                                    />
                                    {badge.count && (
                                        <View style={styles.badgeCount}>
                                            <Text style={styles.badgeCountText}>{badge.count}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[
                                    styles.badgeName,
                                    { color: badge.featured ? passportTheme.gold : (badge.unlocked ? passportTheme.textMuted : `${passportTheme.textMuted}66`) }
                                ]}>
                                    {badge.name}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Journal Notes Section */}
                <View style={styles.journalSection}>
                    <View style={[styles.sectionHeader, { borderBottomWidth: 1, borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)', paddingBottom: 8 }]}>
                        <Text style={[styles.sectionTitle, { color: passportTheme.text }]}>Günlük Notları</Text>
                        <Ionicons name="grid-outline" size={16} color={colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
                    </View>

                    {/* Masonry Grid */}
                    <View style={styles.masonryContainer}>
                        <View style={styles.masonryColumn}>
                            {journalEntries.filter((_, i) => i % 2 === 0).map((entry, index) => (
                                <TouchableOpacity
                                    key={entry.id}
                                    style={[
                                        styles.polaroidCard,
                                        { transform: [{ rotate: `${entry.rotation}deg` }] },
                                        index > 0 && { marginTop: 16 }
                                    ]}
                                    onPress={() => handlePostPress(entry.id)}
                                >
                                    <Image
                                        source={{ uri: entry.image }}
                                        style={[styles.polaroidImage, { aspectRatio: entry.aspectRatio }]}
                                        contentFit="cover"
                                    />
                                    <Text style={styles.polaroidCaption}>{entry.caption}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={[styles.masonryColumn, { marginTop: 24 }]}>
                            {journalEntries.filter((_, i) => i % 2 === 1).map((entry, index) => (
                                <TouchableOpacity
                                    key={entry.id}
                                    style={[
                                        styles.polaroidCard,
                                        { transform: [{ rotate: `${entry.rotation}deg` }] },
                                        index > 0 && { marginTop: 16 }
                                    ]}
                                    onPress={() => handlePostPress(entry.id)}
                                >
                                    <Image
                                        source={{ uri: entry.image }}
                                        style={[styles.polaroidImage, { aspectRatio: entry.aspectRatio }]}
                                        contentFit="cover"
                                    />
                                    <Text style={styles.polaroidCaption}>{entry.caption}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            {profile && (
                <EditProfileModal
                    visible={editModalVisible}
                    profile={profile}
                    onClose={() => setEditModalVisible(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Language Selector Modal */}
            <LanguageSelectorModal
                visible={languageModalVisible}
                onClose={() => setLanguageModalVisible(false)}
            />
        </ThemedView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 3,
        ...Shadows.lg,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerBranding: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
        opacity: 0.8,
    },
    headerSubtitle: {
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        fontFamily: Typography.fonts.heading,
    },

    scrollView: {
        flex: 1,
    },

    // Passport Card
    passportSection: {
        padding: 16,
    },
    passportCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        ...Shadows.lg,
    },
    passportContent: {
        padding: 20,
        gap: 20,
    },
    passportRow: {
        flexDirection: 'row',
        gap: 20,
    },
    photoContainer: {
        position: 'relative',
    },
    photoFrame: {
        width: 120,
        height: 120,
        borderWidth: 4,
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedStamp: {
        position: 'absolute',
        bottom: -12,
        right: -12,
        transform: [{ rotate: '-15deg' }],
        opacity: 0.9,
    },
    infoSection: {
        flex: 1,
        paddingTop: 4,
    },
    infoField: {
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
    },
    fieldLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 1,
        fontFamily: Typography.fonts.heading,
    },
    fieldValueSmall: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
        fontFamily: Typography.fonts.heading,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    infoFieldSmall: {
        flex: 1,
    },
    fieldLabelSmall: {
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    fieldValueMono: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },

    // Bio
    bioContainer: {
        padding: 16,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    bioIcon1: {
        position: 'absolute',
        top: 4,
        right: 8,
        opacity: 0.1,
        transform: [{ rotate: '12deg' }],
    },
    bioIcon2: {
        position: 'absolute',
        bottom: -8,
        left: -8,
        opacity: 0.1,
        transform: [{ rotate: '-12deg' }],
    },
    bioText: {
        fontSize: 20,
        fontFamily: Typography.fonts.handwriting,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 28,
    },

    // Edit Button
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        ...Shadows.md,
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    // Language Button
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        marginTop: 12,
    },
    languageFlag: {
        fontSize: 20,
    },
    languageButtonText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },

    // Stats
    statsSection: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden',
        ...Shadows.sm,
    },
    statIconBg: {
        position: 'absolute',
        top: 4,
        right: 4,
        opacity: 0.1,
    },
    statIcon: {
        marginBottom: 4,
        opacity: 0.85,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Typography.fonts.heading,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },

    // Map
    mapSection: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Typography.fonts.heading,
        letterSpacing: 0.5,
    },
    seeAllText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    mapContainer: {
        aspectRatio: 2,
        borderRadius: 12,
        borderWidth: 3,
        overflow: 'hidden',
        position: 'relative',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    mapMarker: {
        position: 'absolute',
        opacity: 0.8,
    },
    mapOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 8,
        borderColor: 'rgba(255,255,255,0.05)',
    },

    // Badges
    badgesSection: {
        paddingVertical: 8,
    },
    badgesScroll: {
        paddingHorizontal: 20,
        gap: 20,
    },
    badgeItem: {
        alignItems: 'center',
        gap: 8,
        minWidth: 70,
    },
    badgeCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badgeUnlocked: {
        ...Shadows.md,
    },
    badgeFeatured: {
        borderColor: '#d47311',
        backgroundColor: '#d47311',
        ...Shadows.lg,
    },
    badgeLocked: {
        opacity: 0.4,
    },
    badgeInnerBorder: {
        position: 'absolute',
        top: 4,
        left: 4,
        right: 4,
        bottom: 4,
        borderRadius: 26,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    badgeCount: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#2C1810',
    },
    badgeCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#2C1810',
    },
    badgeName: {
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
        maxWidth: 70,
    },

    // Journal
    journalSection: {
        padding: 16,
    },
    masonryContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    masonryColumn: {
        flex: 1,
    },
    polaroidCard: {
        backgroundColor: '#fbfbfb',
        padding: 8,
        paddingBottom: 32,
        borderRadius: 2,
        ...Shadows.lg,
    },
    polaroidImage: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    polaroidCaption: {
        position: 'absolute',
        bottom: 4,
        left: 0,
        right: 0,
        fontSize: 18,
        fontFamily: Typography.fonts.handwriting,
        fontWeight: '700',
        color: '#2c241b',
        textAlign: 'center',
    },
});
