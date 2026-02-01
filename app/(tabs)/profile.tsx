import { EditProfileModal } from '@/components/edit-profile-modal';
import { ThemedView } from '@/components/themed-view';
import { Colors, Shadows, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrentProfile, useProfileStats, useUserPosts } from '@/hooks/use-profile';
import { calculateBadges, type Badge } from '@/lib/badge-service';
import type { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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



export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const passportTheme = PassportColors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { t, language } = useLanguage();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useCurrentProfile();
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useProfileStats(user?.id || null);
    const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useUserPosts(user?.id || null);

    // Format distance for display (e.g., 15400 -> 15.4k)
    const formatDistance = (km: number): string => {
        if (km >= 1000) {
            return `${(km / 1000).toFixed(1)}k`;
        }
        return km.toString();
    };

    // Calculate badges based on user stats
    const badges = useMemo(() => calculateBadges(stats), [stats]);

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
            t('profile.logoutTitle'),
            t('profile.logoutMessage'),
            [
                { text: t('profile.cancel'), style: 'cancel' },
                {
                    text: t('profile.logout'),
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

    // Only show loading when actively loading, not when profile is null (error case)
    if (profileLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={passportTheme.gold} />
            </ThemedView>
        );
    }

    // Create fallback profile if null (handles error cases)
    const displayProfile = profile || {
        id: user?.id || '',
        full_name: user?.email?.split('@')[0] || t('profile.defaultUser'),
        username: user?.email?.split('@')[0] || 'user',
        avatar_url: null,
        bio: null,
        website: null,
        updated_at: new Date().toISOString(),
    };

    // Parse name into surname and given names
    const nameParts = (displayProfile.full_name || t('profile.defaultUser')).split(' ');
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : nameParts[0].toUpperCase();
    const givenNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ').toUpperCase() : '';

    // Rotation values for polaroid effect
    const rotations = [-2, 1, 2, -1, 1.5, -1.5];

    // Use only real posts with images, no static fallback
    const journalEntries = posts && posts.length > 0
        ? posts.slice(0, 6)
            .filter((post: Post) => post.images && post.images.length > 0 && post.images[0])
            .map((post: Post, index: number) => ({
                id: post.id,
                image: post.images![0] as string,
                caption: post.title || post.location?.city || post.location?.address || t('profile.journalNote'),
                aspectRatio: index % 2 === 0 ? 0.8 : 1,
                rotation: rotations[index % rotations.length],
            }))
        : [];

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
                            {t('profile.republicOf')}
                        </Text>
                        <Ionicons name="airplane" size={10} color={colorScheme === 'dark' ? `${passportTheme.gold}CC` : `${passportTheme.text}B3`} style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                    <Text style={[styles.headerTitle, { color: colorScheme === 'dark' ? passportTheme.gold : passportTheme.text }]}>
                        ODYSSEY JOURNAL
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.headerButton, { borderColor: colorScheme === 'dark' ? `${passportTheme.gold}33` : `${passportTheme.text}20` }]}
                    onPress={() => router.push('/settings')}
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
                                        {displayProfile.avatar_url ? (
                                            <Image
                                                source={{ uri: displayProfile.avatar_url }}
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
                                        <Text style={[styles.fieldLabel, { color: passportTheme.textMuted }]}>{t('profile.surnameTitle')}</Text>
                                        <Text style={[styles.fieldValue, { color: passportTheme.text }]}>{surname}</Text>
                                    </View>

                                    {/* Given Names */}
                                    <View style={styles.infoField}>
                                        <Text style={[styles.fieldLabel, { color: passportTheme.textMuted }]}>{t('profile.nameTitle')}</Text>
                                        <Text style={[styles.fieldValueSmall, { color: passportTheme.text }]}>
                                            {givenNames || surname}
                                        </Text>
                                    </View>

                                    {/* Nationality & ID Row */}
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoFieldSmall}>
                                            <Text style={[styles.fieldLabelSmall, { color: passportTheme.textMuted }]}>{t('profile.nationalityTitle')}</Text>
                                            <Text style={[styles.fieldValueMono, { color: passportTheme.text }]}>TUR</Text>
                                        </View>
                                        <View style={styles.infoFieldSmall}>
                                            <Text style={[styles.fieldLabelSmall, { color: passportTheme.textMuted }]}>ID</Text>
                                            <Text style={[styles.fieldValueMono, { color: passportTheme.gold }]}>@{displayProfile.username || 'user'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Bio Section */}
                            {displayProfile.bio && (
                                <View style={[styles.bioContainer, { backgroundColor: passportTheme.paperDark }]}>
                                    <Ionicons name="airplane" size={48} color={passportTheme.textSecondary} style={styles.bioIcon1} />
                                    <Ionicons name="globe-outline" size={48} color={passportTheme.textSecondary} style={styles.bioIcon2} />
                                    <Text style={[styles.bioText, { color: colorScheme === 'dark' ? '#d4c5b0' : passportTheme.passportLeather }]}>
                                        "{displayProfile.bio}"
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
                            <Text style={[styles.statNumber, { color: passportTheme.text }]}>{stats?.countriesVisited || 0}</Text>
                            <Text style={[styles.statLabel, { color: passportTheme.textSecondary }]}>{t('profile.countries')}</Text>
                        </View>

                        {/* Distance */}
                        <View style={[styles.statCard, { backgroundColor: passportTheme.parchment, borderColor: colorScheme === 'dark' ? passportTheme.border : '#e6e0d4' }]}>
                            <Ionicons name="airplane" size={28} color={passportTheme.goldDim} style={[styles.statIconBg, { transform: [{ rotate: '30deg' }] }]} />
                            <Ionicons name="airplane" size={28} color={colorScheme === 'dark' ? passportTheme.gold : passportTheme.goldDim} style={[styles.statIcon, { transform: [{ rotate: '30deg' }] }]} />
                            <Text style={[styles.statNumber, { color: passportTheme.text }]}>{formatDistance(stats?.totalDistanceKm || 0)}</Text>
                            <Text style={[styles.statLabel, { color: passportTheme.textSecondary }]}>{t('profile.kilometers')}</Text>
                        </View>

                        {/* Days */}
                        <View style={[styles.statCard, { backgroundColor: passportTheme.parchment, borderColor: colorScheme === 'dark' ? passportTheme.border : '#e6e0d4' }]}>
                            <Ionicons name="calendar-outline" size={28} color={passportTheme.goldDim} style={styles.statIconBg} />
                            <Ionicons name="calendar-outline" size={28} color={colorScheme === 'dark' ? passportTheme.gold : passportTheme.goldDim} style={[styles.statIcon, { transform: [{ rotate: '2deg' }] }]} />
                            <Text style={[styles.statNumber, { color: passportTheme.text }]}>{stats?.travelDays || 0}</Text>
                            <Text style={[styles.statLabel, { color: passportTheme.textSecondary }]}>{t('profile.days')}</Text>
                        </View>
                    </View>
                </View>

                {/* Travel Map Section */}
                <View style={styles.mapSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: passportTheme.text }]}>{t('profile.travelMap')}</Text>
                        <Ionicons name="map-outline" size={16} color={`${passportTheme.gold}E6`} />
                    </View>
                    <View style={[styles.mapContainer, { borderColor: passportTheme.border }]}>
                        {stats?.visitedLocations && stats.visitedLocations.length > 0 ? (
                            <>
                                <Image
                                    source={{
                                        uri: (() => {
                                            // Create Mapbox Static API URL with markers
                                            const locations = stats.visitedLocations.slice(0, 10); // Limit to 10 markers
                                            const markers = locations
                                                .map(loc => `pin-s+D4A574(${loc.longitude},${loc.latitude})`)
                                                .join(',');
                                            // Calculate center point
                                            const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
                                            const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
                                            return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${markers}/${avgLng},${avgLat},2,0/400x200?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
                                        })()
                                    }}
                                    style={styles.mapImage}
                                    contentFit="cover"
                                />
                                {/* Sepia overlay for vintage effect */}
                                <View style={[styles.mapOverlay, { backgroundColor: 'rgba(139, 115, 85, 0.1)' }]} />
                            </>
                        ) : (
                            <View style={[styles.mapPlaceholder, { backgroundColor: passportTheme.paperDark }]}>
                                <Ionicons name="globe-outline" size={48} color={passportTheme.textMuted} />
                                <Text style={[styles.mapPlaceholderText, { color: passportTheme.textMuted }]}>
                                    {t('profile.noTravelLocation')}
                                </Text>
                                <Text style={[styles.mapPlaceholderSubtext, { color: passportTheme.textSecondary }]}>
                                    {t('profile.shareLocationPosts')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Badges Section */}
                <View style={styles.badgesSection}>
                    <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
                        <Text style={[styles.sectionTitle, { color: passportTheme.text }]}>{t('profile.badges')}</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.badgesScroll}
                    >
                        {badges.map((badge: Badge) => (
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
                                    {badge.count !== undefined && badge.count > 0 && (
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
                        <Text style={[styles.sectionTitle, { color: passportTheme.text }]}>{t('profile.journalNotes')}</Text>
                        <Ionicons name="grid-outline" size={16} color={colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
                    </View>

                    {/* Masonry Grid or Empty State */}
                    {journalEntries.length > 0 ? (
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
                    ) : (
                        <View style={[styles.emptyJournalState, { backgroundColor: passportTheme.paperDark }]}>
                            <Ionicons name="book-outline" size={48} color={passportTheme.textMuted} />
                            <Text style={[styles.emptyJournalTitle, { color: passportTheme.text }]}>
                                {t('profile.noJournalNotes')}
                            </Text>
                            <Text style={[styles.emptyJournalSubtitle, { color: passportTheme.textSecondary }]}>
                                {t('profile.shareMemories')}
                            </Text>
                            <TouchableOpacity
                                style={[styles.createPostButton, { backgroundColor: passportTheme.gold }]}
                                onPress={() => router.push('/create-post')}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="white" />
                                <Text style={styles.createPostButtonText}>{t('profile.addFirstNote')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={editModalVisible}
                profile={displayProfile}
                onClose={() => setEditModalVisible(false)}
                onSuccess={handleEditSuccess}
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
    mapPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    mapPlaceholderText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    mapPlaceholderSubtext: {
        fontSize: 11,
        fontWeight: '500',
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
        top: 0,
        right: 0,
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
    emptyJournalState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    emptyJournalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptyJournalSubtitle: {
        fontSize: 13,
        textAlign: 'center',
    },
    createPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 16,
        gap: 8,
    },
    createPostButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
});
