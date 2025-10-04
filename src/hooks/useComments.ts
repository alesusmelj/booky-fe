import { useState, useCallback } from 'react';
import { CommentsService } from '../services/commentsService';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface Comment {
    id: string;
    body: string;
    date_created: string;
    user_id: string;
    post_id: string;
    user: {
        id: string;
        username: string;
        name: string;
        lastname: string;
        image?: string;
    };
}

interface CommentsState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    creating: boolean;
}

export const useComments = (postId: string) => {
    const { user } = useAuth();
    const [state, setState] = useState<CommentsState>({
        comments: [],
        loading: false,
        error: null,
        creating: false,
    });

    const fetchComments = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const response = await CommentsService.getCommentsByPostId(postId);

            setState(prev => ({
                ...prev,
                comments: response.data || [],
                loading: false,
            }));
        } catch (error) {
            logger.error('Error fetching comments:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch comments',
            }));
        }
    }, [postId]);

    const createComment = useCallback(async (body: string): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, creating: true, error: null }));

            const response = await CommentsService.createComment({
                body,
                post_id: postId,
            });

            const newComment = {
                ...response.data,
                user: response.data.user || user,
            };

            setState(prev => ({
                ...prev,
                comments: [...prev.comments, newComment],
                creating: false,
            }));

            return true;
        } catch (error) {
            logger.error('Error creating comment:', error);
            setState(prev => ({
                ...prev,
                creating: false,
                error: error instanceof Error ? error.message : 'Failed to create comment',
            }));
            return false;
        }
    }, [postId, user]);

    const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
        try {
            await CommentsService.deleteComment(commentId);

            setState(prev => ({
                ...prev,
                comments: prev.comments.filter(comment => comment.id !== commentId),
            }));

            return true;
        } catch (error) {
            logger.error('Error deleting comment:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to delete comment',
            }));
            return false;
        }
    }, []);

    return {
        comments: state.comments,
        loading: state.loading,
        creating: state.creating,
        error: state.error,
        fetchComments,
        createComment,
        deleteComment,
    };
};

