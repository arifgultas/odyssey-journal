import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/context/language-context';
import { Colors, Spacing, Typography, Shadows } from '@/constants/theme';
import { getBlockedUsersProfiles, unblockUser, BlockedUserProfile } from '@/lib/block';
import { useQueryClient } from '@tanstack/react-query';

// Styling colors matching theme
const DesignColors = {
    light: {
        background: '#F5F1E8',
        surface: '#FFFFFF',
        primary: '#d4aa73',
        textMain: '#2C1810',
        textMuted: '#8B7355',
        border: 'rgba(212, 170, 115, 0.2)',
        stampRed: '#b91c1c',
    },
    dark: {
        background: '#2C1810',
        surface: '#3E2723',
        primary: '#d4aa73',
        textMain: '#F5F1E8',
        textMuted: '#d4aa73',
        border: 'rgba(245, 241, 232, 0.1)',
        stampRed: '#ef4444',
    },
};

export default function BlockedUsersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;
    const queryClient = useQueryClient();

    const [blockedUsers, setBlockedUsers] = useState<BlockedUserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadBlockedUsers = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const list = await getBlockedUsersProfiles();
            setBlockedUsers(list);
        } catch (error) {
            console.error('Error loading blocked users:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadBlockedUsers(true);
    };

    const handleUnblockPress = (user: BlockedUserProfile) => {
        Alert.alert(
            t('settings.unblockConfirmTitle') || 'Unblock User',
            t('settings.unblockConfirmDesc') || `Are you sure you want to unblock ${user.full_name || user.username || 'this user'}?`,
            [
                { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('settings.unblockConfirmTitle') || 'Unblock',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await unblockUser(user.id);
                            if (success) {
                                // Invalidate query caches to refresh search and profiles immediately
                                queryClient.invalidateQueries({ queryKey: ['search'] });
                                queryClient.invalidateQueries({ queryKey: ['profile'] });
                                queryClient.invalidateQueries({ queryKey: ['suggested-users'] });

                                Alert.alert('', t('settings.unblockSuccess') || 'User has been unblocked.');
                                setBlockedUsers((prev) => prev.filter((u) => u.id !== user.id));
                            }
                        } catch (error) {
                            console.error('Error unblocking user:', error);
                            Alert.alert('Error', 'Failed to unblock user.');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: BlockedUserProfile }) => (
        <View style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2C1810' : '#F5F1E8' }]}>
                        <Ionicons name="person" size={18} color={theme.textMuted} />
                    </View>
                )}
            </View>

            <View style={styles.itemContent}>
                <Text style={[styles.fullName, { color: theme.textMain }]} numberOfLines={1}>
                    {item.full_name || 'Traveler'}
                </Text>
                {item.username && (
                    <Text style={[styles.usernameText, { color: theme.textMuted }]} numberOfLines={1}>
                        @{item.username}
                    </Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.unblockButton, { borderColor: theme.stampRed }]}
                onPress={() => handleUnblockPress(item)}
            >
                <Text style={[styles.unblockButtonText, { color: theme.stampRed }]}>
                    {t('settings.unblockConfirmTitle') || 'Unblock'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { borderColor: `${theme.primary}50` }]}>
                <Ionicons name="ban-outline" size={48} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
                {t('settings.noBlockedUsers') || 'No blocked users.'}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + Spacing.xs,
                    backgroundColor: isDark ? 'rgba(44, 24, 16, 0.95)' : 'rgba(245, 241, 232, 0.95)',
                    borderBottomColor: `${theme.primary}20`,
                }
            ]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={28} color={theme.primary} />
                </TouchableOpacity>
                
                <Text style={[styles.headerTitle, { color: theme.textMain }]}>
                    {t('settings.blockedUsers') || 'Blocked Users'}
                </Text>
                
                <View style={styles.headerButton} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing.lg }]}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        letterSpacing: 0.5,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        ...Shadows.sm,
    },
    avatarRing: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
        marginLeft: Spacing.md,
        marginRight: Spacing.sm,
    },
    fullName: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
    },
    usernameText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
        marginTop: 2,
    },
    unblockButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    unblockButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: Spacing.xl,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        textAlign: 'center',
    },
});
