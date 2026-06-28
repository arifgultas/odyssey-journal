import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, Typography, Shadows } from '@/constants/theme';

interface ProfileCardProps {
    colors: any;
    displayProfile: any;
    user: any;
    t: (key: string) => string;
    onEditPress: () => void;
}

export function ProfileCard({
    colors,
    displayProfile,
    user,
    t,
    onEditPress,
}: ProfileCardProps) {
    return (
        <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.accent }]}
        >
            {/* Corner Decorations */}
            <View style={[styles.cornerDecoration, styles.cornerTopLeft, { borderColor: colors.accent }]} />
            <View style={[styles.cornerDecoration, styles.cornerTopRight, { borderColor: colors.accent }]} />
            <View style={[styles.cornerDecoration, styles.cornerBottomLeft, { borderColor: colors.accent }]} />
            <View style={[styles.cornerDecoration, styles.cornerBottomRight, { borderColor: colors.accent }]} />

            <View style={styles.profileContent}>
                <Text style={[styles.profileSectionLabel, { color: colors.accent, borderBottomColor: colors.border }]}>
                    {t('settings.passportHolder')}
                </Text>

                {/* Avatar */}
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={onEditPress}
                    accessibilityRole="button"
                    accessibilityLabel={t('profile.editProfile') || 'Profil düzenle'}
                >
                    <View style={[styles.avatarFrame, { borderColor: colors.accent }]}>
                        {displayProfile.avatar_url ? (
                            <Image
                                source={{ uri: displayProfile.avatar_url }}
                                style={styles.avatarImage}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.sectionBg }]}>
                                <Ionicons name="person" size={40} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>
                    <View style={[styles.editAvatarButton, { backgroundColor: colors.textPrimary, borderColor: colors.background }]}>
                        <Ionicons name="create" size={12} color={colors.accent} />
                    </View>
                </TouchableOpacity>

                {/* Name & Email */}
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                        {displayProfile.full_name}
                    </Text>
                    <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                        {user?.email}
                    </Text>
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity
                    style={[styles.editProfileButton, { borderBottomColor: colors.accent }]}
                    onPress={onEditPress}
                    accessibilityRole="button"
                    accessibilityLabel={t('profile.editProfile') || 'Profil düzenle'}
                >
                    <Text style={[styles.editProfileButtonText, { color: colors.accent }]}>
                        {t('profile.editProfile')}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        width: '100%',
        alignSelf: 'stretch',
        borderRadius: 24,
        borderWidth: 1,
        padding: 4,
        position: 'relative',
        overflow: 'hidden',
        ...Shadows.lg,
        elevation: 0,
    },
    cornerDecoration: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderWidth: 2,
    },
    cornerTopLeft: {
        top: 8,
        left: 8,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 12,
    },
    cornerTopRight: {
        top: 8,
        right: 8,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 12,
    },
    cornerBottomLeft: {
        bottom: 8,
        left: 8,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 12,
    },
    cornerBottomRight: {
        bottom: 8,
        right: 8,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 12,
    },
    profileContent: {
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.md,
    },
    profileSectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        paddingBottom: 4,
        width: '100%',
        textAlign: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarFrame: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        overflow: 'hidden',
        ...Shadows.md,
        elevation: 0,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
        elevation: 0,
    },
    profileInfo: {
        alignItems: 'center',
        gap: 4,
    },
    profileName: {
        fontSize: 24,
        fontFamily: Typography.fonts.heading,
    },
    profileEmail: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    editProfileButton: {
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        paddingBottom: 2,
        marginTop: Spacing.sm,
    },
    editProfileButtonText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
