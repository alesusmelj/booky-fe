import { authStorage } from './storage';
import { API_BASE_URL } from '../config/api';
import { logger } from '../utils/logger';

const getAuthToken = async (): Promise<string | null> => {
    return await authStorage.getToken();
};

export class CommentsService {
    /**
     * Get comments by post ID
     */
    static async getCommentsByPostId(postId: string): Promise<{ data: any[] }> {
        const url = `${API_BASE_URL}/comments/post/${postId}`;
        const token = await getAuthToken();

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            logger.error('Error fetching comments:', error);
            throw error;
        }
    }

    /**
     * Create a new comment
     */
    static async createComment(commentData: {
        body: string;
        post_id: string;
    }): Promise<{ data: any }> {
        const url = `${API_BASE_URL}/comments`;
        const token = await getAuthToken();

        try {
            logger.info('💬 Creating comment:', commentData);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            logger.info('✅ Comment created successfully');
            return { data };
        } catch (error) {
            logger.error('❌ Error creating comment:', error);
            throw error;
        }
    }

    /**
     * Delete a comment
     */
    static async deleteComment(commentId: string): Promise<void> {
        const url = `${API_BASE_URL}/comments/${commentId}`;
        const token = await getAuthToken();

        try {
            logger.info('🗑️ Deleting comment:', commentId);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            logger.info('✅ Comment deleted successfully');
        } catch (error) {
            logger.error('❌ Error deleting comment:', error);
            throw error;
        }
    }
}

