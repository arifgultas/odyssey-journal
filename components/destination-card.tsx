import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DestinationCardProps {
    name: string;
    postCount: number;
    imageUrl?: string;
    onPress?: () => void;
}

export function DestinationCard({ name, postCount, imageUrl, onPress }: DestinationCardProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {imageUrl ? (
                <ImageBackground
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    imageStyle={styles.imageStyle}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.gradient}
                    >
                        <View style={styles.content}>
                            <Text style={styles.name} numberOfLines={2}>
                                {name}
                            </Text>
                            <View style={styles.meta}>
                                <Ionicons name="images-outline" size={14} color="#FFFFFF" />
                                <Text style={styles.postCount}>{postCount} posts</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            ) : (
                <View style={[styles.image, styles.placeholderContainer]}>
                    <Ionicons name="location" size={40} color={Colors.light.border} />
                    <View style={styles.content}>
                        <Text style={[styles.name, styles.placeholderText]} numberOfLines={2}>
                            {name}
                        </Text>
                        <View style={styles.meta}>
                            <Ionicons name="images-outline" size={14} color={Colors.light.textSecondary} />
                            <Text style={[styles.postCount, styles.placeholderText]}>{postCount} posts</Text>
                        </View>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 250,
        marginRight: Spacing.md,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageStyle: {
        borderRadius: BorderRadius.lg,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        padding: Spacing.md,
    },
    name: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postCount: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        color: '#FFFFFF',
    },
    placeholderContainer: {
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    placeholderText: {
        color: Colors.light.text,
    },
});
