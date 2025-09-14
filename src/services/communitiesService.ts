// Import the base API request function
import { API_BASE_URL } from '../config/api';

// Import auth storage to get token
import { authStorage } from './storage';

// Get auth token from storage
const getAuthToken = async (): Promise<string | null> => {
  return await authStorage.getToken();
};

// Base fetch wrapper
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

import { 
  CommunityDto, 
  CreateCommunityDto 
} from '../types/api'; // Use types from api.ts to avoid conflicts

export class CommunitiesService {
  /**
   * Get all communities
   * GET /communities
   */
  static async getAllCommunities(): Promise<CommunityDto[]> {
    try {
      const response = await apiRequest<CommunityDto[]>('/communities');
      return response.data;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  }

  /**
   * Get community by ID
   * GET /communities/{id}
   */
  static async getCommunityById(id: string): Promise<CommunityDto> {
    try {
      const response = await apiRequest<CommunityDto>(`/communities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching community ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new community
   * POST /communities
   */
  static async createCommunity(communityData: CreateCommunityDto): Promise<CommunityDto> {
    try {
      const response = await apiRequest<CommunityDto>('/communities', {
        method: 'POST',
        body: JSON.stringify(communityData)
      });
      return response.data;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  /**
   * Join a community
   * POST /communities/{communityId}/join
   */
  static async joinCommunity(communityId: string): Promise<void> {
    try {
      await apiRequest(`/communities/${communityId}/join`, {
        method: 'POST'
      });
    } catch (error) {
      console.error(`Error joining community ${communityId}:`, error);
      throw error;
    }
  }

  /**
   * Leave a community
   * DELETE /communities/{communityId}/leave
   */
  static async leaveCommunity(communityId: string): Promise<void> {
    try {
      await apiRequest(`/communities/${communityId}/leave`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error leaving community ${communityId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's communities
   * GET /communities/user/{userId}
   */
  static async getUserCommunities(userId: string): Promise<CommunityDto[]> {
    try {
      const response = await apiRequest<CommunityDto[]>(`/communities/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user communities for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Search communities
   * GET /communities/search?q={query}
   */
  static async searchCommunities(query: string): Promise<CommunityDto[]> {
    try {
      const response = await apiRequest<CommunityDto[]>(`/communities/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching communities with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Delete community (admin only)
   * DELETE /communities/{communityId}
   */
  static async deleteCommunity(communityId: string): Promise<void> {
    try {
      await apiRequest(`/communities/${communityId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error deleting community ${communityId}:`, error);
      throw error;
    }
  }
}
