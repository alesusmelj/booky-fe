import { apiRequest } from './api';
import { logger } from '../utils/logger';

export interface LiveKitToken {
  token: string;
  room_name: string;
  participant_name: string;
}

export interface JoinMeetingRequest {
  reading_club_id: string;
  participant_name: string;
}

export class LiveKitService {
  /**
   * Get LiveKit token for joining a reading club meeting from the backend
   */
  static async getToken(request: JoinMeetingRequest): Promise<LiveKitToken> {
    try {
      logger.info('📡 Requesting LiveKit token from backend for reading club:', request.reading_club_id);

      const response = await apiRequest('/api/reading-clubs/meetings/token', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      logger.info('✅ LiveKit token received successfully from backend');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Backend token generation failed:', error);
      throw error;
    }
  }

  /**
   * Start a meeting for a reading club (moderator only)
   */
  static async startMeeting(readingClubId: string): Promise<{ success: boolean }> {
    try {
      logger.info('Starting meeting for reading club:', readingClubId);

      const response = await apiRequest(`/api/reading-clubs/meetings/${readingClubId}/start`, {
        method: 'POST',
      });

      logger.info('Meeting started successfully');
      return response.data;
    } catch (error) {
      logger.error('Error starting meeting:', error);
      throw error;
    }
  }

  /**
   * End a meeting for a reading club (moderator only)
   */
  static async endMeeting(readingClubId: string): Promise<{ success: boolean }> {
    try {
      logger.info('Ending meeting for reading club:', readingClubId);

      const response = await apiRequest(`/api/reading-clubs/meetings/${readingClubId}/end`, {
        method: 'POST',
      });

      logger.info('Meeting ended successfully');
      return response.data;
    } catch (error) {
      logger.error('Error ending meeting:', error);
      throw error;
    }
  }

  /**
   * Check if a meeting is currently active for a reading club
   */
  static async getMeetingStatus(readingClubId: string): Promise<{
    participant_count: number;
    started_at?: string;
    room_name?: string;
    exists: boolean;
    active: boolean;
    // Legacy compatibility
    isActive?: boolean;
    participantCount?: number;
  }> {
    try {
      logger.info('Checking meeting status for reading club:', readingClubId);

      const response = await apiRequest(`/api/reading-clubs/meetings/${readingClubId}/status`);

      return response.data;
    } catch (error) {
      logger.error('Error checking meeting status:', error);
      throw error;
    }
  }
}
