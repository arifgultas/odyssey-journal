import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/theme';

interface SettingsRowProps {
    label: string;
    description?: string;
    onPress?: () => void;
    colors: any;
    rightElement?: React.ReactNode;
}

export function SettingsRow({
    label,
    description,
    onPress,
    colors,
    rightElement,
}: SettingsRowProps) {
    const Component = onPress ? TouchableOpacity : View;

    return (
        <Component
            style={styles.settingRow}
            {...(onPress && {
                onPress,
                activeOpacity: 0.7,
                accessibilityRole: 'button',
            })}
            accessibilityLabel={`${label}, ${description || ''}`}
        >
            <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
                {description && (
                    <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>{description}</Text>
                )}
            </View>
            {rightElement !== undefined ? rightElement : (
                onPress && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            )}
        </Component>
    );
}

const styles = StyleSheet.create({
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm + 2,
    },
    settingInfo: {
        flex: 1,
        marginRight: Spacing.md,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    settingSubLabel: {
        fontSize: 12,
        marginTop: 2,
    },
});
