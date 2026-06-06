import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { mapStyleDark, mapStyleLight } from '@/constants/map-styles';
import { useTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

interface JourneyLocation {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    date?: string;
}

interface JourneyMapProps {
    locations: JourneyLocation[];
    style?: any;
}

interface AnimatedJourneyMarkerProps {
    location: JourneyLocation;
    index: number;
    colors: any;
}

/**
 * AnimatedJourneyMarker — scale-in animation on mount with staggered delay.
 */
function AnimatedJourneyMarker({ location, index, colors }: AnimatedJourneyMarkerProps) {
    const entryAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const delay = index * 100;
        Animated.sequence([
            Animated.delay(delay),
            Animated.spring(entryAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 80,
                friction: 8,
            }),
        ]).start();
    }, [index]);

    const scale = entryAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const opacity = entryAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.8, 1],
    });

    return (
        <Marker
            coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
            }}
            title={location.title}
            description={location.date}
            tracksViewChanges={false}
        >
            <Animated.View style={[styles.markerContainer, { opacity, transform: [{ scale }] }]}>
                <View style={[styles.markerNumber, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                    <Text style={[styles.markerNumberText, { color: colors.surface }]}>{index + 1}</Text>
                </View>
                <Ionicons name="location" size={28} color={colors.compass} />
            </Animated.View>
        </Marker>
    );
}

/**
 * JourneyMap Component
 * 
 * Displays a user's travel journey on a map with connected locations.
 * Features:
 * - Multiple location markers with Odyssey themed styling
 * - Dark/light mode auto-switch via custom Google Maps style JSON
 * - Journey path visualization (dashed polyline)
 * - Location count display
 * - Premium book-inspired design
 */
export function JourneyMap({ locations, style }: JourneyMapProps) {
    const { isDark } = useTheme();
    const colors = isDark ? Colors.dark : Colors.light;

    if (!locations || locations.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="map-outline" size={48} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No journey yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Start exploring the world!</Text>
            </View>
        );
    }

    // Calculate map region to fit all markers
    const coordinates = locations.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
    }));

    const latitudes = coordinates.map(c => c.latitude);
    const longitudes = coordinates.map(c => c.longitude);

    const region = {
        latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
        longitude: (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
        latitudeDelta: Math.max(...latitudes) - Math.min(...latitudes) + 0.5,
        longitudeDelta: Math.max(...longitudes) - Math.min(...longitudes) + 0.5,
    };

    return (
        <View style={[styles.container, style]}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={region}
                customMapStyle={isDark ? mapStyleDark : mapStyleLight}
                showsUserLocation={false}
                showsMyLocationButton={false}
                zoomEnabled={true}
                scrollEnabled={true}
            >
                {/* Journey Path */}
                {locations.length > 1 && (
                    <Polyline
                        coordinates={coordinates}
                        strokeColor={colors.compass}
                        strokeWidth={3}
                        lineDashPattern={[10, 5]}
                    />
                )}

                {/* Location Markers */}
                {locations.map((location, index) => (
                    <AnimatedJourneyMarker
                        key={location.id}
                        location={location}
                        index={index}
                        colors={colors}
                    />
                ))}
            </MapView>

            {/* Journey Stats Overlay */}
            <View style={styles.statsOverlay}>
                <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="compass" size={24} color={colors.compass} />
                    <View style={styles.statsText}>
                        <Text style={[styles.statsNumber, { color: colors.primary }]}>{locations.length}</Text>
                        <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                            {locations.length === 1 ? 'Location' : 'Locations'} Visited
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 400,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        marginTop: Spacing.md,
    },
    emptySubtext: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    markerNumber: {
        position: 'absolute',
        top: -8,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        ...Shadows.sm,
    },
    markerNumberText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 10,
    },
    statsOverlay: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
    },
    statsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadows.lg,
        borderWidth: 1,
    },
    statsText: {
        alignItems: 'flex-start',
    },
    statsNumber: {
        fontFamily: Typography.fonts.heading,
        fontSize: 24,
        lineHeight: 28,
    },
    statsLabel: {
        fontFamily: Typography.fonts.body,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
