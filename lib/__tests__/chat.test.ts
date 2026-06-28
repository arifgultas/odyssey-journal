/**
 * Tests for lib/chat.ts
 */

jest.mock('../supabase', () => {
    const mockSingle = jest.fn();
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockOr = jest.fn();
    const mockIn = jest.fn();
    const mockOrder = jest.fn();
    const mockLimit = jest.fn();
    const mockRange = jest.fn();

    const queryBuilder: any = {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
        or: mockOr,
        in: mockIn,
        order: mockOrder,
        limit: mockLimit,
        range: mockRange,
        single: mockSingle,
        then: jest.fn((cb) => Promise.resolve(cb({ error: null }))),
    };

    mockSelect.mockImplementation(() => queryBuilder);
    mockInsert.mockImplementation(() => queryBuilder);
    mockUpdate.mockImplementation(() => queryBuilder);
    mockDelete.mockImplementation(() => queryBuilder);
    mockEq.mockImplementation(() => queryBuilder);
    mockOr.mockImplementation(() => queryBuilder);
    mockIn.mockImplementation(() => queryBuilder);
    mockOrder.mockImplementation(() => queryBuilder);
    mockLimit.mockImplementation(() => queryBuilder);
    mockRange.mockImplementation(() => queryBuilder);

    return {
        supabase: {
            auth: {
                getUser: jest.fn(),
            },
            from: jest.fn(() => queryBuilder),
            channel: jest.fn(() => ({
                on: jest.fn().mockReturnThis(),
                subscribe: jest.fn(),
            })),
            removeChannel: jest.fn(),
        },
    };
});

jest.mock('../sentry', () => ({
    captureError: jest.fn(),
}));

import { sendMessage, getMessages, getConversations } from '../chat';
import { supabase } from '../supabase';

describe('chat service', () => {
    const mockUser = { id: 'user-111' };
    const queryBuilder = supabase.from('messages') as any;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default auth mock
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
    });

    describe('sendMessage', () => {
        it('sends message successfully', async () => {
            const mockMsg = {
                id: 'msg-999',
                sender_id: 'user-111',
                receiver_id: 'user-222',
                content: 'Hello friend',
                is_read: false,
                created_at: new Date().toISOString(),
            };

            queryBuilder.single.mockResolvedValue({ data: mockMsg, error: null });

            const result = await sendMessage('user-222', 'Hello friend');

            expect(supabase.from).toHaveBeenCalledWith('messages');
            expect(queryBuilder.insert).toHaveBeenCalledWith({
                sender_id: 'user-111',
                receiver_id: 'user-222',
                content: 'Hello friend',
            });
            expect(result).toEqual(mockMsg);
        });

        it('throws error when user is not authenticated', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
                error: new Error('Auth error'),
            });

            await expect(sendMessage('user-222', 'test')).rejects.toThrow('User not authenticated');
        });
    });

    describe('getMessages', () => {
        it('fetches chat history successfully', async () => {
            const mockHistory = [
                { id: '1', sender_id: 'user-111', receiver_id: 'user-222', content: 'Hi', is_read: true, created_at: '2026-06-28T12:00:00Z' },
                { id: '2', sender_id: 'user-222', receiver_id: 'user-111', content: 'Hello', is_read: false, created_at: '2026-06-28T12:01:00Z' },
            ];

            queryBuilder.limit.mockResolvedValue({ data: mockHistory, error: null });

            const result = await getMessages('user-222', 20);

            expect(queryBuilder.or).toHaveBeenCalledWith(
                'and(sender_id.eq.user-111,receiver_id.eq.user-222),and(sender_id.eq.user-222,receiver_id.eq.user-111)'
            );
            expect(queryBuilder.limit).toHaveBeenCalledWith(20);
            expect(result).toEqual(mockHistory);
        });
    });

    describe('getConversations', () => {
        it('returns conversation list with profiles and unread states', async () => {
            const mockRawMessages = [
                { id: '2', sender_id: 'user-222', receiver_id: 'user-111', content: 'Hello', is_read: false, created_at: '2026-06-28T12:01:00Z' },
                { id: '1', sender_id: 'user-111', receiver_id: 'user-222', content: 'Hi', is_read: true, created_at: '2026-06-28T12:00:00Z' },
            ];

            const mockProfiles = [
                { id: 'user-222', username: 'alice', full_name: 'Alice', avatar_url: 'alice.jpg' },
            ];

            // First call fetches messages
            queryBuilder.limit.mockResolvedValueOnce({ data: mockRawMessages, error: null });
            
            // Second call (under profiles from() builder) fetches user profiles
            const profileQueryBuilder = supabase.from('profiles') as any;
            profileQueryBuilder.select.mockReturnThis();
            profileQueryBuilder.in.mockResolvedValue({ data: mockProfiles, error: null });

            const conversations = await getConversations();

            expect(conversations.length).toBe(1);
            expect(conversations[0]).toEqual({
                otherUserId: 'user-222',
                username: 'alice',
                fullName: 'Alice',
                avatarUrl: 'alice.jpg',
                lastMessage: 'Hello',
                lastMessageAt: '2026-06-28T12:01:00Z',
                unreadCount: 1,
            });
        });
    });
});
