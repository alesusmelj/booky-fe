import { useState, useEffect, useCallback } from 'react';
import { CommunitiesService } from '../services/communitiesService';
import { CommunityDto, CreateCommunityDto } from '../types/api';
import { logger } from '../utils/logger';

interface UseCommunitiesState {
  communities: CommunityDto[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseCommunitiesActions {
  fetchCommunities: () => Promise<void>;
  searchCommunities: (query: string) => Promise<void>;
  createCommunity: (data: CreateCommunityDto) => Promise<CommunityDto | null>;
  joinCommunity: (communityId: string) => Promise<boolean>;
  leaveCommunity: (communityId: string) => Promise<boolean>;
  deleteCommunity: (communityId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useCommunities = (): UseCommunitiesState & UseCommunitiesActions => {
  const [state, setState] = useState<UseCommunitiesState>({
    communities: [],
    loading: false,
    error: null,
    refreshing: false,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setRefreshing = (refreshing: boolean) => {
    setState(prev => ({ ...prev, refreshing }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setCommunities = (communitiesOrUpdater: CommunityDto[] | ((prev: CommunityDto[]) => CommunityDto[])) => {
    setState(prev => ({
      ...prev,
      communities: typeof communitiesOrUpdater === 'function'
        ? communitiesOrUpdater(prev.communities)
        : communitiesOrUpdater
    }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🌐 [HOOK] Fetching communities from server...');
      const communities = await CommunitiesService.getAllCommunities();

      console.log('✅ [HOOK] Communities fetched successfully:', communities.length);
      console.log('📋 [HOOK] Communities data:', communities.map(c => ({
        id: c.id,
        name: c.name,
        join_available: c.join_available
      })));

      setCommunities(communities);
      console.log('🔄 [HOOK] State updated with new communities');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch communities';
      setError(errorMessage);
      console.error('❌ [HOOK] Error fetching communities:', error);
    } finally {
      setLoading(false);
      console.log('🏁 [HOOK] fetchCommunities completed');
    }
  }, []);

  const searchCommunities = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchCommunities();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const communities = await CommunitiesService.searchCommunities(query);
      setCommunities(communities);

      logger.info(`Communities search completed for "${query}":`, communities.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search communities';
      setError(errorMessage);
      logger.error('Error searching communities:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchCommunities]);

  const createCommunity = useCallback(async (data: CreateCommunityDto): Promise<CommunityDto | null> => {
    try {
      setError(null);

      const newCommunity = await CommunitiesService.createCommunity(data);

      // Add the new community to the list
      setCommunities((prev: CommunityDto[]) => [newCommunity, ...prev]);

      logger.info('Community created successfully:', newCommunity);
      return newCommunity;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
      setError(errorMessage);
      logger.error('Error creating community:', error);
      return null;
    }
  }, []);

  const joinCommunity = useCallback(async (communityId: string): Promise<boolean> => {
    try {
      setError(null);

      console.log('🔗 [HOOK] Attempting to join community:', communityId);
      const result = await CommunitiesService.joinCommunity(communityId);
      console.log('📋 [HOOK] Join service result:', result);

      // Note: We don't update locally here anymore, 
      // the calling component should refresh to get updated data from server

      console.log('✅ [HOOK] Successfully joined community:', communityId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join community';
      setError(errorMessage);
      console.error('❌ [HOOK] Error joining community:', error);
      return false;
    }
  }, []);

  const leaveCommunity = useCallback(async (communityId: string): Promise<boolean> => {
    try {
      setError(null);

      await CommunitiesService.leaveCommunity(communityId);

      // Note: We don't update locally here anymore, 
      // the calling component should refresh to get updated data from server

      logger.info('Successfully left community:', communityId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave community';
      setError(errorMessage);
      logger.error('Error leaving community:', error);
      return false;
    }
  }, []);

  const deleteCommunity = useCallback(async (communityId: string): Promise<boolean> => {
    try {
      setError(null);

      logger.info('🗑️ [HOOK] Attempting to delete community:', communityId);
      await CommunitiesService.deleteCommunity(communityId);

      // Remove the community from local state
      setCommunities((prev: CommunityDto[]) => prev.filter(c => c.id !== communityId));

      logger.info('✅ [HOOK] Successfully deleted community:', communityId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete community';
      setError(errorMessage);
      logger.error('❌ [HOOK] Error deleting community:', error);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchCommunities();
    } finally {
      setRefreshing(false);
    }
  }, [fetchCommunities]);

  // Load communities on mount
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return {
    ...state,
    fetchCommunities,
    searchCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    deleteCommunity,
    refresh,
    clearError,
  };
};
