import React, { useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, ViewToken } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PageTurnNavigatorProps {
    data: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    onViewableItemsChanged?: (items: ViewToken[]) => void;
}

export const PageTurnNavigator: React.FC<PageTurnNavigatorProps> = ({
    data,
    renderItem,
    onViewableItemsChanged,
}) => {
    const scrollX = useSharedValue(0);
    const flatListRef = useRef<FlatList>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const onViewableItemsChangedRef = useRef((info: { viewableItems: ViewToken[] }) => {
        if (onViewableItemsChanged) {
            onViewableItemsChanged(info.viewableItems);
        }
    });

    return (
        <Animated.FlatList
            ref={flatListRef}
            data={data}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="center"
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChangedRef.current}
            keyExtractor={(item, index) => `page-${index}`}
            renderItem={({ item, index }) => (
                <PageItem
                    item={item}
                    index={index}
                    scrollX={scrollX}
                    renderContent={renderItem}
                />
            )}
        />
    );
};

interface PageItemProps {
    item: any;
    index: number;
    scrollX: ReturnType<typeof useSharedValue<number>>;
    renderContent: (item: any, index: number) => React.ReactNode;
}

const PageItem: React.FC<PageItemProps> = ({ item, index, scrollX, renderContent }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
        ];

        // Page turn effect with rotation and scale
        const rotateY = interpolate(
            scrollX.value,
            inputRange,
            [15, 0, -15],
            Extrapolate.CLAMP
        );

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.9, 1, 0.9],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.6, 1, 0.6],
            Extrapolate.CLAMP
        );

        const translateX = interpolate(
            scrollX.value,
            inputRange,
            [SCREEN_WIDTH * 0.1, 0, -SCREEN_WIDTH * 0.1],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { perspective: 1000 },
                { translateX },
                { rotateY: `${rotateY}deg` },
                { scale },
            ],
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.page, animatedStyle]}>
            {renderContent(item, index)}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    page: {
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
