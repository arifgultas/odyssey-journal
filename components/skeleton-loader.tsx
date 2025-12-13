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

    return (
        <View style={[styles.container, { width, height, borderRadius }, style]}>
            <Animated.View style={[styles.shimmer, animatedStyle]} />
        </View>
    );
};

export const PostCardSkeleton: React.FC = () => {
    return (
        <View style={styles.postCard}>
            <View style={styles.header}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <View style={styles.headerText}>
                    <SkeletonLoader width="60%" height={16} />
                    <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
                </View>
            </View>

            <SkeletonLoader width="100%" height={300} style={{ marginVertical: 12 }} />

            <SkeletonLoader width="80%" height={20} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="100%" height={16} />
            <SkeletonLoader width="90%" height={16} style={{ marginTop: 4 }} />

            <View style={styles.footer}>
                <SkeletonLoader width={60} height={32} borderRadius={16} />
                <SkeletonLoader width={60} height={32} borderRadius={16} />
                <SkeletonLoader width={60} height={32} borderRadius={16} />
            </View>
        </View>
    );
};

export const ProfileHeaderSkeleton: React.FC = () => {
    return (
        <View style={styles.profileHeader}>
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
    return (
        <View style={styles.comment}>
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
        backgroundColor: '#E1E9EE',
        overflow: 'hidden',
    },
    shimmer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    postCard: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
    },
    profileHeader: {
        padding: 20,
        backgroundColor: '#FFF',
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
        backgroundColor: '#FFF',
        marginBottom: 8,
    },
    commentContent: {
        marginLeft: 12,
        flex: 1,
    },
});
