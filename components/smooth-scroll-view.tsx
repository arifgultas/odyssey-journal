import React from 'react';
import { ScrollViewProps, StyleSheet } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

interface SmoothScrollViewProps extends ScrollViewProps {
    onScrollProgress?: (progress: number) => void;
    parallaxHeaderHeight?: number;
    children: React.ReactNode;
}

export const SmoothScrollView: React.FC<SmoothScrollViewProps> = ({
    onScrollProgress,
    parallaxHeaderHeight = 0,
    children,
    ...props
}) => {
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;

            if (onScrollProgress && parallaxHeaderHeight > 0) {
                const progress = Math.min(
                    Math.max(event.contentOffset.y / parallaxHeaderHeight, 0),
                    1
                );
                runOnJS(onScrollProgress)(progress);
            }
        },
    });

    return (
        <Animated.ScrollView
            {...props}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            decelerationRate="normal"
            bounces={true}
            bouncesZoom={true}
            style={[styles.scrollView, props.style]}
        >
            {children}
        </Animated.ScrollView>
    );
};

interface ParallaxHeaderProps {
    scrollY: ReturnType<typeof useSharedValue<number>>;
    headerHeight: number;
    children: React.ReactNode;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
    scrollY,
    headerHeight,
    children,
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [0, headerHeight],
            [0, -headerHeight / 2],
            Extrapolate.CLAMP
        );

        const scale = interpolate(
            scrollY.value,
            [-headerHeight, 0, headerHeight],
            [2, 1, 0.8],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            [0, headerHeight / 2, headerHeight],
            [1, 0.8, 0],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }, { scale }],
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.parallaxHeader, { height: headerHeight }, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

interface FadeInViewProps {
    scrollY: ReturnType<typeof useSharedValue<number>>;
    threshold: number;
    children: React.ReactNode;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
    scrollY,
    threshold,
    children,
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [threshold - 100, threshold],
            [0, 1],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            [threshold - 100, threshold],
            [20, 0],
            Extrapolate.CLAMP
        );

        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    parallaxHeader: {
        width: '100%',
        overflow: 'hidden',
    },
});
