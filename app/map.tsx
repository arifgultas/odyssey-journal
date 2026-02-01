import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateMapCenter, calculateZoomDelta, fetchPostLocations, LocationCluster } from '@/lib/map-locations';
import { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// react-native-maps requires a Development Build and is not compatible with Expo Go
// To enable maps, create a development build and uncomment the import below
// For now, we show a fallback UI with location list

// Uncomment the following to enable maps in Development Build:
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Placeholder - maps disabled for Expo Go compatibility
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;
const mapsAvailable = false; // Set to true when using Development Build with react-native-maps

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design Colors
const MapColors = {
    light: {
        background: '#F5F1E8',
        surface: '#FFFFFF',
        text: '#181511',
        textSecondary: '#887863',
        accent: '#D4A574',
        primary: '#8B7355',
        border: '#E8DCC8',
        markerBg: '#FFFFFF',
        markerBorder: '#D4A574',
        clusterBg: '#D4A574',
        clusterText: '#FFFFFF',
    },
    dark: {
        background: '#1A1410',
        surface: '#2C1810',
        text: '#F5F1E8',
        textSecondary: '#D4A574',
        accent: '#D4A574',
        primary: '#8B7355',
        border: '#3D2F20',
        markerBg: '#2C1810',
        markerBorder: '#D4A574',
        clusterBg: '#D4A574',
        clusterText: '#1A1410',
    },
};

interface PostListModalProps {
    visible: boolean;
    cluster: LocationCluster | null;
    onClose: () => void;
    onPostPress: (postId: string) => void;
    theme: typeof MapColors.light;
}

// Post List Modal Component
function PostListModal({ visible, cluster, onClose, onPostPress, theme }: PostListModalProps) {
    const { t } = useLanguage();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('notifications.today');
        if (diffDays === 1) return t('time.yesterday');
        if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
        if (diffDays < 30) return t('time.weeksAgo', { count: Math.floor(diffDays / 7) });
        return t('time.monthsAgo', { count: Math.floor(diffDays / 30) });
    };

    const renderPostItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={[styles.postItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {
                onClose();
                onPostPress(item.id);
            }}
            activeOpacity={0.7}
        >
            <View style={styles.postImageContainer}>
                {item.images?.[0] ? (
                    <Image
                        source={{ uri: item.images[0] }}
                        style={styles.postThumbnail}
                        contentFit="cover"
                    />
                ) : (
                    <View style={[styles.postThumbnailPlaceholder, { backgroundColor: theme.border }]}>
                        <Ionicons name="image-outline" size={24} color={theme.textSecondary} />
                    </View>
                )}
            </View>
            <View style={styles.postInfo}>
                <Text style={[styles.postTitle, { color: theme.text }]} numberOfLines={2}>
                    {item.title || t('explore.untitledPost')}
                </Text>
                <View style={styles.postMeta}>
                    <View style={styles.postAuthor}>
                        {item.profiles?.avatar_url ? (
                            <Image
                                source={{ uri: item.profiles.avatar_url }}
                                style={styles.authorAvatar}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={[styles.authorAvatarPlaceholder, { backgroundColor: theme.border }]}>
                                <Ionicons name="person" size={10} color={theme.textSecondary} />
                            </View>
                        )}
                        <Text style={[styles.authorName, { color: theme.textSecondary }]}>
                            @{item.profiles?.username || t('profile.defaultUser').toLowerCase()}
                        </Text>
                    </View>
                    <Text style={[styles.postDate, { color: theme.textSecondary }]}>
                        {formatDate(item.created_at)}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    if (!cluster) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
                <Animated.View
                    style={[
                        styles.modalContent,
                        { backgroundColor: theme.background, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalTitleRow}>
                            <View style={styles.modalTitleContainer}>
                                <Ionicons name="location" size={24} color={theme.accent} />
                                <View>
                                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                                        {cluster.locationName || cluster.city || t('map.unknownLocation')}
                                    </Text>
                                    <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                                        {t('map.postCount', { count: cluster.postCount })}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Post List */}
                    <FlatList
                        data={cluster.posts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPostItem}
                        contentContainerStyle={styles.postList}
                        showsVerticalScrollIndicator={false}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
}

// Custom Marker Component
interface ClusterMarkerProps {
    cluster: LocationCluster;
    onPress: () => void;
    theme: typeof MapColors.light;
}

function ClusterMarker({ cluster, onPress, theme }: ClusterMarkerProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
        }).start();
    };

    return (
        <Marker
            coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
            onPress={onPress}
        >
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View style={[styles.markerContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={[styles.markerCircle, { backgroundColor: theme.markerBg, borderColor: theme.markerBorder }]}>
                        <Ionicons name="location" size={20} color={theme.accent} />
                    </View>
                    <View style={[styles.markerCountBadge, { backgroundColor: theme.clusterBg }]}>
                        <Text style={[styles.markerCountText, { color: theme.clusterText }]}>
                            {cluster.postCount}
                        </Text>
                    </View>
                    <View style={[styles.markerTail, { borderTopColor: theme.markerBg }]} />
                </Animated.View>
            </TouchableOpacity>
        </Marker>
    );
}

// Main Map Screen
export default function MapScreen() {
    const { t, language } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = MapColors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const mapRef = useRef<any>(null);

    const [clusters, setClusters] = useState<LocationCluster[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCluster, setSelectedCluster] = useState<LocationCluster | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [region, setRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }>({
        latitude: 39.0,
        longitude: 35.0,
        latitudeDelta: 10,
        longitudeDelta: 10,
    });

    useEffect(() => {
        loadLocationData();
    }, []);

    const loadLocationData = async () => {
        try {
            setIsLoading(true);
            const data = await fetchPostLocations();
            setClusters(data);

            if (data.length > 0) {
                const center = calculateMapCenter(data);
                const delta = calculateZoomDelta(data);
                setRegion({
                    latitude: center.latitude,
                    longitude: center.longitude,
                    latitudeDelta: delta.latDelta,
                    longitudeDelta: delta.lngDelta,
                });
            }
        } catch (error) {
            console.error('Error loading map data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkerPress = useCallback((cluster: LocationCluster) => {
        setSelectedCluster(cluster);
        setShowModal(true);
    }, []);

    const handlePostPress = useCallback((postId: string) => {
        router.push({
            pathname: '/post-detail/[id]',
            params: { id: postId },
        });
    }, []);

    const handleZoomIn = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                ...region,
                latitudeDelta: region.latitudeDelta / 2,
                longitudeDelta: region.longitudeDelta / 2,
            }, 300);
        }
    };

    const handleZoomOut = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                ...region,
                latitudeDelta: region.latitudeDelta * 2,
                longitudeDelta: region.longitudeDelta * 2,
            }, 300);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleCenterMap = () => {
        if (clusters.length > 0 && mapRef.current) {
            const center = calculateMapCenter(clusters);
            const delta = calculateZoomDelta(clusters);
            mapRef.current.animateToRegion({
                latitude: center.latitude,
                longitude: center.longitude,
                latitudeDelta: delta.latDelta,
                longitudeDelta: delta.lngDelta,
            }, 500);
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        backgroundColor: colorScheme === 'dark'
                            ? 'rgba(26, 20, 16, 0.95)'
                            : 'rgba(245, 241, 232, 0.95)',
                        borderBottomColor: `${theme.accent}33`,
                    },
                ]}
            >
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{t('map.title')}</Text>
                <TouchableOpacity onPress={handleCenterMap} style={styles.centerButton}>
                    <Ionicons name="locate" size={24} color={theme.accent} />
                </TouchableOpacity>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                {isLoading ? (
                    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                        <ActivityIndicator size="large" color={theme.accent} />
                        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                            {t('map.loading')}
                        </Text>
                    </View>
                ) : (!mapsAvailable || Platform.OS === 'web') ? (
                    // Fallback - show location list instead of map (Web or Expo Go)
                    <ScrollView
                        style={[styles.webFallback, { backgroundColor: theme.background }]}
                        contentContainerStyle={styles.webFallbackContent}
                    >
                        <View style={[styles.webNotice, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Ionicons name="map-outline" size={48} color={theme.accent} />
                            <Text style={[styles.webNoticeTitle, { color: theme.text }]}>
                                {Platform.OS === 'web' ? t('map.notSupportedWeb') : t('map.notSupportedExpo')}
                            </Text>
                            <Text style={[styles.webNoticeSubtitle, { color: theme.textSecondary }]}>
                                {Platform.OS === 'web'
                                    ? t('map.useMobileApp')
                                    : t('map.useDevBuild')}{'\n'}
                                {t('map.fallbackList')}
                            </Text>
                        </View>

                        {clusters.length > 0 ? (
                            <>
                                <View style={styles.webStatsRow}>
                                    <Ionicons name="pin" size={16} color={theme.accent} />
                                    <Text style={[styles.webStatsText, { color: theme.text }]}>
                                        {t('map.stats', {
                                            locationCount: clusters.length,
                                            postCount: clusters.reduce((sum, c) => sum + c.postCount, 0)
                                        })}
                                    </Text>
                                </View>

                                {clusters.map((cluster) => (
                                    <TouchableOpacity
                                        key={cluster.id}
                                        style={[styles.webLocationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                        onPress={() => handleMarkerPress(cluster)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.webLocationIcon, { backgroundColor: `${theme.accent}20` }]}>
                                            <Ionicons name="location" size={24} color={theme.accent} />
                                        </View>
                                        <View style={styles.webLocationInfo}>
                                            <Text style={[styles.webLocationName, { color: theme.text }]}>
                                                {cluster.locationName || cluster.city || t('map.unknownLocation')}
                                            </Text>
                                            <Text style={[styles.webLocationMeta, { color: theme.textSecondary }]}>
                                                {t('map.postCount', { count: cluster.postCount })} • {cluster.country || ''}
                                            </Text>
                                        </View>
                                        <View style={[styles.webLocationBadge, { backgroundColor: theme.accent }]}>
                                            <Text style={[styles.webLocationBadgeText, { color: theme.background }]}>
                                                {cluster.postCount}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : (
                            <View style={styles.webEmptyState}>
                                <Ionicons name="location-outline" size={64} color={theme.accent} />
                                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                    {t('map.noPosts')}
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                    {t('map.addLocationTip')}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                ) : (
                    // Native map view
                    <>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={region}
                            onRegionChangeComplete={setRegion}
                            showsUserLocation
                            showsMyLocationButton={false}
                            showsCompass={false}
                            mapType="standard"
                        >
                            {clusters.map((cluster) => (
                                <ClusterMarker
                                    key={cluster.id}
                                    cluster={cluster}
                                    onPress={() => handleMarkerPress(cluster)}
                                    theme={theme}
                                />
                            ))}
                        </MapView>

                        {/* Zoom Controls */}
                        <View style={[styles.zoomControls, { bottom: insets.bottom + 100 }]}>
                            <TouchableOpacity
                                style={[styles.zoomButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={handleZoomIn}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add" size={24} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.zoomButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={handleZoomOut}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="remove" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Empty State */}
                        {clusters.length === 0 && (
                            <View style={[styles.emptyOverlay, { backgroundColor: `${theme.background}CC` }]}>
                                <Ionicons name="location-outline" size={64} color={theme.accent} />
                                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                    {t('map.noPosts')}
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                    {t('map.addLocationTip')}
                                </Text>
                            </View>
                        )}

                        {/* Stats Badge */}
                        {clusters.length > 0 && (
                            <View style={[styles.statsBadge, { backgroundColor: theme.surface, borderColor: theme.border, top: insets.top + 70 }]}>
                                <Ionicons name="pin" size={16} color={theme.accent} />
                                <Text style={[styles.statsText, { color: theme.text }]}>
                                    {t('map.stats', {
                                        locationCount: clusters.length,
                                        postCount: clusters.reduce((sum, c) => sum + c.postCount, 0)
                                    })}
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Post List Modal */}
            <PostListModal
                visible={showModal}
                cluster={selectedCluster}
                onClose={() => setShowModal(false)}
                onPostPress={handlePostPress}
                theme={theme}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        letterSpacing: 0.5,
    },
    centerButton: {
        padding: Spacing.xs,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: 14,
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        ...Shadows.md,
    },
    markerCountBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    markerCountText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 12,
    },
    markerTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },
    zoomControls: {
        position: 'absolute',
        right: Spacing.md,
        gap: Spacing.sm,
    },
    zoomButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        ...Shadows.md,
    },
    emptyOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        marginTop: Spacing.md,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        marginTop: Spacing.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    statsBadge: {
        position: 'absolute',
        left: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        ...Shadows.sm,
    },
    statsText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 13,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        maxHeight: SCREEN_HEIGHT * 0.6,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingBottom: 34,
    },
    modalHeader: {
        paddingTop: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.md,
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    modalTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
    },
    modalSubtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    postList: {
        padding: Spacing.md,
    },
    postItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.sm,
    },
    postImageContainer: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
    },
    postThumbnail: {
        width: '100%',
        height: '100%',
    },
    postThumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    postTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 15,
        marginBottom: 4,
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    postAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    authorAvatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    authorAvatarPlaceholder: {
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
    },
    postDate: {
        fontFamily: Typography.fonts.body,
        fontSize: 11,
    },
    // Web Fallback Styles
    webFallback: {
        flex: 1,
    },
    webFallbackContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    webNotice: {
        alignItems: 'center',
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.lg,
    },
    webNoticeTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        marginTop: Spacing.md,
        textAlign: 'center',
    },
    webNoticeSubtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        marginTop: Spacing.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    webStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    webStatsText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
    },
    webLocationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.sm,
    },
    webLocationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webLocationInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    webLocationName: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        marginBottom: 2,
    },
    webLocationMeta: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
    },
    webLocationBadge: {
        minWidth: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    webLocationBadgeText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
    },
    webEmptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
    },
});
