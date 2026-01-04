import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const shimmerValue = useSharedValue(0);

    useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(shimmerValue.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
        return { opacity };
    });

    const bgColor = colorScheme === 'dark' ? '#3D2F20' : '#E8DCC8';
    const shimmerColor = colorScheme === 'dark' ? '#4D3F30' : '#F5F1E8';

    return (
        <View style={[styles.container, { width, height, borderRadius, backgroundColor: bgColor }, style]}>
            <Animated.View style={[styles.shimmer, { backgroundColor: shimmerColor }, animatedStyle]} />
        </View>
    );
};

/**
 * Polaroid-style skeleton for PostCard
 * Matches the new Google Stitch design
 */
export const PostCardSkeleton: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Random rotation like real polaroid cards
    const rotation = [-2, 1, -1, 2][Math.floor(Math.random() * 4)];

    return (
        <View style={[
            styles.polaroidCard,
            {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                transform: [{ rotate: `${rotation}deg` }]
            }
        ]}>
            {/* Image skeleton */}
            <View style={styles.imageContainer}>
                <SkeletonLoader width="100%" height="100%" borderRadius={BorderRadius.xs} />
            </View>

            {/* Handwriting caption skeleton */}
            <View style={styles.captionContainer}>
                <SkeletonLoader width={120} height={28} borderRadius={4} style={styles.locationSkeleton} />
                <SkeletonLoader width={100} height={20} borderRadius={4} style={styles.dateSkeleton} />
            </View>

            {/* User section skeleton */}
            <View style={[styles.userSection, { borderTopColor: theme.border }]}>
                <SkeletonLoader width={36} height={36} borderRadius={18} />
                <View style={styles.userTextSkeleton}>
                    <SkeletonLoader width={80} height={12} borderRadius={6} />
                    <SkeletonLoader width="100%" height={10} borderRadius={5} style={{ marginTop: 6 }} />
                    <SkeletonLoader width="80%" height={10} borderRadius={5} style={{ marginTop: 4 }} />
                </View>
            </View>

            {/* Actions skeleton */}
            <View style={[styles.actionsSkeleton, { borderTopColor: theme.border }]}>
                <SkeletonLoader width={40} height={20} borderRadius={10} />
                <SkeletonLoader width={40} height={20} borderRadius={10} />
                <SkeletonLoader width={24} height={20} borderRadius={10} />
                <View style={{ flex: 1 }} />
                <SkeletonLoader width={20} height={24} borderRadius={4} />
            </View>
        </View>
    );
};

export const ProfileHeaderSkeleton: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
            <SkeletonLoader width={100} height={100} borderRadius={50} style={{ alignSelf: 'center' }} />
            <SkeletonLoader width="60%" height={24} style={{ marginTop: 16, alignSelf: 'center' }} />
            <SkeletonLoader width="40%" height={16} style={{ marginTop: 8, alignSelf: 'center' }} />

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <SkeletonLoader width={40} height={20} />
                    <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
                </View>
                <View style={styles.statItem}>
                    <SkeletonLoader width={40} height={20} />
                    <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
                </View>
                <View style={styles.statItem}>
                    <SkeletonLoader width={40} height={20} />
                    <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
                </View>
            </View>
        </View>
    );
};

export const CommentSkeleton: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.comment, { backgroundColor: theme.surface }]}>
            <SkeletonLoader width={32} height={32} borderRadius={16} />
            <View style={styles.commentContent}>
                <SkeletonLoader width="40%" height={14} />
                <SkeletonLoader width="100%" height={12} style={{ marginTop: 6 }} />
                <SkeletonLoader width="80%" height={12} style={{ marginTop: 4 }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    shimmer: {
        flex: 1,
    },
    // Polaroid card skeleton styles
    polaroidCard: {
        padding: Spacing.sm,
        paddingBottom: Spacing.md,
        borderRadius: BorderRadius.xs,
        borderWidth: 1,
        marginBottom: Spacing.xl,
        marginHorizontal: Spacing.xs,
        // Polaroid shadow
        shadowColor: '#2C1810',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    imageContainer: {
        aspectRatio: 1,
        borderRadius: BorderRadius.xs,
        overflow: 'hidden',
        position: 'relative',
    },

    captionContainer: {
        alignItems: 'center',
        paddingTop: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    locationSkeleton: {
        alignSelf: 'center',
    },
    dateSkeleton: {
        alignSelf: 'center',
        marginTop: Spacing.xs,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    userTextSkeleton: {
        flex: 1,
    },
    actionsSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingTop: Spacing.sm,
        marginTop: Spacing.xs,
        borderTopWidth: 1,
    },
    // Legacy styles for other skeletons
    profileHeader: {
        padding: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    comment: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 8,
    },
    commentContent: {
        marginLeft: 12,
        flex: 1,
    },
});
