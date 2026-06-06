import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { mapStyleDark, mapStyleLight } from '@/constants/map-styles';
import { useTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
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
 * - Google Maps integration with Odyssey themed styling
 * - Dark/light mode auto-switch
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
    const { isDark } = useTheme();
    const colors = isDark ? Colors.dark : Colors.light;

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(-40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 70,
                friction: 8,
            }),
            Animated.spring(translateYAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 70,
                friction: 8,
            }),
        ]).start();
    }, []);

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
                customMapStyle={isDark ? mapStyleDark : mapStyleLight}
                showsUserLocation={false}
                showsMyLocationButton={false}
                zoomEnabled={true}
                scrollEnabled={true}
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    title={title}
                    description={description}
                    tracksViewChanges={false}
                >
                    <Animated.View
                        style={[
                            styles.markerContainer,
                            {
                                transform: [
                                    { scale: scaleAnim },
                                    { translateY: translateYAnim },
                                ],
                            },
                        ]}
                    >
                        <Ionicons name="location" size={32} color={colors.compass} />
                    </Animated.View>
                </Marker>
            </MapView>

            {/* Location Info Overlay */}
            {(title || description) && (
                <View style={styles.infoOverlay}>
                    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="compass" size={20} color={colors.compass} />
                        <View style={styles.infoText}>
                            {title && <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>}
                            {description && (
                                <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>{description}</Text>
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
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadows.lg,
        borderWidth: 1,
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        marginBottom: 2,
    },
    infoDescription: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
    },
});

