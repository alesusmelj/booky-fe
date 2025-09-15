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

  // Don't set Content-Type for FormData, let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export class PostsService {
  /**
   * Get posts with optional filters
   */
  static async getPosts(params?: {
    type?: 'feed' | 'general';
    userId?: string;
    communityId?: string;
  }): Promise<{ data: any[] }> {
    const searchParams = new URLSearchParams();
    
    if (params?.type) {
      searchParams.append('type', params.type);
    }
    if (params?.userId) {
      searchParams.append('userId', params.userId);
    }
    if (params?.communityId) {
      searchParams.append('communityId', params.communityId);
    }

    const queryString = searchParams.toString();
    const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint);
  }

  /**
   * Get posts by community ID
   */
  static async getPostsByCommunity(communityId: string): Promise<{ data: any[] }> {
    return this.getPosts({ communityId });
  }

  /**
   * Create a new post
   */
  static async createPost(postData: {
    body: string;
    community_id?: string;
  }, image?: File | null): Promise<{ data: any }> {
    const formData = new FormData();
    
    // Add the post data as JSON string with proper content type
    const postBlob = new Blob([JSON.stringify(postData)], { 
      type: 'application/json' 
    });
    formData.append('post', postBlob);
    
    // Add image if provided
    if (image) {
      formData.append('image', image, image.name);
    }

    return await apiRequest('/posts', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let the browser set it with boundary
      headers: {},
    });
  }

  /**
   * Get post by ID
   */
  static async getPostById(postId: string): Promise<{ data: any }> {
    return await apiRequest(`/posts/${postId}`);
  }

  /**
   * Update post
   */
  static async updatePost(postId: string, postData: {
    body: string;
    community_id?: string;
  }): Promise<{ data: any }> {
    return await apiRequest(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string): Promise<void> {
    await apiRequest(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }
}
