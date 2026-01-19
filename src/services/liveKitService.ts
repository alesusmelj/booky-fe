import { apiRequest } from './api';
import { logger } from '../utils/logger';

export interface LiveKitToken {
  token: string;
  room_name: string;
  participant_name: string;
  moderator?: boolean;
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

  /**
   * Generate a 360 scene image from a text fragment
   */
  static async generateSceneImage(
    readingClubId: string,
    text: string
  ): Promise<{ image_url?: string; base64?: string }> {
    try {
      logger.info('Generating scene image for reading club:', readingClubId);

      const response = await apiRequest(`/api/reading-clubs/${readingClubId}/scene-image`, {
        method: 'POST',
        body: JSON.stringify({
          text,
          return_base64: true
        }),
      });

      logger.info('Scene image generated successfully');
      return response.data;
    } catch (error) {
      logger.error('Error generating scene image:', error);
      throw error;
    }
  }

  /**
   * Get all 360 scene images for a reading club
   */
  static async getSceneImages(
    readingClubId: string
  ): Promise<Array<{ id: string; image_base64: string; image_url: string; created_at: string; text?: string }>> {
    try {
      logger.info('Fetching scene images for reading club:', readingClubId);

      const response = await apiRequest(`/api/reading-clubs/${readingClubId}/scene-generations`);

      logger.info('📦 Raw API response:', JSON.stringify(response));
      logger.info('📊 Response type:', typeof response);
      logger.info('📊 Is array:', Array.isArray(response));

      // apiRequest returns the data directly, not wrapped in a .data property
      // If the backend returns an array, response will be the array itself
      const scenes = Array.isArray(response) ? response : (response?.data || []);

      logger.info(`Scene images fetched successfully: ${scenes.length} scenes`);
      return scenes;
    } catch (error) {
      logger.error('Error fetching scene images:', error);
      throw error;
    }
  }
}
