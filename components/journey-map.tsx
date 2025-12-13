import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

const { width } = Dimensions.get('window');

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

/**
 * JourneyMap Component
 * 
 * Displays a user's travel journey on a map with connected locations.
 * Features:
 * - Multiple location markers
 * - Journey path visualization
 * - Location count display
 * - Premium book-inspired design
 */
export function JourneyMap({ locations, style }: JourneyMapProps) {
    if (!locations || locations.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer, style]}>
                <Ionicons name="map-outline" size={48} color={Colors.light.border} />
                <Text style={styles.emptyText}>No journey yet</Text>
                <Text style={styles.emptySubtext}>Start exploring the world!</Text>
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
                showsUserLocation={false}
                showsMyLocationButton={false}
                zoomEnabled={true}
                scrollEnabled={true}
            >
                {/* Journey Path */}
                {locations.length > 1 && (
                    <Polyline
                        coordinates={coordinates}
                        strokeColor={Colors.light.compass}
                        strokeWidth={3}
                        lineDashPattern={[10, 5]}
                    />
                )}

                {/* Location Markers */}
                {locations.map((location, index) => (
                    <Marker
                        key={location.id}
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title={location.title}
                        description={location.date}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.markerNumber}>
                                <Text style={styles.markerNumberText}>{index + 1}</Text>
                            </View>
                            <Ionicons name="location" size={28} color={Colors.light.compass} />
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Journey Stats Overlay */}
            <View style={styles.statsOverlay}>
                <View style={styles.statsCard}>
                    <Ionicons name="compass" size={24} color={Colors.light.compass} />
                    <View style={styles.statsText}>
                        <Text style={styles.statsNumber}>{locations.length}</Text>
                        <Text style={styles.statsLabel}>
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
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        borderWidth: 2,
        borderColor: Colors.light.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        color: Colors.light.textSecondary,
        marginTop: Spacing.md,
    },
    emptySubtext: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textMuted,
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
        backgroundColor: Colors.light.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.surface,
        ...Shadows.sm,
    },
    markerNumberText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 10,
        color: Colors.light.surface,
    },
    statsOverlay: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
    },
    statsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadows.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    statsText: {
        alignItems: 'flex-start',
    },
    statsNumber: {
        fontFamily: Typography.fonts.heading,
        fontSize: 24,
        color: Colors.light.primary,
        lineHeight: 28,
    },
    statsLabel: {
        fontFamily: Typography.fonts.body,
        fontSize: 11,
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
