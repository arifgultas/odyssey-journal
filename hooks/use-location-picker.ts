import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
    name?: string;
}

export function useLocationPicker() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const requestPermissions = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need location permissions to add location to your posts.'
            );
            return false;
        }
        return true;
    };

    const getCurrentLocation = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setIsLoading(true);
        try {
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = currentLocation.coords;

            // Reverse geocode to get address
            const addresses = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (addresses.length > 0) {
                const address = addresses[0];
                setLocation({
                    latitude,
                    longitude,
                    address: `${address.street || ''} ${address.streetNumber || ''}`.trim(),
                    city: address.city || address.subregion || undefined,
                    country: address.country || undefined,
                    name: address.name || undefined,
                });
            } else {
                setLocation({
                    latitude,
                    longitude,
                });
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get current location. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const setCustomLocation = (locationData: LocationData) => {
        setLocation(locationData);
    };

    const clearLocation = () => {
        setLocation(null);
    };

    const getLocationString = () => {
        if (!location) return '';

        const parts = [];
        if (location.name) parts.push(location.name);
        if (location.city) parts.push(location.city);
        if (location.country) parts.push(location.country);

        return parts.join(', ') || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    };

    return {
        location,
        isLoading,
        getCurrentLocation,
        setCustomLocation,
        clearLocation,
        getLocationString,
    };
}
