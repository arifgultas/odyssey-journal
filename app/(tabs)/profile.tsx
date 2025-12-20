import { EditProfileModal } from '@/components/edit-profile-modal';
import { ProfileHeader } from '@/components/profile-header';
import { ProfileStatsBar } from '@/components/profile-stats-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrentProfile, useProfileStats, useUserPosts } from '@/hooks/use-profile';
import type { Post } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 2;

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useCurrentProfile();
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useProfileStats(user?.id || null);
    const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useUserPosts(user?.id || null);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            refetchProfile(),
            refetchStats(),
            refetchPosts(),
        ]);
        setRefreshing(false);
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: signOut,
                },
            ]
        );
    };

    const handleFollowersPress = () => {
        if (user?.id) {
            router.push(`/followers/${user.id}`);
        }
    };

    const handleFollowingPress = () => {
        if (user?.id) {
            router.push(`/following/${user.id}`);
        }
    };


    const handleEditSuccess = async () => {
        console.log('Edit success callback - refreshing profile...');
        // Force immediate refresh
        await Promise.all([
            refetchProfile(),
            refetchStats(),
        ]);
        console.log('Profile refreshed');
    };

    const handlePostPress = (postId: string) => {
        router.push(`/post-detail/${postId}`);
    };

    if (profileLoading || !profile) {
        return (
            <ThemedView style={[styles.loadingContainer]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    const renderHeader = () => (
        <>
            <ProfileHeader
                profile={profile}
                isCurrentUser={true}
                onEditPress={() => setEditModalVisible(true)}
            />

            {statsLoading ? (
                <View style={styles.statsLoading}>
                    <ActivityIndicator size="small" color={theme.primary} />
                </View>
            ) : stats ? (
                <View style={styles.statsContainer}>
                    <ProfileStatsBar
                        stats={stats}
                        onFollowersPress={handleFollowersPress}
                        onFollowingPress={handleFollowingPress}
                    />
                </View>
            ) : null}

            <View style={[styles.gridHeader, { borderColor: theme.border }]}>
                <Ionicons name="grid-outline" size={20} color={theme.text} />
                <ThemedText style={styles.gridTitle}>Travel History</ThemedText>
            </View>
        </>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={theme.border} />
            <ThemedText style={styles.emptyText}>No posts yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Share your travel experiences!</ThemedText>
        </View>
    );

    const renderGridItem = ({ item, index }: { item: Post; index: number }) => {
        const imageUrl = item.images?.[0];
        const col = index % 3;

        return (
            <TouchableOpacity
                style={[
                    styles.gridItem,
                    col === 0 && styles.gridItemLeft,
                    col === 2 && styles.gridItemRight,
                ]}
                onPress={() => handlePostPress(item.id)}
            >
                <View style={[styles.gridImagePlaceholder, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Ionicons name="image-outline" size={40} color={theme.border} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.md, borderBottomColor: theme.border }]}>
                <ThemedText type="title" style={styles.headerTitle}>Odyssey</ThemedText>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                    <Ionicons name="log-out-outline" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts || []}
                renderItem={renderGridItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={postsLoading ? (
                    <View style={styles.postsLoading}>
                        <ActivityIndicator size="small" color={theme.primary} />
                    </View>
                ) : renderEmpty()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
            />

            {/* Edit Profile Modal */}
            {profile && (
                <EditProfileModal
                    visible={editModalVisible}
                    profile={profile}
                    onClose={() => setEditModalVisible(false)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </ThemedView>
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
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
    },
    logoutIcon: {
        padding: Spacing.sm,
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    statsLoading: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
    gridSection: {
        marginTop: Spacing.md,
    },
    gridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.surface,
    },
    gridTitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
    },
    flatListContent: {
        flexGrow: 1,
    },
    gridItem: {
        flex: 1,
        aspectRatio: 1,
        padding: 1,
    },
    gridItemLeft: {
        paddingLeft: 0,
    },
    gridItemRight: {
        paddingRight: 0,
    },
    gridImagePlaceholder: {
        flex: 1,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    postsLoading: {
        paddingVertical: Spacing.xxl,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
        paddingHorizontal: Spacing.xl,
    },
    emptyText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        color: Colors.light.textSecondary,
        marginTop: Spacing.md,
    },
    emptySubtext: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: Spacing.sm,
    },
});
