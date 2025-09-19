import { useState, useEffect, useCallback } from 'react';
import { ReadingClubsService } from '../services';

interface ReadingClubsState {
  readingClubs: any[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export const useReadingClubs = (communityId?: string) => {
  const [state, setState] = useState<ReadingClubsState>({
    readingClubs: [],
    loading: true,
    error: null,
    refreshing: false,
  });

  const setReadingClubs = (clubsOrUpdater: any[] | ((prev: any[]) => any[])) => {
    setState(prev => ({
      ...prev,
      readingClubs: typeof clubsOrUpdater === 'function'
        ? clubsOrUpdater(prev.readingClubs)
        : clubsOrUpdater
    }));
  };

  const fetchReadingClubs = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('🌐 [READING CLUBS HOOK] Fetching reading clubs for community:', communityId);
      const response = communityId
        ? await ReadingClubsService.getReadingClubsByCommunity(communityId)
        : await ReadingClubsService.getAllReadingClubs();

      console.log('✅ [READING CLUBS HOOK] Reading clubs fetched:', response.data?.length || 0);
      console.log('📋 [READING CLUBS HOOK] Clubs data:', response.data?.map(c => ({
        id: c.id,
        name: c.name,
        join_available: c.join_available
      })));

      // 🔍 Detailed book logging for debugging
      response.data?.forEach((club, index) => {
        console.log(`📚 [READING CLUBS HOOK] Club ${index + 1} book details:`, {
          clubId: club.id,
          clubName: club.name,
          book: club.book,
          bookTitle: club.book?.title,
          bookAuthor: club.book?.author,
          bookPages: club.book?.pages,
          bookImage: club.book?.image,
          currentChapter: club.current_chapter,
          bookObject: JSON.stringify(club.book, null, 2)
        });
      });

      setReadingClubs(response.data || []);
    } catch (error) {
      console.error('❌ [READING CLUBS HOOK] Error fetching reading clubs:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch reading clubs'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
      console.log('🏁 [READING CLUBS HOOK] fetchReadingClubs completed');
    }
  }, [communityId]);

  const refresh = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: null }));

      const response = communityId
        ? await ReadingClubsService.getReadingClubsByCommunity(communityId)
        : await ReadingClubsService.getAllReadingClubs();

      setReadingClubs(response.data || []);
    } catch (error) {
      console.error('Error refreshing reading clubs:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh reading clubs'
      }));
    } finally {
      setState(prev => ({ ...prev, refreshing: false }));
    }
  }, [communityId]);

  const createReadingClub = useCallback(async (clubData: {
    name: string;
    description?: string;
    community_id: string;
    book_id: string;
    next_meeting: string;
  }): Promise<boolean> => {
    try {
      const response = await ReadingClubsService.createReadingClub(clubData);

      // Add the new club to the beginning of the list
      setReadingClubs(prev => [response.data, ...prev]);

      return true;
    } catch (error) {
      console.error('Error creating reading club:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create reading club'
      }));
      return false;
    }
  }, []);

  const joinReadingClub = useCallback(async (clubId: string): Promise<boolean> => {
    let joinSuccessful = false;

    try {
      console.log('📚 [READING CLUBS HOOK] Attempting to join reading club:', clubId);
      await ReadingClubsService.joinReadingClub(clubId);
      console.log('✅ [READING CLUBS HOOK] Join API call successful');
      joinSuccessful = true;

      // Refresh the list to get updated member counts
      console.log('🔄 [READING CLUBS HOOK] Refreshing reading clubs...');
      try {
        await fetchReadingClubs();
        console.log('✅ [READING CLUBS HOOK] Reading clubs refreshed successfully');
      } catch (refreshError) {
        console.error('⚠️ [READING CLUBS HOOK] Refresh failed, but join was successful:', refreshError);
        // Don't fail the whole operation if refresh fails
      }

      return true;
    } catch (error) {
      console.error('❌ [READING CLUBS HOOK] Error joining reading club:', error);

      // If join failed, set error state
      if (!joinSuccessful) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to join reading club'
        }));
        return false;
      }

      // If join succeeded but refresh failed, still return true
      return true;
    }
  }, [fetchReadingClubs]);

  const leaveReadingClub = useCallback(async (clubId: string): Promise<boolean> => {
    try {
      await ReadingClubsService.leaveReadingClub(clubId);

      // Refresh the list to get updated member counts
      await fetchReadingClubs();

      return true;
    } catch (error) {
      console.error('Error leaving reading club:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to leave reading club'
      }));
      return false;
    }
  }, [fetchReadingClubs]);

  const updateMeeting = useCallback(async (clubId: string, meetingData: {
    next_meeting: string;
    current_chapter: number;
  }): Promise<boolean> => {
    try {
      const response = await ReadingClubsService.updateMeeting(clubId, meetingData);

      // Update the specific club in the list
      setReadingClubs(prev =>
        prev.map(club =>
          club.id === clubId ? response.data : club
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating meeting:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update meeting'
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch reading clubs on mount
  useEffect(() => {
    fetchReadingClubs();
  }, [fetchReadingClubs]);

  return {
    readingClubs: state.readingClubs,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    fetchReadingClubs,
    refresh,
    createReadingClub,
    joinReadingClub,
    leaveReadingClub,
    updateMeeting,
    clearError,
  };
};
