import { authStorage } from './storage';
import { API_BASE_URL } from '../config/api';

const getAuthToken = async (): Promise<string | null> => {
  return await authStorage.getToken();
};

const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T }> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');
    
    let data = null;
    if (hasJsonContent) {
      const text = await response.text();
      if (text.trim()) {
        data = JSON.parse(text);
      }
    }
    
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export class ReadingClubsService {
  /**
   * Get all reading clubs
   */
  static async getAllReadingClubs(): Promise<{ data: any[] }> {
    return await apiRequest('/reading-clubs');
  }

  /**
   * Get reading clubs by community ID
   */
  static async getReadingClubsByCommunity(communityId: string): Promise<{ data: any[] }> {
    return await apiRequest(`/reading-clubs/community/${communityId}`);
  }

  /**
   * Get reading club by ID
   */
  static async getReadingClubById(clubId: string): Promise<{ data: any }> {
    return await apiRequest(`/reading-clubs/${clubId}`);
  }

  /**
   * Get reading clubs by user ID
   */
  static async getReadingClubsByUser(userId: string): Promise<{ data: any[] }> {
    return await apiRequest(`/reading-clubs/user/${userId}`);
  }

  /**
   * Create a new reading club
   */
  static async createReadingClub(clubData: {
    name: string;
    description?: string;
    community_id: string;
    book_id: string;
    next_meeting: string; // ISO date string
  }): Promise<{ data: any }> {
    return await apiRequest('/reading-clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  }

  /**
   * Join a reading club
   */
  static async joinReadingClub(clubId: string): Promise<void> {
    await apiRequest(`/reading-clubs/${clubId}/join`, {
      method: 'POST',
    });
  }

  /**
   * Leave a reading club
   */
  static async leaveReadingClub(clubId: string): Promise<void> {
    await apiRequest(`/reading-clubs/${clubId}/leave`, {
      method: 'POST',
    });
  }

  /**
   * Update reading club meeting
   */
  static async updateMeeting(clubId: string, meetingData: {
    next_meeting: string; // ISO date string
    current_chapter: number;
  }): Promise<{ data: any }> {
    return await apiRequest(`/reading-clubs/${clubId}/meeting`, {
      method: 'PUT',
      body: JSON.stringify(meetingData),
    });
  }

  /**
   * Delete reading club
   */
  static async deleteReadingClub(clubId: string): Promise<void> {
    await apiRequest(`/reading-clubs/${clubId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Search reading clubs
   */
  static async searchReadingClubs(query: string): Promise<{ data: any[] }> {
    const searchParams = new URLSearchParams({ q: query });
    return await apiRequest(`/reading-clubs/search?${searchParams.toString()}`);
  }
}
