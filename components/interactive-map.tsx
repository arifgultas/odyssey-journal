import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface InteractiveMapProps {
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    style?: any;
}

/**
 * InteractiveMap Component
 * 
 * Displays an interactive map with a location marker.
 * Features:
 * - Google Maps integration
 * - Custom marker styling
 * - Location info display
 * - Premium book-inspired design
 */
export function InteractiveMap({
    latitude,
    longitude,
    title,
    description,
    style,
}: InteractiveMapProps) {
    const region = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
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
                <Marker
                    coordinate={{ latitude, longitude }}
                    title={title}
                    description={description}
                >
                    <View style={styles.markerContainer}>
                        <Ionicons name="location" size={32} color={Colors.light.compass} />
                    </View>
                </Marker>
            </MapView>

            {/* Location Info Overlay */}
            {(title || description) && (
                <View style={styles.infoOverlay}>
                    <View style={styles.infoCard}>
                        <Ionicons name="compass" size={20} color={Colors.light.compass} />
                        <View style={styles.infoText}>
                            {title && <Text style={styles.infoTitle}>{title}</Text>}
                            {description && (
                                <Text style={styles.infoDescription}>{description}</Text>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 300,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoOverlay: {
        position: 'absolute',
        bottom: Spacing.md,
        left: Spacing.md,
        right: Spacing.md,
    },
    infoCard: {
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
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 2,
    },
    infoDescription: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        color: Colors.light.textSecondary,
    },
});
