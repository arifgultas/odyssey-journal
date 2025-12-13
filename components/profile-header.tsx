import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import type { Profile } from '@/lib/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
    profile: Profile;
    isCurrentUser?: boolean;
    isFollowing?: boolean;
    onEditPress?: () => void;
    onFollowPress?: () => void;
    isFollowLoading?: boolean;
}

export function ProfileHeader({
    profile,
    isCurrentUser = false,
    isFollowing = false,
    onEditPress,
    onFollowPress,
    isFollowLoading = false,
}: ProfileHeaderProps) {
    return (
        <View style={styles.container}>
            {/* Leather-inspired gradient background */}
            <LinearGradient
                colors={[Colors.light.surface, Colors.light.background, Colors.light.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            >
                {/* Avatar with premium border */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarOuterBorder}>
                        <View style={styles.avatarInnerBorder}>
                            {profile.avatar_url ? (
                                <Image
                                    key={profile.avatar_url}
                                    source={{ uri: profile.avatar_url }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                    transition={200}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {profile.full_name?.charAt(0).toUpperCase() ||
                                            profile.username?.charAt(0).toUpperCase() ||
                                            'U'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* User Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.fullName}>
                        {profile.full_name || 'Traveler'}
                    </Text>
                    {profile.username && (
                        <Text style={styles.username}>@{profile.username}</Text>
                    )}
                    {profile.bio && (
                        <Text style={styles.bio}>{profile.bio}</Text>
                    )}
                    {profile.website && (
                        <TouchableOpacity style={styles.websiteContainer}>
                            <Ionicons name="link-outline" size={16} color={Colors.light.compass} />
                            <Text style={styles.website}>{profile.website}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Action Button */}
                {isCurrentUser ? (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={onEditPress}
                    >
                        <Ionicons name="create-outline" size={18} color={Colors.light.surface} />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.followButton,
                            isFollowing && styles.followingButton
                        ]}
                        onPress={onFollowPress}
                        disabled={isFollowLoading}
                    >
                        {isFollowLoading ? (
                            <ActivityIndicator size="small" color={isFollowing ? Colors.light.primary : Colors.light.surface} />
                        ) : (
                            <>
                                <Ionicons
                                    name={isFollowing ? "checkmark-outline" : "person-add-outline"}
                                    size={18}
                                    color={isFollowing ? Colors.light.primary : Colors.light.surface}
                                />
                                <Text style={[
                                    styles.followButtonText,
                                    isFollowing && styles.followingButtonText
                                ]}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
    },
    gradientBackground: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
    },
    // Premium Avatar Section
    avatarSection: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    avatarOuterBorder: {
        padding: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.accent,
        ...Shadows.md,
    },
    avatarInnerBorder: {
        padding: 3,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.surface,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: Colors.light.accent,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    avatarText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 44,
        color: Colors.light.surface,
    },
    // User Info Section
    infoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    fullName: {
        fontFamily: Typography.fonts.heading,
        fontSize: 28,
        color: Colors.light.text,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    username: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
    },
    bio: {
        fontFamily: Typography.fonts.body,
        fontSize: 15,
        color: Colors.light.text,
        textAlign: 'center',
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
        lineHeight: 22,
    },
    websiteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        gap: 6,
    },
    website: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.compass,
        textDecorationLine: 'underline',
    },
    // Action Buttons
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 12,
        paddingHorizontal: Spacing.xl,
        gap: 8,
        ...Shadows.sm,
    },
    editButtonText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.surface,
        letterSpacing: 0.3,
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 12,
        paddingHorizontal: Spacing.xl,
        gap: 8,
        ...Shadows.sm,
    },
    followingButton: {
        backgroundColor: Colors.light.surface,
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    followButtonText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.surface,
        letterSpacing: 0.3,
    },
    followingButtonText: {
        color: Colors.light.primary,
    },
});
