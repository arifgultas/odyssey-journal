import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring
} from 'react-native-reanimated';

interface BookmarkRibbonProps {
    isBookmarked: boolean;
    onToggle: () => void;
    size?: number;
}

export const BookmarkRibbon: React.FC<BookmarkRibbonProps> = ({
    isBookmarked,
    onToggle,
    size = 24,
}) => {
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isBookmarked) {
            // Animate when bookmarked
            scale.value = withSequence(
                withSpring(1.3, { damping: 2, stiffness: 100 }),
                withSpring(1, { damping: 2, stiffness: 100 })
            );
            rotation.value = withSequence(
                withSpring(10, { damping: 2, stiffness: 100 }),
                withSpring(-10, { damping: 2, stiffness: 100 }),
                withSpring(0, { damping: 2, stiffness: 100 })
            );
        } else {
            scale.value = withSpring(1);
            rotation.value = withSpring(0);
        }
    }, [isBookmarked]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}deg` },
            ],
        };
    });

    return (
        <Pressable onPress={onToggle} style={styles.container}>
            <Animated.View style={[styles.ribbon, animatedStyle]}>
                <Ionicons
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={size}
                    color={isBookmarked ? '#D4AF37' : '#64748B'}
                />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    ribbon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
