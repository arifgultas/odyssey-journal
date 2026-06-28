import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/context/language-context';
import { Colors, Spacing, Typography, Shadows } from '@/constants/theme';
import { getMessages, sendMessage, subscribeToMessages, Message } from '@/lib/chat';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';

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
        myBubble: '#EBDCB9', // Warm gold-parchment for current user bubbles
        theirBubble: '#FFFFFF', // Clean white for other user bubbles
    },
    dark: {
        background: '#2C1810',
        surface: '#3E2723',
        primary: '#d4aa73',
        textMain: '#F5F1E8',
        textMuted: '#d4aa73',
        border: 'rgba(245, 241, 232, 0.1)',
        parchment: '#3E2723',
        myBubble: '#4E3629', // Dark brown-parchment for current user bubbles
        theirBubble: '#3E2723', // Dark surface for other user bubbles
    },
};

export default function ChatRoomScreen() {
    const router = useRouter();
    const { id: chatUserId } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { t, language } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;

    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const { data: profile } = useProfile(chatUserId);

    useEffect(() => {
        loadCurrentUser();
        loadChatHistory();
    }, [chatUserId]);

    useEffect(() => {
        if (!chatUserId) return;

        // Subscribe to real-time message updates
        const unsubscribe = subscribeToMessages(chatUserId, (newMsg) => {
            setMessages((prev) => {
                // Avoid duplicating messages that might have already been added optimistically
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        return () => {
            unsubscribe();
        };
    }, [chatUserId]);

    const loadCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
        }
    };

    const loadChatHistory = async () => {
        setIsLoading(true);
        try {
            const history = await getMessages(chatUserId);
            setMessages(history);
            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 200);
        } catch (error) {
            console.error('Error loading chat history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || isSending) return;

        const content = inputText.trim();
        setInputText('');
        setIsSending(true);

        try {
            // Optimistic update
            const tempId = `temp-${Date.now()}`;
            const tempMsg: Message = {
                id: tempId,
                sender_id: currentUserId || '',
                receiver_id: chatUserId,
                content,
                is_read: false,
                created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, tempMsg]);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            const savedMsg = await sendMessage(chatUserId, content);
            
            // Replace optimistic message with actual DB message
            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? savedMsg : m))
            );
        } catch (error) {
            console.error('Error sending message:', error);
            // Put text back in input on error
            setInputText(content);
        } finally {
            setIsSending(false);
        }
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessageItem = ({ item }: { item: Message }) => {
        const isMyMessage = item.sender_id === currentUserId;
        const bubbleBg = isMyMessage ? theme.myBubble : theme.theirBubble;
        const align = isMyMessage ? 'flex-end' as const : 'flex-start' as const;
        const fontColor = theme.textMain;

        return (
            <View style={[styles.messageRow, { alignSelf: align }]}>
                <View
                    style={[
                        styles.bubble,
                        {
                            backgroundColor: bubbleBg,
                            borderColor: theme.border,
                        },
                        isMyMessage ? styles.myBubbleCorners : styles.theirBubbleCorners
                    ]}
                >
                    <Text style={[styles.messageContent, { color: fontColor }]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.bubbleTime, { color: theme.textMuted }]}>
                        {formatMessageTime(item.created_at)}
                    </Text>
                </View>
            </View>
        );
    };

    const handleProfilePress = () => {
        router.push(`/user-profile/${chatUserId}`);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
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

                <TouchableOpacity onPress={handleProfilePress} style={styles.headerUserInfo} activeOpacity={0.7}>
                    <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2C1810' : '#F5F1E8' }]}>
                                <Ionicons name="person" size={16} color={theme.textMuted} />
                            </View>
                        )}
                    </View>
                    <View style={styles.headerUserText}>
                        <Text style={[styles.userNameText, { color: theme.textMain }]} numberOfLines={1}>
                            {profile?.full_name || profile?.username || 'Traveler'}
                        </Text>
                        <Text style={[styles.userHandleText, { color: theme.textMuted }]} numberOfLines={1}>
                            @{profile?.username || 'traveler'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleProfilePress} style={styles.headerButton}>
                    <Ionicons name="card-outline" size={26} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessageItem}
                    contentContainerStyle={[styles.messagesList, { paddingBottom: Spacing.md }]}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Input Bar */}
            <View style={[
                styles.inputBar,
                {
                    paddingBottom: Math.max(insets.bottom, Spacing.md),
                    borderTopColor: `${theme.primary}20`,
                    backgroundColor: isDark ? '#2C1810' : '#F5F1E8',
                }
            ]}>
                <View style={[
                    styles.textInputWrapper,
                    {
                        backgroundColor: isDark ? '#3d261a' : '#FFFFFF',
                        borderColor: theme.border,
                    }
                ]}>
                    <TextInput
                        style={[styles.textInput, { color: theme.textMain }]}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder={t('chat.typeMessage')}
                        placeholderTextColor={theme.textMuted}
                        multiline
                        maxLength={1000}
                    />

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor: inputText.trim() ? theme.primary : 'transparent',
                            }
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isSending}
                    >
                        <Ionicons
                            name="paper-plane"
                            size={18}
                            color={inputText.trim() ? '#2C1810' : theme.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
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
        zIndex: 10,
    },
    headerButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerUserInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.sm,
    },
    avatarRing: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerUserText: {
        marginLeft: Spacing.sm,
        flex: 1,
    },
    userNameText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
    },
    userHandleText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 11,
        marginTop: 1,
    },
    messagesList: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
    },
    messageRow: {
        maxWidth: '80%',
        marginBottom: Spacing.sm,
    },
    bubble: {
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderRadius: 16,
        ...Shadows.sm,
    },
    myBubbleCorners: {
        borderBottomRightRadius: 2,
    },
    theirBubbleCorners: {
        borderBottomLeftRadius: 2,
    },
    messageContent: {
        fontFamily: Typography.fonts.ui,
        fontSize: 14,
        lineHeight: 20,
    },
    bubbleTime: {
        fontFamily: Typography.fonts.ui,
        fontSize: 9,
        textAlign: 'right',
        marginTop: 4,
        opacity: 0.6,
    },
    inputBar: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
    },
    textInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    },
    textInput: {
        flex: 1,
        fontFamily: Typography.fonts.ui,
        fontSize: 14,
        maxHeight: 100,
        marginRight: Spacing.sm,
        paddingTop: Platform.OS === 'ios' ? 4 : 0,
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
