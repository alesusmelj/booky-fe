import { authStorage } from './storage';
import { API_BASE_URL } from '../config/api';
import { logger } from '../utils/logger';
import { uriToBase64, fileToBase64 } from '../utils';

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

    // For DELETE requests that return 204 No Content, don't try to parse JSON
    if (response.status === 204 || options.method === 'DELETE') {
      return { data: null as T };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    logger.error('API request failed:', error);
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
   * Uses JSON body with base64 encoded image
   */
  static async createPost(postData: {
    body: string;
    community_id?: string;
  }, image?: File | string | null): Promise<{ data: any }> {
    const requestBody: any = {
      body: postData.body,
      community_id: postData.community_id,
    };

    // Convert image to base64 if provided
    if (image) {
      try {
        let base64Image: string;

        logger.info('📸 Converting image to base64...', {
          imageType: typeof image,
          isString: typeof image === 'string',
          imagePreview: typeof image === 'string' ? image.substring(0, 50) + '...' : 'File object'
        });

        if (typeof image === 'string') {
          // It's a URI, convert using uriToBase64
          base64Image = await uriToBase64(image);
          logger.info('✅ URI converted to base64 successfully');
        } else {
          // It's a File object, convert using fileToBase64
          base64Image = await fileToBase64(image);
          logger.info('✅ File converted to base64 successfully');
        }

        requestBody.image = base64Image;
        logger.info('✅ Image added to request body', {
          base64Length: base64Image.length,
          base64Preview: base64Image.substring(0, 50) + '...'
        });
      } catch (error) {
        logger.error('❌ Error converting image to base64:', error);
        logger.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          imageType: typeof image,
          imageValue: typeof image === 'string' ? image : 'File object'
        });
        throw new Error('Failed to process image');
      }
    }

    const response = await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('📝 Post creation response:', response);
    logger.info('📝 Post data structure:', response.data);
    logger.info('📝 Post user data:', response.data?.user);

    return response;
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
    const url = `${API_BASE_URL}/posts/${postId}`;
    const token = await getAuthToken();

    logger.info('🗑️ [PostsService] Deleting post:', { postId, url });

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      logger.info('🗑️ [PostsService] Delete response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error text');
        logger.error('❌ [PostsService] Delete failed:', {
          status: response.status,
          errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Successfully deleted - 204 No Content response has no body to parse
      logger.info('✅ [PostsService] Post deleted successfully from API');
    } catch (error) {
      logger.error('❌ [PostsService] Error in deletePost service:', error);
      throw error;
    }
  }
}
