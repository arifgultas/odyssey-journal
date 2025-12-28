import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface AnimatedTabIconProps {
    focused: boolean;
    color: string;
    size: number;
    filledName: IconName;
    outlineName: IconName;
}

/**
 * Animated tab icon component with a smooth fill/unfill transition.
 * Uses opacity crossfade with scale animation for premium feel.
 */
export function AnimatedTabIcon({
    focused,
    color,
    size,
    filledName,
    outlineName,
}: AnimatedTabIconProps) {
    // Animation value: 0 = outline, 1 = filled
    const animValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
        // Smooth transition matching Stitch's timing
        Animated.timing(animValue, {
            toValue: focused ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [focused]);

    // Filled icon opacity & scale (visible when focused)
    const filledOpacity = animValue;
    const filledScale = animValue.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: [0.7, 1.1, 1],
    });

    // Outline icon opacity (visible when NOT focused)
    const outlineOpacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    return (
        <Animated.View
            style={{
                width: size + 4,
                height: size + 4,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Outline icon - fades out when focused */}
            <Animated.View
                style={{
                    position: 'absolute',
                    opacity: outlineOpacity,
                }}
            >
                <MaterialCommunityIcons
                    name={outlineName}
                    size={size}
                    color={color}
                />
            </Animated.View>

            {/* Filled icon - fades in with scale when focused */}
            <Animated.View
                style={{
                    position: 'absolute',
                    opacity: filledOpacity,
                    transform: [{ scale: filledScale }],
                }}
            >
                <MaterialCommunityIcons
                    name={filledName}
                    size={size}
                    color={color}
                />
            </Animated.View>
        </Animated.View>
    );
}

