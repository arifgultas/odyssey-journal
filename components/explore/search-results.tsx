import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface SearchResultsProps {
    searchLoading: boolean;
    searchResults: any;
    vintageTheme: any;
    t: (key: string) => string;
    onLocationPress: (locationName: string) => void;
    onUserPress: (userId: string) => void;
}

export function SearchResults({
    searchLoading,
    searchResults,
    vintageTheme,
    t,
    onLocationPress,
    onUserPress,
}: SearchResultsProps) {
    if (searchLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: vintageTheme.background }]}>
                <ActivityIndicator size="large" color={vintageTheme.primary} />
            </View>
        );
    }

    if (!searchResults) return null;

    const hasResults = searchResults.locations.length > 0 || searchResults.users.length > 0;

    if (!hasResults) {
        return (
            <View style={[styles.emptyState, { backgroundColor: vintageTheme.background }]}>
                <Ionicons name="search-outline" size={64} color={vintageTheme.border} />
                <Text style={[styles.emptyText, { color: vintageTheme.textSecondary }]}>{t('explore.noResults')}</Text>
                <Text style={[styles.emptySubtext, { color: vintageTheme.textMuted }]}>{t('explore.tryDifferent')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.searchResults}>
            {searchResults.locations.length > 0 && (
                <View style={styles.resultSection}>
                    <Text style={[styles.resultTitle, { color: vintageTheme.text }]}>{t('explore.locations')}</Text>
                    {searchResults.locations.map((loc: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.resultItem, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
                            onPress={() => onLocationPress(loc.name)}
                            accessibilityRole="button"
                            accessibilityLabel={`${loc.name}, ${loc.postCount} gönderi, lokasyon gönderilerini gör`}
                        >
                            <View style={[styles.resultIcon, { backgroundColor: vintageTheme.parchment }]}>
                                <Ionicons name="location" size={20} color={vintageTheme.compassBlue} />
                            </View>
                            <View style={styles.resultInfo}>
                                <Text style={[styles.resultName, { color: vintageTheme.text }]}>{loc.name}</Text>
                                <Text style={[styles.resultMeta, { color: vintageTheme.textMuted }]}>{loc.postCount} {t('explore.posts')}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {searchResults.users.length > 0 && (
                <View style={styles.resultSection}>
                    <Text style={[styles.resultTitle, { color: vintageTheme.text }]}>{t('explore.users')}</Text>
                    {searchResults.users.map((user: any) => (
                        <TouchableOpacity
                            key={user.id}
                            style={[styles.resultItem, { backgroundColor: vintageTheme.surface, borderColor: vintageTheme.border }]}
                            onPress={() => onUserPress(user.id)}
                            accessibilityRole="button"
                            accessibilityLabel={`${user.full_name || user.username}, profile git`}
                        >
                            <View style={styles.resultAvatarContainer}>
                                {user.avatar_url ? (
                                    <Image
                                        source={{ uri: user.avatar_url }}
                                        style={styles.resultAvatar}
                                        contentFit="cover"
                                        accessible={true}
                                        accessibilityLabel={user.full_name || user.username}
                                    />
                                ) : (
                                    <View style={[styles.resultAvatarPlaceholder, { backgroundColor: vintageTheme.parchment }]}>
                                        <Ionicons name="person" size={18} color={vintageTheme.textMuted} />
                                    </View>
                                )}
                            </View>
                            <View style={styles.resultInfo}>
                                <Text style={[styles.resultName, { color: vintageTheme.text }]}>{user.full_name || user.username}</Text>
                                <Text style={[styles.resultMeta, { color: vintageTheme.textMuted }]}>@{user.username}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    searchResults: {
        padding: 20,
        gap: 24,
    },
    resultSection: {
        gap: 12,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    resultIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultInfo: {
        flex: 1,
        marginLeft: 14,
    },
    resultName: {
        fontSize: 15,
        fontWeight: '600',
    },
    resultMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    resultAvatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    resultAvatar: {
        width: '100%',
        height: '100%',
    },
    resultAvatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
