import { useState, useEffect, useCallback } from 'react';
import { ChatDto, ChatWithMetadata } from '../types/api';
import { ChatService } from '../services/chatService';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';

interface UseChatsState {
    chats: ChatWithMetadata[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
}

export const useChats = (enablePolling: boolean = false) => {
    const { user } = useAuth();
    const [state, setState] = useState<UseChatsState>({
        chats: [],
        loading: true,
        error: null,
        refreshing: false,
    });

    // Transform backend ChatDto to frontend ChatWithMetadata
    const transformChatData = useCallback((chat: ChatDto): ChatWithMetadata => {
        const currentUserId = user?.id;
        const otherUser = chat.user1_id === currentUserId ? chat.user2 : chat.user1;
        const lastMessageDate = chat.last_message?.date_sent || chat.date_updated || chat.date_created;

        return {
            ...chat,
            other_user: otherUser,
            last_message_date: lastMessageDate
        };
    }, [user?.id]);

    const fetchChats = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            logger.info('💬 [useChats] Fetching chats...');
            const response = await ChatService.getUserChats();

            logger.info('💬 [useChats] Raw response from backend:', {
                response: JSON.stringify(response, null, 2),
                dataType: typeof response.data,
                isArray: Array.isArray(response.data),
                count: response.data?.length || 0,
                responseKeys: Object.keys(response || {}),
                hasDataProperty: 'data' in (response || {}),
                responseIsArray: Array.isArray(response)
            });

            // Handle different response structures
            let chatsArray: ChatDto[] = [];

            if (Array.isArray(response.data)) {
                // Standard case: { data: ChatDto[] }
                chatsArray = response.data;
                logger.info('💬 [useChats] Using response.data array:', { count: chatsArray.length });
            } else if (Array.isArray(response)) {
                // Direct array response: ChatDto[]
                chatsArray = response;
                logger.info('💬 [useChats] Using direct response array:', { count: chatsArray.length });
            } else if (response.data) {
                // Single object: { data: ChatDto }
                chatsArray = [response.data];
                logger.info('💬 [useChats] Using single response.data object');
            } else if (response && typeof response === 'object' && 'id' in response) {
                // Direct single object: ChatDto
                chatsArray = [response as unknown as ChatDto];
                logger.info('💬 [useChats] Using direct response object');
            } else {
                logger.warn('💬 [useChats] Unexpected response structure:', { response });
            }

            // Transform and sort chats by last message date (most recent first)
            logger.info('💬 [useChats] About to transform chats:', {
                chatsArrayLength: chatsArray.length,
                firstChatRaw: chatsArray[0] ? JSON.stringify(chatsArray[0], null, 2) : 'No chats'
            });

            const transformedChats = chatsArray.map((chat, index) => {
                logger.info(`💬 [useChats] Transforming chat ${index}:`, {
                    chatId: chat.id,
                    user1_id: chat.user1_id,
                    user2_id: chat.user2_id,
                    currentUserId: user?.id,
                    hasUser1: !!chat.user1,
                    hasUser2: !!chat.user2,
                    messagesCount: chat.messages?.length || 0
                });
                return transformChatData(chat);
            });

            const sortedChats = transformedChats.sort((a, b) => {
                const dateA = a.last_message_date || a.date_created;
                const dateB = b.last_message_date || b.date_created;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

            logger.info('💬 [useChats] Chats transformed and sorted:', {
                originalCount: chatsArray.length,
                transformedCount: sortedChats.length,
                firstChatPreview: sortedChats[0] ? {
                    id: sortedChats[0].id,
                    otherUser: sortedChats[0].other_user?.name || 'Unknown',
                    unreadCount: sortedChats[0].unread_count || 0,
                    lastMessageDate: sortedChats[0].last_message_date
                } : 'No chats'
            });

            setState(prev => ({
                ...prev,
                chats: sortedChats,
                loading: false
            }));
        } catch (error) {
            logger.error('❌ [useChats] Error fetching chats:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to fetch chats',
                loading: false
            }));
        }
    }, [transformChatData]);

    const refresh = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, refreshing: true, error: null }));

            const response = await ChatService.getUserChats();

            // Handle both array and single object responses
            let chatsArray: ChatDto[] = [];
            if (Array.isArray(response.data)) {
                chatsArray = response.data;
            } else if (response.data) {
                chatsArray = [response.data];
            }

            // Transform and sort chats by last message date (most recent first)
            const transformedChats = chatsArray.map(transformChatData);
            const sortedChats = transformedChats.sort((a, b) => {
                const dateA = a.last_message_date || a.date_created;
                const dateB = b.last_message_date || b.date_created;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

            setState(prev => ({
                ...prev,
                chats: sortedChats,
                refreshing: false
            }));
        } catch (error) {
            logger.error('❌ [useChats] Error refreshing chats:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to refresh chats',
                refreshing: false
            }));
        }
    }, [transformChatData]);

    const createOrGetChat = useCallback(async (otherUserId: string): Promise<ChatWithMetadata | null> => {
        try {
            logger.info('💬 [useChats] Creating/getting chat with user:', { otherUserId });
            const chat = await ChatService.createOrGetChat(otherUserId);

            // Transform the chat data
            const transformedChat = transformChatData(chat);

            // Update the chats list with the new/existing chat
            setState(prev => {
                const existingChatIndex = prev.chats.findIndex(chat => chat.id === transformedChat.id);
                let updatedChats;

                if (existingChatIndex >= 0) {
                    // Update existing chat
                    updatedChats = [...prev.chats];
                    updatedChats[existingChatIndex] = transformedChat;
                } else {
                    // Add new chat at the beginning
                    updatedChats = [transformedChat, ...prev.chats];
                }

                // Re-sort chats
                updatedChats.sort((a, b) => {
                    const dateA = a.last_message_date || a.date_created;
                    const dateB = b.last_message_date || b.date_created;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                });

                return { ...prev, chats: updatedChats };
            });

            return transformedChat;
        } catch (error) {
            logger.error('❌ [useChats] Error creating/getting chat:', error);
            return null;
        }
    }, [transformChatData]);

    const updateChatLastMessage = useCallback((chatId: string, lastMessageDate: string, unreadCount?: number) => {
        setState(prev => {
            const updatedChats = prev.chats.map(chat => {
                if (chat.id === chatId) {
                    return {
                        ...chat,
                        last_message_date: lastMessageDate,
                        ...(unreadCount !== undefined && { unread_count: unreadCount })
                    };
                }
                return chat;
            });

            // Re-sort chats after updating
            updatedChats.sort((a, b) => {
                const dateA = a.last_message_date || a.date_created;
                const dateB = b.last_message_date || b.date_created;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

            return { ...prev, chats: updatedChats };
        });
    }, []);

    const markChatAsRead = useCallback((chatId: string) => {
        setState(prev => ({
            ...prev,
            chats: prev.chats.map(chat =>
                chat.id === chatId
                    ? { ...chat, unread_count: 0 }
                    : chat
            )
        }));
    }, []);

    // Load chats on mount
    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // Polling effect - fetch chats every 1 second without showing loading (only if enabled)
    useEffect(() => {
        if (!user?.id || !enablePolling) return;

        logger.info('🔄 [useChats] Starting polling (enabled)...');
        const interval = setInterval(async () => {
            try {
                logger.info('🔄 [useChats] Polling chats...');
                const response = await ChatService.getUserChats();

                // Handle different response structures
                let chatsArray: ChatDto[] = [];

                if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
                    chatsArray = response.data;
                } else if (Array.isArray(response)) {
                    chatsArray = response;
                }

                // Transform and sort chats
                const transformedChats = chatsArray.map(transformChatData);
                const sortedChats = transformedChats.sort((a, b) => {
                    const dateA = a.last_message_date || a.date_created;
                    const dateB = b.last_message_date || b.date_created;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                });

                // Update state without showing loading
                setState(prev => ({
                    ...prev,
                    chats: sortedChats,
                    error: null
                }));
            } catch (error) {
                logger.error('❌ [useChats] Error during polling:', error);
                // Don't update error state during polling to avoid disrupting UI
            }
        }, 1000); // Poll every 1 second

        return () => {
            logger.info('🔄 [useChats] Stopping polling...');
            clearInterval(interval);
        };
    }, [user?.id, enablePolling, transformChatData]);

    return {
        chats: state.chats,
        loading: state.loading,
        error: state.error,
        refreshing: state.refreshing,
        refresh,
        createOrGetChat,
        updateChatLastMessage,
        markChatAsRead,
    };
};
