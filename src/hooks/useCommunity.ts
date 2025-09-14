import { useState, useEffect, useCallback } from 'react';
import { CommunitiesService } from '../services/communitiesService';
import { CommunityDto } from '../types/api';
import { logger } from '../utils/logger';

interface UseCommunityState {
  community: CommunityDto | null;
  loading: boolean;
  error: string | null;
}

interface UseCommunityActions {
  fetchCommunity: (id: string) => Promise<void>;
  joinCommunity: () => Promise<boolean>;
  leaveCommunity: () => Promise<boolean>;
  clearError: () => void;
}

export const useCommunity = (communityId?: string): UseCommunityState & UseCommunityActions => {
  const [state, setState] = useState<UseCommunityState>({
    community: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setCommunity = (communityOrUpdater: CommunityDto | null | ((prev: CommunityDto | null) => CommunityDto | null)) => {
    setState(prev => ({ 
      ...prev, 
      community: typeof communityOrUpdater === 'function' 
        ? communityOrUpdater(prev.community) 
        : communityOrUpdater 
    }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCommunity = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const community = await CommunitiesService.getCommunityById(id);
      setCommunity(community);
      
      logger.info('Community fetched successfully:', community);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch community';
      setError(errorMessage);
      logger.error('Error fetching community:', error);
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const joinCommunity = useCallback(async (): Promise<boolean> => {
    if (!state.community) return false;

    try {
      setError(null);
      
      await CommunitiesService.joinCommunity(state.community.id);
      
      // Refresh community data from server to get updated state
      await fetchCommunity(state.community.id);
      
      logger.info('Successfully joined community:', state.community.id);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join community';
      setError(errorMessage);
      logger.error('Error joining community:', error);
      return false;
    }
  }, [state.community, fetchCommunity]);

  const leaveCommunity = useCallback(async (): Promise<boolean> => {
    if (!state.community) return false;

    try {
      setError(null);
      
      await CommunitiesService.leaveCommunity(state.community.id);
      
      // Refresh community data from server to get updated state
      await fetchCommunity(state.community.id);
      
      logger.info('Successfully left community:', state.community.id);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave community';
      setError(errorMessage);
      logger.error('Error leaving community:', error);
      return false;
    }
  }, [state.community, fetchCommunity]);

  // Load community on mount or when communityId changes
  useEffect(() => {
    if (communityId) {
      fetchCommunity(communityId);
    }
  }, [communityId, fetchCommunity]);

  return {
    ...state,
    fetchCommunity,
    joinCommunity,
    leaveCommunity,
    clearError,
  };
};
