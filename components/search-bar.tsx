import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    autoFocus?: boolean;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search locations, users...',
    onClear,
    onFocus,
    onBlur,
    autoFocus = false,
}: SearchBarProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.icon} />
            <TextInput
                style={[styles.input, { color: theme.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                onFocus={onFocus}
                onBlur={onBlur}
                autoFocus={autoFocus}
                autoCapitalize="none"
                autoCorrect={false}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
        paddingVertical: 0,
    },
    clearButton: {
        padding: Spacing.xs,
    },
});
