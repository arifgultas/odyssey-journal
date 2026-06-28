import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface SuggestedUsersProps {
    suggestedUsers: any[] | undefined;
    suggestedUsersLoading: boolean;
    suggestedUsersError: boolean;
    vintageTheme: any;
    t: (key: string) => string;
    followMutationPending: boolean;
    refetch: () => void;
    onUserPress: (userId: string) => void;
    onFollowPress: (userId: string, isFollowing: boolean) => void;
}

export function SuggestedUsers({
    suggestedUsers,
    suggestedUsersLoading,
    suggestedUsersError,
    vintageTheme,
    t,
    followMutationPending,
    refetch,
    onUserPress,
    onFollowPress,
}: SuggestedUsersProps) {
    const getUserLabel = (user: any): string => {
        const labels = ['Doğa Sever', 'Şehir Kaşifi', 'Tarihçi', 'Fotoğrafçı', 'Gezgin'];
        const index = user.id.charCodeAt(0) % labels.length;
        return labels[index];
    };

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: vintageTheme.text }]}>{t('explore.suggestedTravelers')}</Text>

            {suggestedUsersLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={vintageTheme.primary} />
                    <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted }]}>{t('explore.loading')}</Text>
                </View>
            ) : suggestedUsersError ? (
                <TouchableOpacity style={styles.errorContainer} onPress={refetch} accessibilityRole="button">
                    <Ionicons name="alert-circle-outline" size={40} color={vintageTheme.border} />
                    <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted }]}>{t('explore.loadFailed')}</Text>
                </TouchableOpacity>
            ) : !suggestedUsers || suggestedUsers.length === 0 ? (
                <TouchableOpacity style={styles.errorContainer} onPress={refetch} accessibilityRole="button">
                    <Ionicons name="people-outline" size={40} color={vintageTheme.border} />
                    <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted }]}>{t('explore.noSuggestionsYet')}</Text>
                </TouchableOpacity>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.usersScroll}
                >
                    {suggestedUsers.slice(0, 5).map((user: any) => (
                        <View
                            key={user.id}
                            style={[styles.userCard, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
                        >
                            <TouchableOpacity
                                style={styles.userCardClickable}
                                onPress={() => onUserPress(user.id)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={`${user.full_name || user.username}, profile git`}
                            >
                                <View style={[styles.userAvatarContainer, { borderColor: vintageTheme.border }]}>
                                    {user.avatar_url ? (
                                        <Image
                                            source={{ uri: user.avatar_url }}
                                            style={styles.userAvatar}
                                            contentFit="cover"
                                            accessible={true}
                                            accessibilityLabel={user.full_name || user.username}
                                        />
                                    ) : (
                                        <View style={[styles.userAvatarPlaceholder, { backgroundColor: vintageTheme.parchment }]}>
                                            <Ionicons name="person" size={28} color={vintageTheme.textMuted} />
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.userName, { color: vintageTheme.text }]} numberOfLines={1}>
                                    {user.full_name?.split(' ')[0] || user.username || t('explore.user')}
                                </Text>
                                <Text style={[styles.userLabel, { color: vintageTheme.textSecondary }]} numberOfLines={1}>
                                    {getUserLabel(user)}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.bookmarkButton} accessibilityRole="button">
                                <Ionicons name="bookmark-outline" size={16} color={vintageTheme.border} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.followButton,
                                    user.isFollowing
                                        ? {
                                            backgroundColor: vintageTheme.surface,
                                            borderWidth: 1,
                                            borderColor: vintageTheme.primary,
                                            elevation: 0,
                                            shadowOpacity: 0,
                                        }
                                        : {
                                            backgroundColor: vintageTheme.primary,
                                        }
                                ]}
                                onPress={() => onFollowPress(user.id, !!user.isFollowing)}
                                disabled={followMutationPending}
                                accessibilityRole="button"
                                accessibilityLabel={user.isFollowing ? t('follow.following') : t('explore.follow')}
                                accessibilityState={{ selected: !!user.isFollowing }}
                            >
                                {followMutationPending ? (
                                    <ActivityIndicator size="small" color={user.isFollowing ? vintageTheme.primary : "white"} />
                                ) : (
                                    <>
                                        <Ionicons
                                            name={user.isFollowing ? "checkmark" : "person-add"}
                                            size={12}
                                            color={user.isFollowing ? vintageTheme.primary : "white"}
                                        />
                                        <Text
                                            style={[
                                                styles.followButtonText,
                                                user.isFollowing ? { color: vintageTheme.primary } : { color: "white" }
                                            ]}
                                        >
                                            {user.isFollowing ? t('follow.following') : t('explore.follow')}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptySubtext: {
        fontSize: 13,
    },
    usersScroll: {
        paddingRight: 20,
        gap: 12,
    },
    userCard: {
        width: 130,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        position: 'relative',
    },
    userCardClickable: {
        alignItems: 'center',
        width: '100%',
    },
    userAvatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    userAvatar: {
        width: '100%',
        height: '100%',
    },
    userAvatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 2,
    },
    userLabel: {
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 12,
    },
    bookmarkButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        width: '100%',
    },
    followButtonText: {
        fontSize: 11,
        fontWeight: '700',
    },
});
