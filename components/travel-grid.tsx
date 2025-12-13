import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 2; // 3 columns with 1px gap

interface Post {
    id: string;
    image_urls: string[];
}

interface TravelGridProps {
    posts: Post[];
}

export function TravelGrid({ posts }: TravelGridProps) {
    const router = useRouter();

    const handlePostPress = (postId: string) => {
        router.push(`/post-detail/${postId}`);
    };

    const renderItem = ({ item }: { item: Post }) => {
        const imageUrl = item.image_urls?.[0];

        if (!imageUrl) return null;

        return (
            <View
                style={styles.gridItem}
                onTouchEnd={() => handlePostPress(item.id)}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
        );
    };

    return (
        <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 1,
    },
    row: {
        gap: 1,
        marginBottom: 1,
    },
    gridItem: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        backgroundColor: Colors.light.border,
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
