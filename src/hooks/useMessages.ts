import { useState, useEffect, useCallback } from 'react';
import { MessageDto } from '../types/api';
import { ChatService } from '../services/chatService';
import { logger } from '../utils/logger';
import { uriToBase64, fileToBase64 } from '../utils';

interface UseMessagesState {
    messages: MessageDto[];
    loading: boolean;
    error: string | null;
    sending: boolean;
}

export const useMessages = (chatId: string) => {
    const [state, setState] = useState<UseMessagesState>({
        messages: [],
        loading: true,
        error: null,
        sending: false,
    });

    const fetchMessages = useCallback(async () => {
        if (!chatId) return;

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            logger.info('💬 [useMessages] Fetching messages for chat:', { chatId });
            const messages = await ChatService.getChatMessages(chatId);

            // Sort messages by date (oldest first for chat display)
            const sortedMessages = messages.sort((a, b) =>
                new Date(a.date_sent).getTime() - new Date(b.date_sent).getTime()
            );

            logger.info('💬 [useMessages] Messages fetched and sorted:', {
                chatId,
                count: sortedMessages.length,
                firstMessagePreview: sortedMessages[0] ? {
                    id: sortedMessages[0].id,
                    sender: sortedMessages[0].sender.name,
                    contentPreview: sortedMessages[0].content.substring(0, 30) + '...',
                    hasImage: !!sortedMessages[0].image
                } : 'No messages'
            });

            setState(prev => ({
                ...prev,
                messages: sortedMessages,
                loading: false
            }));
        } catch (error) {
            logger.error('❌ [useMessages] Error fetching messages:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to fetch messages',
                loading: false
            }));
        }
    }, [chatId]);

    const sendMessage = useCallback(async (
        content: string,
        image?: File | string | null
    ): Promise<boolean> => {
        if (!chatId || (!content.trim() && !image)) {
            logger.warn('💬 [useMessages] Cannot send empty message');
            return false;
        }

        try {
            setState(prev => ({ ...prev, sending: true, error: null }));

            let base64Image: string | undefined;

            if (image) {
                try {
                    logger.info('💬 [useMessages] Converting image to base64...', {
                        imageType: typeof image,
                        isString: typeof image === 'string'
                    });

                    if (typeof image === 'string') {
                        base64Image = await uriToBase64(image);
                    } else {
                        base64Image = await fileToBase64(image);
                    }

                    logger.info('💬 [useMessages] Image converted to base64 successfully');
                } catch (imageError) {
                    logger.error('❌ [useMessages] Error converting image to base64:', imageError);
                    setState(prev => ({ ...prev, sending: false }));
                    throw new Error('Failed to process image');
                }
            }

            logger.info('💬 [useMessages] Sending message:', {
                chatId,
                hasContent: !!content.trim(),
                hasImage: !!base64Image,
                contentPreview: content ? content.substring(0, 50) + '...' : 'No content'
            });

            const newMessage = await ChatService.sendMessage(chatId, content.trim(), base64Image);

            // Add the new message to the list
            setState(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage],
                sending: false
            }));

            logger.info('💬 [useMessages] Message sent successfully:', {
                chatId,
                messageId: newMessage.id
            });

            return true;
        } catch (error) {
            logger.error('❌ [useMessages] Error sending message:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to send message',
                sending: false
            }));
            return false;
        }
    }, [chatId]);

    const markAsRead = useCallback(async () => {
        if (!chatId) return;

        try {
            logger.info('💬 [useMessages] Marking messages as read:', { chatId });
            await ChatService.markMessagesAsRead(chatId);

            // Update all messages to read status
            setState(prev => ({
                ...prev,
                messages: prev.messages.map(message => ({ ...message, read: true }))
            }));

            logger.info('💬 [useMessages] Messages marked as read successfully:', { chatId });
        } catch (error) {
            logger.error('❌ [useMessages] Error marking messages as read:', error);
        }
    }, [chatId]);

    const addMessage = useCallback((message: MessageDto) => {
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, message]
        }));
    }, []);

    // Load messages when chatId changes
    useEffect(() => {
        if (chatId) {
            fetchMessages();
        }
    }, [chatId, fetchMessages]);

    // Polling effect - fetch messages every 1 second without showing loading
    useEffect(() => {
        if (!chatId) return;

        const interval = setInterval(async () => {
            try {
                logger.info('🔄 [useMessages] Polling messages for chat:', { chatId });
                const messages = await ChatService.getChatMessages(chatId);

                // Sort messages by date (oldest first for chat display)
                const sortedMessages = messages.sort((a, b) =>
                    new Date(a.date_sent).getTime() - new Date(b.date_sent).getTime()
                );

                // Update state without showing loading
                setState(prev => ({
                    ...prev,
                    messages: sortedMessages,
                    error: null
                }));
            } catch (error) {
                logger.error('❌ [useMessages] Error during polling:', error);
                // Don't update error state during polling to avoid disrupting UI
            }
        }, 1000); // Poll every 1 second

        return () => clearInterval(interval);
    }, [chatId]);

    return {
        messages: state.messages,
        loading: state.loading,
        error: state.error,
        sending: state.sending,
        sendMessage,
        markAsRead,
        addMessage,
        refetch: fetchMessages,
    };
};
