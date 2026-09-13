import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { mapStyleDark, mapStyleLight } from '@/constants/map-styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/context/language-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const isExpoGoOnIos = Platform.OS === 'ios' && Constants.appOwnership === 'expo';
const mapsAvailable = Platform.OS !== 'web' && !isExpoGoOnIos;

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = 'google';

if (mapsAvailable) {
    try {
        const MapsModule = require('react-native-maps');
        MapView = MapsModule.default;
        Marker = MapsModule.Marker;
        PROVIDER_GOOGLE = MapsModule.PROVIDER_GOOGLE;
    } catch (error) {
        console.warn('Failed to load react-native-maps in LocationMapPreview:', error);
    }
}

export const openLocationInExternalMaps = (latitude: number, longitude: number, label?: string) => {
    const encodedLabel = encodeURIComponent(label || 'Location');
    const scheme = Platform.select({
        ios: `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`,
        default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.canOpenURL(scheme)
        .then((supported) => {
            if (supported) {
                return Linking.openURL(scheme);
            } else {
                return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
            }
        })
        .catch(() => {
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
        });
};

interface LocationMapPreviewProps {
    latitude: number;
    longitude: number;
    title?: string;
    height?: number;
    interactive?: boolean;
    showPin?: boolean;
    showOpenButton?: boolean;
    onPress?: () => void;
}

export function LocationMapPreview({
    latitude,
    longitude,
    title,
    height = 200,
    interactive = false,
    showPin = true,
    showOpenButton = true,
    onPress,
}: LocationMapPreviewProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme ?? 'light'];
    const { t } = useLanguage();

    const pinBounceAnim = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        Animated.spring(pinBounceAnim, {
            toValue: 0,
            tension: 80,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, [latitude, longitude]);

    const region = {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    const handleOpenMap = () => {
        if (onPress) {
            onPress();
        } else {
            openLocationInExternalMaps(latitude, longitude, title);
        }
    };

    // Render native map view if available
    if (mapsAvailable && MapView) {
        return (
            <View style={[styles.container, { height }]}>
                <MapView
                    style={StyleSheet.absoluteFillObject}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                    region={region}
                    customMapStyle={isDark ? mapStyleDark : mapStyleLight}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    scrollEnabled={interactive}
                    zoomEnabled={interactive}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    cacheEnabled={!interactive}
                >
                    {showPin && Marker && (
                        <Marker
                            coordinate={{ latitude, longitude }}
                            title={title}
                            tracksViewChanges={false}
                        >
                            <Animated.View
                                style={[
                                    styles.pinMarkerWrapper,
                                    {
                                        transform: [{ translateY: pinBounceAnim }],
                                    },
                                ]}
                            >
                                <View style={styles.pinBubble}>
                                    <Ionicons name="location" size={32} color="#D4A574" />
                                </View>
                            </Animated.View>
                        </Marker>
                    )}
                </MapView>

                {/* Vintage overlay tint */}
                <View style={styles.vintageSepiaOverlay} pointerEvents="none" />

                {/* External Maps Launcher Button */}
                {showOpenButton && (
                    <TouchableOpacity
                        style={[styles.openInMapsButton, { backgroundColor: isDark ? 'rgba(44, 24, 16, 0.9)' : 'rgba(255, 255, 255, 0.92)' }]}
                        onPress={handleOpenMap}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="navigate-outline" size={14} color={theme.primary} style={{ marginRight: 4 }} />
                        <Text style={[styles.openInMapsText, { color: theme.primary }]}>
                            {Platform.OS === 'ios' ? t('map.appleMaps') : t('map.openInMaps')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // Fallback if MapView is not available (Expo Go iOS or Web)
    const osmStaticUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=13&size=600x300&markers=${latitude},${longitude},ol-marker`;

    return (
        <TouchableOpacity
            style={[styles.container, { height, backgroundColor: isDark ? '#2a1f18' : '#e8dcc8' }]}
            onPress={handleOpenMap}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: osmStaticUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
            />
            <View style={styles.vintageSepiaOverlay} />

            {showPin && (
                <View style={styles.fallbackCenterMarker}>
                    <Ionicons name="location" size={36} color="#D4A574" />
                    {title && (
                        <View style={[styles.fallbackTitleBadge, { backgroundColor: isDark ? '#2C1810' : '#FFFFFF' }]}>
                            <Text style={[styles.fallbackTitleText, { color: theme.text }]} numberOfLines={1}>
                                {title}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {showOpenButton && (
                <View style={[styles.openInMapsButton, { backgroundColor: isDark ? 'rgba(44, 24, 16, 0.9)' : 'rgba(255, 255, 255, 0.92)' }]}>
                    <Ionicons name="navigate-outline" size={14} color={theme.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.openInMapsText, { color: theme.primary }]}>
                        {t('map.openInMap')}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    pinMarkerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinBubble: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 6,
    },
    vintageSepiaOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(112, 66, 20, 0.08)',
    },
    openInMapsButton: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.5)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    openInMapsText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 0.3,
    },
    fallbackCenterMarker: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackTitleBadge: {
        marginTop: 4,
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
        maxWidth: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    fallbackTitleText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 12,
        textAlign: 'center',
    },
});
