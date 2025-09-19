import { useState, useCallback, useEffect } from 'react';
import { userApi } from '../services/api';
import { FollowUserDto } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface UserFollowState {
    isFollowing: boolean;
    loading: boolean;
    error: string | null;
}

export const useUserFollow = (targetUserId: string) => {
    const { user } = useAuth();
    const [state, setState] = useState<UserFollowState>({
        isFollowing: false,
        loading: false,
        error: null,
    });

    // Load initial follow status
    const loadFollowStatus = useCallback(async () => {
        if (!user?.id || !targetUserId || user.id === targetUserId) {
            setState(prev => ({ ...prev, isFollowing: false }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('🔍 Checking follow status for user:', targetUserId);

            // Get the list of users that current user is following
            const followingList = await userApi.getFollowing(user.id);
            const isFollowing = followingList.some(followedUser => followedUser.id === targetUserId);

            setState(prev => ({
                ...prev,
                isFollowing,
                loading: false,
            }));

            logger.info('✅ Follow status loaded:', { targetUserId, isFollowing });
        } catch (error) {
            logger.error('❌ Error loading follow status:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load follow status',
            }));
        }
    }, [user?.id, targetUserId]);

    // Follow user
    const followUser = useCallback(async () => {
        if (!user?.id || !targetUserId || user.id === targetUserId) {
            return false;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('👤 Following user:', targetUserId);

            const followData: FollowUserDto = { target_user_id: targetUserId };
            await userApi.followUser(followData);

            setState(prev => ({
                ...prev,
                isFollowing: true,
                loading: false,
            }));

            logger.info('✅ User followed successfully');
            return true;
        } catch (error) {
            logger.error('❌ Follow user failed:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to follow user',
            }));
            return false;
        }
    }, [user?.id, targetUserId]);

    // Unfollow user
    const unfollowUser = useCallback(async () => {
        if (!user?.id || !targetUserId || user.id === targetUserId) {
            return false;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('👤 Unfollowing user:', targetUserId);

            const followData: FollowUserDto = { target_user_id: targetUserId };
            await userApi.unfollowUser(followData);

            setState(prev => ({
                ...prev,
                isFollowing: false,
                loading: false,
            }));

            logger.info('✅ User unfollowed successfully');
            return true;
        } catch (error) {
            logger.error('❌ Unfollow user failed:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to unfollow user',
            }));
            return false;
        }
    }, [user?.id, targetUserId]);

    // Toggle follow status
    const toggleFollow = useCallback(async () => {
        logger.info('🔄 Toggling follow status:', { targetUserId, currentlyFollowing: state.isFollowing });

        if (state.isFollowing) {
            logger.info('➡️ User is currently followed, calling unfollowUser');
            return await unfollowUser();
        } else {
            logger.info('➡️ User is not followed, calling followUser');
            return await followUser();
        }
    }, [state.isFollowing, followUser, unfollowUser, targetUserId]);

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // Load follow status on mount and when targetUserId changes
    useEffect(() => {
        if (targetUserId && user?.id) {
            loadFollowStatus();
        }
    }, [loadFollowStatus, targetUserId, user?.id]);

    return {
        // State
        isFollowing: state.isFollowing,
        loading: state.loading,
        error: state.error,

        // Actions
        followUser,
        unfollowUser,
        toggleFollow,
        clearError,
        refreshFollowStatus: loadFollowStatus,
    };
};
