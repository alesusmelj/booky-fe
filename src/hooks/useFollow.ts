import { useState, useCallback } from 'react';
import { userApi } from '../services/api';
import { FollowUserDto } from '../types/api';
import { logger } from '../utils/logger';

interface FollowState {
    followingUsers: Set<string>;
    loading: boolean;
    error: string | null;
}

export const useFollow = () => {
    const [state, setState] = useState<FollowState>({
        followingUsers: new Set(),
        loading: false,
        error: null,
    });

    const followUser = useCallback(async (targetUserId: string) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('👤 Following user:', targetUserId);

            const followData: FollowUserDto = { target_user_id: targetUserId };
            await userApi.followUser(followData);

            setState(prev => ({
                ...prev,
                followingUsers: new Set([...prev.followingUsers, targetUserId]),
                loading: false,
            }));

            logger.info('✅ User followed successfully');
            return true;
        } catch (error) {
            logger.error('❌ Follow user failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to follow user';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    const unfollowUser = useCallback(async (targetUserId: string) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('👤 Unfollowing user:', targetUserId);

            const followData: FollowUserDto = { target_user_id: targetUserId };
            await userApi.unfollowUser(followData);

            setState(prev => {
                const newFollowingUsers = new Set(prev.followingUsers);
                newFollowingUsers.delete(targetUserId);
                return {
                    ...prev,
                    followingUsers: newFollowingUsers,
                    loading: false,
                };
            });

            logger.info('✅ User unfollowed successfully');
            return true;
        } catch (error) {
            logger.error('❌ Unfollow user failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to unfollow user';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            return false;
        }
    }, []);

    const toggleFollow = useCallback(async (targetUserId: string) => {
        const isFollowing = state.followingUsers.has(targetUserId);

        if (isFollowing) {
            return await unfollowUser(targetUserId);
        } else {
            return await followUser(targetUserId);
        }
    }, [state.followingUsers, followUser, unfollowUser]);

    const isFollowing = useCallback((userId: string) => {
        return state.followingUsers.has(userId);
    }, [state.followingUsers]);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        // State
        followingUsers: state.followingUsers,
        loading: state.loading,
        error: state.error,

        // Actions
        followUser,
        unfollowUser,
        toggleFollow,
        isFollowing,
        clearError,
    };
};
