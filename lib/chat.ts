import { supabase } from './supabase';
import { captureError } from './sentry';

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    otherUserId: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

/**
 * Send a direct message to a user
 */
export async function sendMessage(receiverId: string, content: string): Promise<Message> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data: message, error: messageError } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                content: content.trim(),
            })
            .select()
            .single();

        if (messageError) {
            throw messageError;
        }

        return message;
    } catch (error) {
        console.error('Error sending message:', error);
        captureError(error as Error, { context: 'sendMessage', receiverId });
        throw error;
    }
}

/**
 * Fetch chat history with a specific user
 */
export async function getMessages(chatUserId: string, limit: number = 50): Promise<Message[]> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // Fetch messages where user is sender and chatUserId is receiver, or vice versa
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatUserId}),and(sender_id.eq.${chatUserId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) {
            throw error;
        }

        // Mark incoming messages as read in the background
        const unreadIds = (data || [])
            .filter((msg) => msg.receiver_id === user.id && !msg.is_read)
            .map((msg) => msg.id);

        if (unreadIds.length > 0) {
            supabase
                .from('messages')
                .update({ is_read: true })
                .in('id', unreadIds)
                .then(({ error: updateErr }) => {
                    if (updateErr) console.error('Error marking messages as read:', updateErr);
                });
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching messages:', error);
        captureError(error as Error, { context: 'getMessages', chatUserId });
        throw error;
    }
}

/**
 * Fetch all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // 1. Fetch latest 200 messages for this user to identify active conversations
        const { data: rawMessages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(200);

        if (msgError) {
            throw msgError;
        }

        if (!rawMessages || rawMessages.length === 0) {
            return [];
        }

        // 2. Group by other user ID
        const latestMessagesMap = new Map<string, Message>();
        const unreadCountsMap = new Map<string, number>();

        rawMessages.forEach((msg) => {
            const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            
            // Map the latest message (since rawMessages is sorted desc)
            if (!latestMessagesMap.has(otherId)) {
                latestMessagesMap.set(otherId, msg);
            }

            // Calculate unread count for incoming messages
            if (msg.receiver_id === user.id && !msg.is_read) {
                unreadCountsMap.set(otherId, (unreadCountsMap.get(otherId) || 0) + 1);
            }
        });

        const otherUserIds = Array.from(latestMessagesMap.keys());

        // 3. Fetch profiles of other users
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', otherUserIds);

        if (profileError) {
            throw profileError;
        }

        // 4. Map profiles and messages to Conversation objects
        const conversations: Conversation[] = (profiles || []).map((profile) => {
            const lastMsgObj = latestMessagesMap.get(profile.id)!;
            return {
                otherUserId: profile.id,
                username: profile.username,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
                lastMessage: lastMsgObj.content,
                lastMessageAt: lastMsgObj.created_at,
                unreadCount: unreadCountsMap.get(profile.id) || 0,
            };
        });

        // Sort by last message date descending
        return conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    } catch (error) {
        console.error('Error fetching conversations:', error);
        captureError(error as Error, { context: 'getConversations' });
        throw error;
    }
}

/**
 * Subscribe to realtime message updates for a conversation
 */
export function subscribeToMessages(
    chatUserId: string,
    onMessage: (message: Message) => void
): () => void {
    // Subscribe to INSERT events on messages table
    const channel = supabase
        .channel(`chat-room-${chatUserId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            },
            (payload) => {
                const newMsg = payload.new as Message;
                // Only trigger if the message belongs to this specific conversation
                if (
                    (newMsg.sender_id === chatUserId) || 
                    (newMsg.receiver_id === chatUserId)
                ) {
                    onMessage(newMsg);
                }
            }
        )
        .subscribe();

    // Return unsubscriber function
    return () => {
        supabase.removeChannel(channel);
    };
}
