import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/theme';
import { mirrorIcon } from '@/lib/rtl';

interface SettingsRowProps {
    icon?: any;
    label: string;
    description?: string;
    onPress?: () => void;
    colors: any;
    rightElement?: React.ReactNode;
}

export function SettingsRow({
    icon,
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
            <View style={styles.settingMain}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={22}
                        color={colors.accent || colors.textSecondary}
                        style={styles.settingIcon}
                    />
                )}
                <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
                    {description && (
                        <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>{description}</Text>
                    )}
                </View>
            </View>
            {rightElement !== undefined ? rightElement : (
                onPress && <Ionicons name={mirrorIcon('chevron-forward')} size={20} color={colors.textSecondary} />
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
    settingMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginEnd: Spacing.md,
    },
    settingIcon: {
        marginEnd: Spacing.sm + 4,
    },
    settingInfo: {
        flex: 1,
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
