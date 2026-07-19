import { supabase } from './supabase';
import { captureError } from './sentry';

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    deleted_by?: string[];
}

export interface Conversation {
    otherUserId: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    isApproved: boolean;
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

        // Auto approve this user since we sent them a message
        await approveConversation(receiverId);

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

        // Filter out messages deleted by the current user
        const messages = (data || []).filter((msg: any) => !msg.deleted_by?.includes(user.id));

        // Mark incoming messages as read and await the database update
        const unreadIds = messages
            .filter((msg) => msg.receiver_id === user.id && !msg.is_read)
            .map((msg) => msg.id);

        if (unreadIds.length > 0) {
            const { error: updateErr } = await supabase
                .from('messages')
                .update({ is_read: true })
                .in('id', unreadIds);

            if (updateErr) {
                console.error('Error marking messages as read:', updateErr);
            }
        }

        return messages;
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

        // Filter out messages deleted by the current user
        const activeMessages = rawMessages.filter(
            (msg: any) => !msg.deleted_by?.includes(user.id)
        );

        if (activeMessages.length === 0) {
            return [];
        }

        // 2. Group by other user ID
        const latestMessagesMap = new Map<string, Message>();
        const unreadCountsMap = new Map<string, number>();

        activeMessages.forEach((msg) => {
            const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            
            // Map the latest message (since activeMessages is sorted desc)
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

        // 4. Batch fetch follow status (Who does current user follow?)
        const { data: followData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id)
            .in('following_id', otherUserIds);
        
        const followedUserIds = new Set((followData || []).map(f => f.following_id));

        // 5. Batch fetch message approvals
        const { data: approvalData } = await supabase
            .from('message_approvals')
            .select('approved_user_id')
            .eq('user_id', user.id)
            .in('approved_user_id', otherUserIds);

        const approvedUserIds = new Set((approvalData || []).map(a => a.approved_user_id));

        // 6. Map profiles and messages to Conversation objects
        const conversations: Conversation[] = (profiles || []).map((profile) => {
            const lastMsgObj = latestMessagesMap.get(profile.id)!;
            
            // A conversation is approved if:
            // - The current user follows the other user
            // - OR the current user initiated/replied (sent at least one message to them)
            // - OR the current user explicitly approved them
            const isFollowing = followedUserIds.has(profile.id);
            const hasSentMessage = rawMessages.some(
                (msg) => msg.sender_id === user.id && msg.receiver_id === profile.id
            );
            const isExplicitlyApproved = approvedUserIds.has(profile.id);

            const isApproved = isFollowing || hasSentMessage || isExplicitlyApproved;

            return {
                otherUserId: profile.id,
                username: profile.username,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
                lastMessage: lastMsgObj.content,
                lastMessageAt: lastMsgObj.created_at,
                unreadCount: unreadCountsMap.get(profile.id) || 0,
                isApproved,
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

/**
 * Get total unread message count for the current user
 */
export async function getUnreadMessageCount(): Promise<number> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return 0;
        }

        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        if (error) {
            throw error;
        }

        return count || 0;
    } catch (error) {
        console.error('Error getting unread message count:', error);
        return 0;
    }
}

/**
 * Check if the current user has approved a conversation with another user
 */
export async function checkChatApproval(otherUserId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // 1. Check if following the user
        const { data: follow } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', otherUserId)
            .maybeSingle();
        
        if (follow) return true;

        // 2. Check if explicitly approved
        const { data: approval } = await supabase
            .from('message_approvals')
            .select('user_id')
            .eq('user_id', user.id)
            .eq('approved_user_id', otherUserId)
            .maybeSingle();

        if (approval) return true;

        // 3. Check if current user has sent any message to this user
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', user.id)
            .eq('receiver_id', otherUserId);

        return (count ?? 0) > 0;
    } catch (error) {
        console.error('Error checking chat approval:', error);
        return false;
    }
}

/**
 * Approve a message request
 */
export async function approveConversation(otherUserId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('message_approvals')
            .upsert({ user_id: user.id, approved_user_id: otherUserId });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error approving conversation:', error);
        return false;
    }
}

/**
 * Decline/Delete a conversation for the current user only (delete for me)
 */
export async function declineConversation(otherUserId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Call the RPC function to handle "delete for me" safely
        const { error } = await supabase.rpc('delete_conversation_for_user', {
            other_user_id: otherUserId,
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error declining conversation:', error);
        return false;
    }
}

