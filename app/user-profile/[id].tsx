import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFollowUser } from '@/hooks/use-follow';
import { useProfile, useUserPosts } from '@/hooks/use-profile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Google Stitch Passport Design Colors
const DesignColors = {
    light: {
        background: '#F5F1E8',
        surface: '#FFFFFF',
        primary: '#d4aa73',
        textMain: '#2C1810',
        textMuted: '#8B7355',
        border: 'rgba(212, 170, 115, 0.2)',
        surfaceDark: '#3E2723',
    },
    dark: {
        background: '#2C1810',
        surface: '#3E2723',
        primary: '#d4aa73',
        textMain: '#F5F1E8',
        textMuted: '#d4aa73',
        border: 'rgba(245, 241, 232, 0.1)',
        surfaceDark: '#3E2723',
    },
};

export default function UserProfileScreen() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;

    const { id } = useLocalSearchParams<{ id: string }>();
    const { user: currentUser } = useAuth();

    const { data: profileData, isLoading: profileLoading } = useProfile(id);
    const { data: posts, isLoading: postsLoading } = useUserPosts(id);
    const followMutation = useFollowUser();

    const isCurrentUser = currentUser?.id === id;

    const handleFollowPress = async () => {
        if (!profileData || !id) return;

        try {
            await followMutation.mutateAsync({
                targetUserId: id,
                action: profileData.isFollowing ? 'unfollow' : 'follow',
            });
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleFollowersPress = () => {
        if (id) {
            router.push(`/followers/${id}`);
        }
    };

    const handleFollowingPress = () => {
        if (id) {
            router.push(`/following/${id}`);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handlePostPress = (postId: string) => {
        router.push(`/post-detail/${postId}`);
    };

    const handleMessage = () => {
        // TODO: Implement messaging
        console.log('Message pressed');
    };

    // Format large numbers
    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    if (profileLoading || !profileData) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    // Get post rotation for masonry layout
    const getRotation = (index: number): string => {
        const rotations = ['-1deg', '2deg', '-1deg', '1deg'];
        return rotations[index % rotations.length];
    };

    // Get aspect ratio for masonry layout
    const getAspectRatio = (index: number): number => {
        const ratios = [0.75, 1, 0.75, 0.6];
        return ratios[index % ratios.length];
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Navigation */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + Spacing.xs,
                    backgroundColor: isDark ? 'rgba(44, 24, 16, 0.95)' : 'rgba(245, 241, 232, 0.95)',
                    borderBottomColor: `${theme.primary}20`,
                }
            ]}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.headerButton}
                >
                    <Ionicons name="arrow-back" size={28} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerLabel, { color: `${theme.primary}CC` }]}>
                    {t('profile.passport')}
                </Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            >
                {/* Profile Photo Section */}
                <View style={styles.photoSection}>
                    <View style={styles.photoFrame}>
                        {/* Corner decorations */}
                        <View style={[styles.cornerTL, { borderColor: `${theme.primary}99` }]} />
                        <View style={[styles.cornerTR, { borderColor: `${theme.primary}99` }]} />
                        <View style={[styles.cornerBL, { borderColor: `${theme.primary}99` }]} />
                        <View style={[styles.cornerBR, { borderColor: `${theme.primary}99` }]} />

                        {/* Photo container */}
                        <View style={[styles.photoContainer, { backgroundColor: theme.surface }]}>
                            {profileData.avatar_url ? (
                                <Image
                                    source={{ uri: profileData.avatar_url }}
                                    style={styles.profilePhoto}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={[styles.photoPlaceholder, { backgroundColor: theme.surface }]}>
                                    <Ionicons name="person" size={48} color={theme.textMuted} />
                                </View>
                            )}
                        </View>

                        {/* Approved Traveler Stamp */}
                        <View style={styles.approvedStamp}>
                            <Text style={[styles.approvedText, { color: `${theme.primary}99` }]}>
                                {t('profile.approvedTraveler')}{'\n'}2024
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Name and Username */}
                <View style={styles.nameSection}>
                    <Text style={[styles.fullName, { color: theme.primary }]}>
                        {profileData.full_name || t('profile.defaultUser')}
                    </Text>
                    <View style={styles.usernameRow}>
                        <Text style={[styles.username, { color: theme.textMain, opacity: 0.7 }]}>
                            @{profileData.username || t('profile.defaultUser').toLowerCase()}
                        </Text>
                        {profileData.stats && profileData.stats.countriesVisited > 5 && (
                            <Ionicons name="checkmark-circle" size={16} color="#60A5FA" />
                        )}
                    </View>

                    {/* Stats Row */}
                    <View style={[styles.statsRow, { borderBottomColor: `${theme.primary}30` }]}>
                        <TouchableOpacity style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: theme.textMain }]}>
                                {profileData.stats?.countriesVisited || 0}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('profile.countries')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: theme.textMain }]}>
                                {profileData.stats?.postsCount || 0}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('profile.posts')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statItem} onPress={handleFollowersPress}>
                            <Text style={[styles.statNumber, { color: theme.textMain }]}>
                                {formatNumber(profileData.stats?.followersCount || 0)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t('profile.followers')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bio Section */}
                {profileData.bio && (
                    <View style={styles.bioSection}>
                        <Text style={[styles.bioText, { color: theme.textMain }]}>
                            "{profileData.bio}"
                        </Text>
                        {profileData.website && (
                            <Text style={[styles.bioMeta, { color: theme.textMuted }]}>
                                🌍 | {profileData.website}
                            </Text>
                        )}
                    </View>
                )}

                {/* Action Buttons */}
                {!isCurrentUser && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                { backgroundColor: isDark ? '#3E2723' : '#2C1810' }
                            ]}
                            onPress={handleFollowPress}
                            disabled={followMutation.isPending}
                        >
                            <View style={[styles.followButtonInner, { borderColor: theme.primary }]}>
                                {followMutation.isPending ? (
                                    <ActivityIndicator size="small" color={theme.primary} />
                                ) : (
                                    <>
                                        <Ionicons
                                            name={profileData.isFollowing ? "checkmark" : "add"}
                                            size={20}
                                            color={theme.primary}
                                        />
                                        <Text style={[styles.followButtonText, { color: theme.primary }]}>
                                            {profileData.isFollowing ? t('profile.following') : t('follow.follow')}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.messageButton,
                                { borderColor: isDark ? theme.primary : '#2C1810' }
                            ]}
                            onPress={handleMessage}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={isDark ? theme.primary : '#2C1810'}
                            />
                            <Text style={[
                                styles.messageButtonText,
                                { color: isDark ? theme.primary : '#2C1810' }
                            ]}>
                                {t('profile.message')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Common Destinations Section */}
                {!isCurrentUser && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                                {t('profile.commonDestinations')}
                            </Text>
                            <Text style={[styles.sectionSubtitle, { color: theme.primary }]}>
                                4 {t('profile.commonPlaces')}
                            </Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.destinationsContainer}
                        >
                            {/* Destination Cards - Sample data */}
                            {['Paris', 'Roma', 'Kyoto'].map((city, index) => (
                                <View
                                    key={city}
                                    style={[
                                        styles.destinationCard,
                                        { backgroundColor: isDark ? '#3E2723' : theme.surface }
                                    ]}
                                >
                                    <View style={[styles.destinationPin, { borderColor: `${theme.primary}80` }]} />
                                    <Ionicons
                                        name={index === 0 ? 'location' : index === 1 ? 'business' : 'leaf'}
                                        size={24}
                                        color={theme.primary}
                                    />
                                    <Text style={[styles.destinationName, { color: isDark ? theme.primary : '#2C1810' }]}>
                                        {city}
                                    </Text>
                                    <Text style={[styles.destinationCountry, { color: theme.textMuted }]}>
                                        {index === 0 ? t('countries.france') : index === 1 ? t('countries.italy') : t('countries.japan')}
                                    </Text>
                                </View>
                            ))}

                            {/* Open Map Button */}
                            <TouchableOpacity
                                style={[styles.openMapButton, { borderColor: `${theme.primary}50` }]}
                            >
                                <Ionicons name="map" size={24} color={theme.primary} />
                                <Text style={[styles.openMapText, { color: theme.primary }]}>
                                    {t('profile.openMap').replace(' ', '\n')}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* Travel Journal Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                            {t('profile.travelJournal')}
                        </Text>
                        <Ionicons name="grid" size={16} color={`${theme.primary}99`} />
                    </View>

                    {postsLoading ? (
                        <View style={styles.postsLoading}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    ) : posts && posts.length > 0 ? (
                        <View style={styles.masonryGrid}>
                            {/* Left Column */}
                            <View style={styles.masonryColumn}>
                                {posts.filter((_, i) => i % 2 === 0).map((post, index) => (
                                    <TouchableOpacity
                                        key={post.id}
                                        style={[
                                            styles.journalCard,
                                            { transform: [{ rotate: getRotation(index * 2) }] }
                                        ]}
                                        onPress={() => handlePostPress(post.id)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={[
                                            styles.journalCardInner,
                                            {
                                                backgroundColor: isDark ? 'rgba(62, 39, 35, 0.5)' : theme.surface,
                                                aspectRatio: getAspectRatio(index * 2),
                                            }
                                        ]}>
                                            {post.images && post.images.length > 0 ? (
                                                <Image
                                                    source={{ uri: post.images[0] }}
                                                    style={styles.journalImage}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View style={[styles.journalPlaceholder, { backgroundColor: theme.surface }]}>
                                                    <Ionicons name="image" size={40} color={theme.textMuted} />
                                                </View>
                                            )}
                                            <View style={styles.journalGradient} />
                                            <View style={styles.journalContent}>
                                                <Text style={styles.journalTitle} numberOfLines={1}>
                                                    {post.title}
                                                </Text>
                                                {post.location?.city && (
                                                    <Text style={styles.journalSubtitle} numberOfLines={1}>
                                                        {post.location.city}
                                                    </Text>
                                                )}
                                                <View style={styles.journalMeta}>
                                                    <View style={styles.journalStats}>
                                                        <Ionicons name="heart" size={12} color="#F5F1E8" />
                                                        <Text style={styles.journalStatText}>
                                                            {post.likes_count || 0}
                                                        </Text>
                                                    </View>
                                                    <Ionicons name="arrow-forward" size={14} color="#F5F1E880" />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Right Column */}
                            <View style={styles.masonryColumn}>
                                {posts.filter((_, i) => i % 2 === 1).map((post, index) => (
                                    <TouchableOpacity
                                        key={post.id}
                                        style={[
                                            styles.journalCard,
                                            {
                                                transform: [{ rotate: getRotation(index * 2 + 1) }],
                                                marginTop: index === 0 ? 16 : 0,
                                            }
                                        ]}
                                        onPress={() => handlePostPress(post.id)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={[
                                            styles.journalCardInner,
                                            {
                                                backgroundColor: isDark ? 'rgba(62, 39, 35, 0.5)' : theme.surface,
                                                aspectRatio: getAspectRatio(index * 2 + 1),
                                            }
                                        ]}>
                                            {post.images && post.images.length > 0 ? (
                                                <Image
                                                    source={{ uri: post.images[0] }}
                                                    style={styles.journalImage}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View style={[styles.journalPlaceholder, { backgroundColor: theme.surface }]}>
                                                    <Ionicons name="image" size={40} color={theme.textMuted} />
                                                </View>
                                            )}
                                            <View style={styles.journalGradient} />
                                            <View style={styles.journalContent}>
                                                <Text style={styles.journalTitle} numberOfLines={1}>
                                                    {post.title}
                                                </Text>
                                                <View style={styles.journalMeta}>
                                                    <View style={styles.journalStats}>
                                                        <Ionicons name="chatbubble" size={12} color="#F5F1E8" />
                                                        <Text style={styles.journalStatText}>
                                                            {post.comments_count || 0}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="images-outline" size={64} color={theme.textMuted} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {t('empty.noPosts')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Bottom Decoration */}
                <View style={styles.bottomDecoration}>
                    <Ionicons name="airplane" size={36} color={`${theme.primary}50`} />
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLabel: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 3,
    },

    // Photo Section
    photoSection: {
        alignItems: 'center',
        paddingTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    photoFrame: {
        position: 'relative',
    },
    cornerTL: {
        position: 'absolute',
        top: -4,
        left: -4,
        width: 24,
        height: 24,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    cornerTR: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 24,
        height: 24,
        borderTopWidth: 2,
        borderRightWidth: 2,
    },
    cornerBL: {
        position: 'absolute',
        bottom: -4,
        left: -4,
        width: 24,
        height: 24,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
    },
    cornerBR: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 24,
        height: 24,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
    photoContainer: {
        width: 128,
        height: 160,
        padding: 6,
        borderRadius: 2,
        transform: [{ rotate: '1deg' }],
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    profilePhoto: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approvedStamp: {
        position: 'absolute',
        bottom: -16,
        right: -24,
        width: 80,
        height: 80,
        borderWidth: 4,
        borderColor: 'rgba(212, 170, 115, 0.4)',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-15deg' }],
    },
    approvedText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 9,
        textAlign: 'center',
        textTransform: 'uppercase',
    },

    // Name Section
    nameSection: {
        alignItems: 'center',
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    fullName: {
        fontFamily: Typography.fonts.heading,
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    username: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xl,
        marginTop: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        width: '75%',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 20,
    },
    statLabel: {
        fontFamily: Typography.fonts.ui,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },

    // Bio Section
    bioSection: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
    },
    bioText: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    bioMeta: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    followButton: {
        flex: 1,
        maxWidth: 160,
        height: 48,
        borderRadius: BorderRadius.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    followButtonInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        margin: 3,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 6,
    },
    followButtonText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    messageButton: {
        flex: 1,
        maxWidth: 160,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
    },
    messageButtonText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    // Section
    section: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    sectionTitle: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 18,
        fontWeight: '700',
        borderBottomWidth: 2,
        borderColor: 'rgba(212, 170, 115, 0.2)',
        paddingBottom: 4,
    },
    sectionSubtitle: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6,
    },

    // Destinations
    destinationsContainer: {
        gap: Spacing.sm,
        paddingHorizontal: 4,
        paddingBottom: Spacing.sm,
    },
    destinationCard: {
        width: 96,
        height: 128,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(212, 170, 115, 0.2)',
        padding: Spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    destinationPin: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: 'rgba(212, 170, 115, 0.2)',
        marginBottom: Spacing.xs,
    },
    destinationName: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
        marginTop: Spacing.xs,
    },
    destinationCountry: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 10,
    },
    openMapButton: {
        width: 96,
        height: 128,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    openMapText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },

    // Masonry Grid
    masonryGrid: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    masonryColumn: {
        flex: 1,
        gap: Spacing.sm,
    },

    // Journal Card
    journalCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    journalCardInner: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    journalImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    journalPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    journalGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    },
    journalContent: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: Spacing.sm,
    },
    journalTitle: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 24,
        fontWeight: '700',
        color: '#F5F1E8',
    },
    journalSubtitle: {
        fontFamily: Typography.fonts.handwriting,
        fontSize: 16,
        color: '#F5F1E8',
        opacity: 0.8,
    },
    journalMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
        paddingTop: Spacing.xs,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    journalStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    journalStatText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 10,
        color: '#F5F1E8',
        letterSpacing: 1,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
    },
    emptyText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        marginTop: Spacing.md,
    },
    postsLoading: {
        paddingVertical: Spacing.xxl,
        alignItems: 'center',
    },

    // Bottom Decoration
    bottomDecoration: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
});
