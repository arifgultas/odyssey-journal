import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface OfflineIndicatorProps {
    position?: 'top' | 'bottom';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ position = 'top' }) => {
    const [isOffline, setIsOffline] = useState(false);
    const translateY = useSharedValue(position === 'top' ? -100 : 100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const offline = !state.isConnected || !state.isInternetReachable;
            setIsOffline(offline);

            if (offline) {
                // Show indicator
                translateY.value = withSpring(0, {
                    damping: 15,
                    stiffness: 100,
                });
                opacity.value = withTiming(1, {
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                });
            } else {
                // Hide indicator
                translateY.value = withSpring(position === 'top' ? -100 : 100, {
                    damping: 15,
                    stiffness: 100,
                });
                opacity.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.in(Easing.ease),
                });
            }
        });

        return () => unsubscribe();
    }, [position]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    const containerStyle = position === 'top' ? styles.containerTop : styles.containerBottom;

    return (
        <Animated.View style={[containerStyle, animatedStyle]}>
            <View style={styles.content}>
                <Ionicons name="cloud-offline" size={20} color={Colors.light.surface} />
                <Text style={styles.text}>No Internet Connection</Text>
            </View>
        </Animated.View>
    );
};

interface ConnectionStatusProps {
    showIcon?: boolean;
    iconSize?: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    showIcon = true,
    iconSize = 16,
}) => {
    const [connectionType, setConnectionType] = useState<string>('unknown');
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected ?? false);
            setConnectionType(state.type);
        });

        return () => unsubscribe();
    }, []);

    if (isConnected) {
        return null;
    }

    return (
        <View style={styles.statusContainer}>
            {showIcon && (
                <Ionicons
                    name="cloud-offline-outline"
                    size={iconSize}
                    color={Colors.light.textMuted}
                />
            )}
            <Text style={styles.statusText}>Offline Mode</Text>
        </View>
    );
};

/**
 * Hook to check network status
 */
export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [connectionType, setConnectionType] = useState<string>('unknown');

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected ?? false);
            setConnectionType(state.type);
        });

        return () => unsubscribe();
    }, []);

    return { isConnected, connectionType };
};

const styles = StyleSheet.create({
    containerTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: Colors.light.error,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    containerBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: Colors.light.error,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    text: {
        color: Colors.light.surface,
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: Colors.light.background,
        borderRadius: 12,
    },
    statusText: {
        color: Colors.light.textMuted,
        fontFamily: Typography.fonts.body,
        fontSize: 12,
    },
});
