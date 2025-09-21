import { apiRequest } from './api';
import { ChatDto, MessageDto, CreateChatRequestDto, SendMessageRequestDto } from '../types/api';
import { logger } from '../utils/logger';

export class ChatService {
    /**
     * Get all chats for the current user
     */
    static async getUserChats(): Promise<{ data: ChatDto[] }> {
        try {
            logger.info('💬 [ChatService] Fetching user chats...');
            const response = await apiRequest('/chats');

            // Log the complete response structure
            logger.info('💬 [ChatService] Complete API response:', JSON.stringify(response, null, 2));
            logger.info('💬 [ChatService] Response analysis:', {
                responseKeys: Object.keys(response || {}),
                hasData: !!response.data,
                dataType: typeof response.data,
                isArray: Array.isArray(response.data),
                count: response.data?.length || 0,
                responseDirectly: response,
                firstItem: response.data?.[0] || response.data
            });

            // Check if response is directly an array (some APIs return arrays directly)
            if (Array.isArray(response)) {
                logger.info('💬 [ChatService] Response is directly an array, wrapping in data property');
                return { data: response };
            }

            return response;
        } catch (error) {
            logger.error('❌ [ChatService] Error fetching chats:', error);
            throw error;
        }
    }

    /**
     * Create or get existing chat with another user
     */
    static async createOrGetChat(otherUserId: string): Promise<ChatDto> {
        try {
            logger.info('💬 [ChatService] Creating/getting chat with user:', { otherUserId });
            const requestBody: CreateChatRequestDto = {
                other_user_id: otherUserId
            };
            const response = await apiRequest<ChatDto>('/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            logger.info('💬 [ChatService] Raw chat response:', {
                response: JSON.stringify(response, null, 2),
                responseType: typeof response,
                hasId: response && typeof response === 'object' && 'id' in response
            });

            // Handle different response structures
            if (response && typeof response === 'object' && 'id' in response) {
                // Direct ChatDto response
                logger.info('💬 [ChatService] Chat created/retrieved successfully (direct response):', { chatId: response.id });
                return response;
            } else if (response && typeof response === 'object' && 'data' in response && (response as any).data) {
                // Wrapped response: { data: ChatDto }
                const wrappedResponse = response as { data: ChatDto };
                logger.info('💬 [ChatService] Chat created/retrieved successfully (wrapped response):', { chatId: wrappedResponse.data.id });
                return wrappedResponse.data;
            } else {
                logger.error('💬 [ChatService] Unexpected response format:', { response });
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            logger.error('❌ [ChatService] Error creating/getting chat:', error);
            throw error;
        }
    }

    /**
     * Get all messages from a specific chat
     */
    static async getChatMessages(chatId: string): Promise<MessageDto[]> {
        try {
            logger.info('💬 [ChatService] Fetching messages for chat:', { chatId });
            const response = await apiRequest<MessageDto[]>(`/chats/${chatId}/messages`);

            logger.info('💬 [ChatService] Raw messages response:', {
                response: JSON.stringify(response, null, 2),
                responseType: typeof response,
                isArray: Array.isArray(response),
                hasDataProperty: response && typeof response === 'object' && 'data' in response
            });

            // Handle different response structures
            if (Array.isArray(response)) {
                // Direct array response: MessageDto[]
                logger.info('💬 [ChatService] Messages fetched successfully (direct array):', {
                    chatId,
                    count: response.length
                });
                return response;
            } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
                // Wrapped response: { data: MessageDto[] }
                const wrappedResponse = response as { data: MessageDto[] };
                logger.info('💬 [ChatService] Messages fetched successfully (wrapped array):', {
                    chatId,
                    count: wrappedResponse.data.length
                });
                return wrappedResponse.data;
            } else {
                logger.warn('💬 [ChatService] Unexpected response format, defaulting to empty array:', { response });
                return [];
            }
        } catch (error) {
            logger.error('❌ [ChatService] Error fetching messages:', error);
            throw error;
        }
    }

    /**
     * Send a message to a chat
     */
    static async sendMessage(chatId: string, content: string, image?: string): Promise<MessageDto> {
        try {
            logger.info('💬 [ChatService] Sending message to chat:', {
                chatId,
                hasContent: !!content,
                hasImage: !!image,
                contentPreview: content ? content.substring(0, 50) + '...' : 'No content'
            });

            const requestBody: SendMessageRequestDto = {
                content,
                ...(image && { image })
            };

            const response = await apiRequest<MessageDto>(`/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            logger.info('💬 [ChatService] Raw message response:', {
                response: JSON.stringify(response, null, 2),
                responseType: typeof response,
                hasId: response && typeof response === 'object' && 'id' in response,
                messageId: response && typeof response === 'object' && 'id' in response ? response.id : 'No ID'
            });

            // Handle different response structures
            if (response && typeof response === 'object' && 'id' in response) {
                // Direct MessageDto response
                logger.info('💬 [ChatService] Message sent successfully (direct response):', {
                    chatId,
                    messageId: response.id
                });
                return response;
            } else if (response && typeof response === 'object' && 'data' in response && (response as any).data) {
                // Wrapped response: { data: MessageDto }
                const wrappedResponse = response as { data: MessageDto };
                logger.info('💬 [ChatService] Message sent successfully (wrapped response):', {
                    chatId,
                    messageId: wrappedResponse.data.id
                });
                return wrappedResponse.data;
            } else {
                logger.error('💬 [ChatService] Unexpected response format:', { response });
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            logger.error('❌ [ChatService] Error sending message:', error);
            throw error;
        }
    }

    /**
     * Mark all messages in a chat as read
     */
    static async markMessagesAsRead(chatId: string): Promise<void> {
        try {
            logger.info('💬 [ChatService] Marking messages as read for chat:', { chatId });
            await apiRequest(`/chats/${chatId}/mark-read`, {
                method: 'PUT',
            });
            logger.info('💬 [ChatService] Messages marked as read successfully:', { chatId });
        } catch (error) {
            logger.error('❌ [ChatService] Error marking messages as read:', error);
            throw error;
        }
    }
}
