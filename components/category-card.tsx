import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Category } from '@/lib/types/categories';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryCardProps {
    category: Category;
    onPress?: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: category.color + '15' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.name, { color: theme.text }]}>{t(`categories.${category.id}`)}</Text>
            {category.postCount !== undefined && (
                <Text style={[styles.count, { color: theme.textSecondary }]}>
                    {t('explore.postCount', { count: category.postCount })}
                </Text>
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
        marginEnd: Spacing.sm,
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
