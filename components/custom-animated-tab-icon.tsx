/**
 * Animated Tab Icon Component using Custom SVG Icons
 * Uses opacity animation for smooth transitions without iOS blur issues
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';

// Import custom icons for tab bar
import BellIcon from '@/assets/icons/bell-notification.svg';
import BookmarkIcon from '@/assets/icons/bookmark-save-ribbon.svg';
import CompassIcon from '@/assets/icons/compass.svg';
import CreateIcon from '@/assets/icons/create-plus-add.svg';
import HomeIcon from '@/assets/icons/home-house.svg';
import UserIcon from '@/assets/icons/user-profile-person.svg';

// Tab icon names type
export type TabIconName =
    | 'home'
    | 'compass'
    | 'create'
    | 'bookmark'
    | 'user'
    | 'bell';

// Icon registry for tab bar
const tabIconRegistry: Record<TabIconName, React.FC<SvgProps>> = {
    'home': HomeIcon,
    'compass': CompassIcon,
    'create': CreateIcon,
    'bookmark': BookmarkIcon,
    'user': UserIcon,
    'bell': BellIcon,
};

export interface CustomAnimatedTabIconProps {
    focused: boolean;
    color: string;
    size: number;
    icon: TabIconName;
}

/**
 * CustomAnimatedTabIcon - Animated tab icon using custom SVG icons
 * Uses opacity animation to avoid iOS SVG blur issues with scale transforms
 * 
 * @example
 * <CustomAnimatedTabIcon
 *   focused={focused}
 *   color={color}
 *   size={28}
 *   icon="home"
 * />
 */
export function CustomAnimatedTabIcon({
    focused,
    color,
    size,
    icon,
}: CustomAnimatedTabIconProps) {
    // Animation value: 0 = unfocused, 1 = focused
    const animValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
        // Use timing animation for smoother, predictable transitions
        Animated.timing(animValue, {
            toValue: focused ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [focused, animValue]);

    // Opacity transition for focused state
    const opacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
    });

    const IconComponent = tabIconRegistry[icon];

    if (!IconComponent) {
        console.warn(`Tab icon "${icon}" not found in registry`);
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: size + 8,
                    height: size + 8,
                    opacity,
                },
            ]}
        >
            <IconComponent
                width={size}
                height={size}
                fill={color}
                color={color}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CustomAnimatedTabIcon;
