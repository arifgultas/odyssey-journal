import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/context/language-context';
import { Colors, Spacing, Typography, Shadows } from '@/constants/theme';
import { getConversations, Conversation } from '@/lib/chat';

// Google Stitch Design Colors
const DesignColors = {
    light: {
        background: '#F5F1E8',
        surface: '#FFFFFF',
        primary: '#d4aa73',
        textMain: '#2C1810',
        textMuted: '#8B7355',
        border: 'rgba(212, 170, 115, 0.2)',
        parchment: '#E8DCC8',
    },
    dark: {
        background: '#2C1810',
        surface: '#3E2723',
        primary: '#d4aa73',
        textMain: '#F5F1E8',
        textMuted: '#d4aa73',
        border: 'rgba(245, 241, 232, 0.1)',
        parchment: '#3E2723',
    },
};

export default function ChatListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, language } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'primary' | 'requests'>('primary');

    const loadConversations = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const list = await getConversations();
            setConversations(list);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadConversations(true);
        }, [])
    );

    const requestsCount = conversations.filter(c => !c.isApproved).length;

    useEffect(() => {
        if (requestsCount === 0 && activeTab === 'requests') {
            setActiveTab('primary');
        }
    }, [requestsCount, activeTab]);

    const filteredConversations = conversations.filter(c => 
        activeTab === 'primary' ? c.isApproved : !c.isApproved
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadConversations(true);
    };

    const handleConversationPress = (userId: string) => {
        router.push({
            pathname: '/chat/[id]' as any,
            params: { id: userId }
        });
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return language === 'tr' ? 'Dün' : 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString(language, { weekday: 'short' });
        } else {
            return date.toLocaleDateString(language, { month: 'short', day: 'numeric' });
        }
    };

    const renderItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handleConversationPress(item.otherUserId)}
            activeOpacity={0.8}
        >
            <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
                {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2C1810' : '#F5F1E8' }]}>
                        <Ionicons name="person" size={20} color={theme.textMuted} />
                    </View>
                )}
            </View>

            <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.fullName, { color: theme.textMain }]} numberOfLines={1}>
                        {item.fullName || item.username || 'Traveler'}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.textMuted }]}>
                        {formatMessageTime(item.lastMessageAt)}
                    </Text>
                </View>

                <View style={styles.itemFooter}>
                    <Text
                        style={[
                            styles.messageText,
                            { color: theme.textMuted },
                            item.unreadCount > 0 && { fontFamily: Typography.fonts.uiBold, color: theme.textMain }
                        ]}
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </Text>

                    {item.unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                            <Text style={styles.badgeText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { borderColor: `${theme.primary}50` }]}>
                <Ionicons 
                    name={activeTab === 'primary' ? "chatbubbles-outline" : "mail-open-outline"} 
                    size={48} 
                    color={theme.primary} 
                />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
                {activeTab === 'primary' ? t('chat.noConversations') : t('chat.noRequests')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                {activeTab === 'primary' ? t('chat.startConversation') : ''}
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
                    {t('chat.title')}
                </Text>
                
                <View style={styles.headerButton} />
            </View>

            {/* Tabs */}
            {requestsCount > 0 && (
                <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity 
                        style={[
                            styles.tabButton, 
                            activeTab === 'primary' && [styles.tabButtonActive, { borderBottomColor: theme.primary }]
                        ]}
                        onPress={() => setActiveTab('primary')}
                    >
                        <Text style={[
                            styles.tabText, 
                            { color: theme.textMuted },
                            activeTab === 'primary' && [styles.tabTextActive, { color: theme.textMain }]
                        ]}>
                            {t('chat.primaryInbox')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.tabButton, 
                            activeTab === 'requests' && [styles.tabButtonActive, { borderBottomColor: theme.primary }]
                        ]}
                        onPress={() => setActiveTab('requests')}
                    >
                        <View style={styles.tabWithBadge}>
                            <Text style={[
                                styles.tabText, 
                                { color: theme.textMuted },
                                activeTab === 'requests' && [styles.tabTextActive, { color: theme.textMain }]
                            ]}>
                                {t('chat.requests')}
                            </Text>
                            <View style={[styles.tabBadge, { backgroundColor: theme.primary }]}>
                                <Text style={styles.tabBadgeText}>{requestsCount}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    keyExtractor={(item) => item.otherUserId}
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
        fontSize: 22,
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
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fullName: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 15,
        flex: 1,
        marginRight: Spacing.sm,
    },
    timeText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    messageText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 13,
        flex: 1,
        marginRight: Spacing.md,
    },
    badge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 10,
        color: '#2C1810',
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
        fontSize: 20,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm + 2,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        // borderBottomColor is set dynamically in component
    },
    tabText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
    },
    tabTextActive: {
        // color is set dynamically
    },
    tabWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabBadge: {
        marginLeft: 6,
        paddingHorizontal: 6,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 16,
    },
    tabBadgeText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 9,
        color: '#2C1810',
    },
});
