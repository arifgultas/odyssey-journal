import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/context/language-context';
import { ProfileService } from '@/lib/profile-service';

interface HomeLocationModalProps {
    visible: boolean;
    userId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function HomeLocationModal({
    visible,
    userId,
    onClose,
    onSuccess,
}: HomeLocationModalProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(false);

    const markPromptAsSeen = async () => {
        try {
            await AsyncStorage.setItem(`home_location_prompted_${userId}`, 'true');
        } catch (err) {
            console.error('Failed to save home location prompt status to storage:', err);
        }
    };

    const handleUseCurrentLocation = async () => {
        setIsLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setIsLoading(false);
                await markPromptAsSeen();
                Alert.alert(
                    t('common.info') || 'Bilgi',
                    t('homeLocation.permissionDenied')
                );
                onClose();
                return;
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = position.coords;

            let cityName: string | undefined;
            let countryName: string | undefined;

            try {
                const addresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                if (addresses && addresses.length > 0) {
                    const addr = addresses[0];
                    cityName = addr.city || addr.subregion || addr.region || undefined;
                    countryName = addr.country || undefined;
                }
            } catch (geoError) {
                console.warn('Reverse geocoding failed, continuing with coords only:', geoError);
            }

            await ProfileService.updateProfile({
                home_location: {
                    latitude,
                    longitude,
                    city: cityName,
                    country: countryName,
                },
            });

            await markPromptAsSeen();

            // Refresh profile cache so stats immediately calculate correctly
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['profile-stats'] });

            const locationLabel = cityName
                ? (countryName ? `${cityName}, ${countryName}` : cityName)
                : '';

            const successMsg = locationLabel
                ? `${t('homeLocation.success')} (${locationLabel})`
                : t('homeLocation.success');

            Alert.alert(t('common.success') || 'Başarılı', successMsg);

            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error: any) {
            console.error('Error setting home location:', error);
            Alert.alert(
                t('common.error') || 'Hata',
                t('homeLocation.error')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLater = async () => {
        await markPromptAsSeen();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleLater}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: isDark ? '#221913' : '#F7F3EB',
                            borderColor: isDark ? '#4A3B2C' : '#D4A574',
                        },
                        Shadows.lg,
                    ]}
                >
                    {/* Vintage Gold Compass Header Icon */}
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: isDark ? '#36271A' : '#EFE8DA',
                                borderColor: isDark ? '#D4A574' : '#C49A6C',
                            },
                        ]}
                    >
                        <Ionicons
                            name="compass-outline"
                            size={38}
                            color={isDark ? '#DAA520' : '#8B6914'}
                        />
                    </View>

                    {/* Title */}
                    <Text
                        style={[
                            styles.title,
                            {
                                color: theme.text,
                            },
                        ]}
                    >
                        {t('homeLocation.title')}
                    </Text>

                    {/* Decorative Border Line */}
                    <View
                        style={[
                            styles.divider,
                            {
                                backgroundColor: isDark ? '#4A3B2C' : '#DCC8B0',
                            },
                        ]}
                    />

                    {/* Description */}
                    <Text
                        style={[
                            styles.description,
                            {
                                color: theme.textSecondary,
                            },
                        ]}
                    >
                        {t('homeLocation.description')}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                {
                                    backgroundColor: isDark ? '#C49A6C' : '#8B6914',
                                },
                            ]}
                            onPress={handleUseCurrentLocation}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.primaryButtonText}>
                                        {' ' + t('homeLocation.locating')}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.buttonContentRow}>
                                    <Ionicons name="navigate" size={18} color="#FFFFFF" />
                                    <Text style={styles.primaryButtonText}>
                                        {' ' + t('homeLocation.useCurrentLocation')}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleLater}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.secondaryButtonText,
                                    {
                                        color: theme.textMuted,
                                    },
                                ]}
                            >
                                {t('homeLocation.later')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(26, 20, 16, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        borderRadius: BorderRadius.xl,
        borderWidth: 1.5,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontFamily: Typography.fonts?.heading || undefined,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.xs,
        letterSpacing: 0.3,
    },
    divider: {
        width: 48,
        height: 2,
        borderRadius: 1,
        marginVertical: Spacing.sm,
    },
    description: {
        fontFamily: Typography.fonts?.body || undefined,
        fontSize: 14.5,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.xs,
    },
    buttonContainer: {
        width: '100%',
        gap: Spacing.xs,
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15.5,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
