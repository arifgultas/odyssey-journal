import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import type { Category } from '@/lib/types/categories';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryCardProps {
    category: Category;
    onPress?: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: category.color + '15' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.name}>{category.name}</Text>
            {category.postCount !== undefined && (
                <Text style={styles.count}>{category.postCount} posts</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginRight: Spacing.sm,
        ...Shadows.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    name: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 13,
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: 2,
    },
    count: {
        fontFamily: Typography.fonts.body,
        fontSize: 11,
        color: '#718096',
        textAlign: 'center',
    },
});
