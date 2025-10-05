import {
  UserDto,
  UserSignInDto,
  UserSignUpDto,
  UserSignInResponseDto,
  UserUpdateDto,
  FollowUserDto,
  SearchUsersByBooksDto,
  BookDto,
  UserBookDto,
  AddBookToLibraryDto,
  UpdateStatusDto,
  UpdateExchangePreferenceDto,
  BookExchangeDto,
  CreateBookExchangeDto,
  UpdateExchangeStatusDto,
  CounterOfferDto,
  PostDto,
  CreatePostDto,
  CommentDto,
  CreateCommentDto,
  CommunityDto,
  CreateCommunityDto,
  ReadingClubDto,
  CreateReadingClubDto,
  GamificationProfileDto,
  UserAchievementDto,
  AchievementDto,
  UserLevelDto,
  GamificationActivityDto,
  PostsQueryParams,
  LibraryQueryParams,
  ExchangeQueryParams,
} from '../types/api';

// Configuration
import { API_BASE_URL } from '../config/api';
import { fileToBase64, uriToBase64 } from '../utils';
import { logger } from '../utils/logger';


// Error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Specific function for void API calls (follow, unfollow, join, etc.)
export const apiVoidRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<void> => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Don't set Content-Type for FormData, let browser/RN set it with boundary
  const isFormData = options.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  };

  // Add auth token if available
  if (authToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${authToken}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    // For void responses, we don't need to parse anything
    // Just return void if the response was successful
    return;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      undefined,
      error
    );
  }
};

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

export const clearAuthToken = () => {
  authToken = null;
};

// Base fetch wrapper
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log('🌐 [API Request]', {
    method: options.method || 'GET',
    url,
    API_BASE_URL,
    endpoint,
    hasBody: !!options.body
  });

  // Don't set Content-Type for FormData, let browser/RN set it with boundary
  const isFormData = options.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  };

  // Add auth token if available
  if (authToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${authToken}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle responses without content (204 No Content, 202 Accepted)
    if (response.status === 204 || response.status === 202) {
      return undefined as T;
    }

    // Get response text first to check if there's actual content
    const text = await response.text();

    // If no content, return undefined for void responses
    if (!text.trim()) {
      return undefined as T;
    }

    // Try to parse as JSON if there's content
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, check if it was expected to be JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Expected JSON but parsing failed - this is an error
        throw new ApiError(
          `JSON Parse error: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`,
          response.status,
          { originalText: text, contentType }
        );
      }

      // Not expected to be JSON, return the text
      return text as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle specific network errors
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        throw new ApiError(
          'No se puede conectar al servidor. Verifica que el backend esté corriendo en localhost:8080 y que CORS esté configurado correctamente.',
          0,
          { originalError: error.message }
        );
      }
      if (error.message.includes('CORS')) {
        throw new ApiError(
          'Error de CORS: El servidor no permite requests desde este origen. Configura CORS en el backend.',
          0,
          { originalError: error.message }
        );
      }
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Error de red desconocido'
    );
  }
};

// FormData request for file uploads
export const apiFormDataRequest = async <T = any>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method: 'POST', // Default method
    ...options, // This will override method if provided in options
    body: formData,
    headers: {
      ...options.headers,
      // Don't set Content-Type for FormData
    },
  };

  // Add auth token if available
  if (authToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${authToken}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error'
    );
  }
};

// Auth API
export const authApi = {
  signIn: (credentials: UserSignInDto): Promise<UserSignInResponseDto> =>
    apiRequest('/sign-in', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  signUp: (userData: UserSignUpDto): Promise<UserDto> =>
    apiRequest('/sign-up', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// User Management API
export const userApi = {
  getUser: (id: string): Promise<UserDto> =>
    apiRequest(`/users/${id}`),

  updateUser: async (userData: UserUpdateDto, image?: File): Promise<UserDto> => {
    const requestBody: any = { ...userData };

    // Convert image to base64 if provided
    if (image) {
      try {
        const base64Image = await fileToBase64(image);
        requestBody.image = base64Image;
      } catch (error) {
        throw new Error('Failed to process image');
      }
    }

    return apiRequest('/users', {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    });
  },

  deleteUser: (id: string): Promise<void> =>
    apiRequest(`/users/${id}`, { method: 'DELETE' }),

  searchUsers: (query: string): Promise<UserDto[]> =>
    apiRequest(`/users/search?q=${encodeURIComponent(query)}`),

  followUser: (followData: FollowUserDto): Promise<void> =>
    apiVoidRequest('/users/follow', {
      method: 'POST',
      body: JSON.stringify(followData),
    }),

  unfollowUser: (followData: FollowUserDto): Promise<void> =>
    apiVoidRequest('/users/unfollow', {
      method: 'POST',
      body: JSON.stringify(followData),
    }),

  getFollowers: (id: string): Promise<UserDto[]> =>
    apiRequest(`/users/${id}/followers`),

  getFollowing: (id: string): Promise<UserDto[]> =>
    apiRequest(`/users/${id}/following`),

  searchUsersByBooks: (searchData: SearchUsersByBooksDto): Promise<UserDto[]> =>
    apiRequest('/users/search-by-books', {
      method: 'POST',
      body: JSON.stringify(searchData),
    }),
};

// Book Management API
export const bookApi = {
  searchBooks: (query: string): Promise<BookDto[]> =>
    apiRequest(`/books/search?q=${encodeURIComponent(query)}`),

  getBookByIsbn: (isbn: string): Promise<BookDto> =>
    apiRequest(`/books/isbn/${isbn}`),

  getUserLibrary: (userId: string, params?: LibraryQueryParams): Promise<UserBookDto[]> => {
    const searchParams = new URLSearchParams();
    if (params?.favorites !== undefined) searchParams.append('favorites', params.favorites.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.wantsToExchange !== undefined) searchParams.append('wantsToExchange', params.wantsToExchange.toString());

    const queryString = searchParams.toString();
    return apiRequest(`/books/library/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  addBookToLibrary: (bookData: AddBookToLibraryDto): Promise<UserBookDto> =>
    apiRequest('/books/library', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  updateBookStatus: (bookId: string, statusData: UpdateStatusDto): Promise<UserBookDto> =>
    apiRequest(`/books/${bookId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),

  toggleBookFavorite: (bookId: string): Promise<UserBookDto> =>
    apiRequest(`/books/${bookId}/favorite`, { method: 'PUT' }),

  updateExchangePreference: (bookId: string, preferenceData: UpdateExchangePreferenceDto): Promise<UserBookDto> =>
    apiRequest(`/books/${bookId}/exchange`, {
      method: 'PUT',
      body: JSON.stringify(preferenceData),
    }),

  getBooksForExchange: (): Promise<UserBookDto[]> =>
    apiRequest('/books/exchange'),
};

// Scene Image Generation API
export interface SceneImageRequest {
  text: string;
  style?: string;
  seed?: number;
  returnBase64?: boolean;
  size?: string;
}

export interface SceneImageResponse {
  bookId: string;
  craftedPrompt: string;
  imageUrl?: string;
  imageBase64?: string;
  size: string;
  style?: string;
  seed?: number;
  createdAt: string;
}

export const sceneApi = {
  generateSceneImage: (bookId: string, request: SceneImageRequest): Promise<SceneImageResponse> =>
    apiRequest(`/api/books/${bookId}/scene-image`, {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  getBookSceneGenerations: (bookId: string): Promise<any[]> =>
    apiRequest(`/api/books/${bookId}/scene-generations`),

  getBookGenerationCount: (bookId: string): Promise<number> =>
    apiRequest(`/api/books/${bookId}/scene-generations/count`),
};

// Convenience function for generating scene images
export const generateSceneImage = async (params: {
  bookId: string;
  text: string;
  style?: string;
  seed?: number;
  returnBase64?: boolean;
  size?: string;
}): Promise<SceneImageResponse> => {
  const { bookId, ...request } = params;
  return sceneApi.generateSceneImage(bookId, {
    style: 'photorealistic',
    returnBase64: false,
    size: '4096x2048',
    ...request,
  });
};

// Book Exchange API
export const exchangeApi = {
  createExchange: (exchangeData: CreateBookExchangeDto): Promise<BookExchangeDto> =>
    apiRequest('/exchanges', {
      method: 'POST',
      body: JSON.stringify(exchangeData),
    }),

  getExchangeById: (exchangeId: string): Promise<BookExchangeDto> =>
    apiRequest(`/exchanges/${exchangeId}`),

  getUserExchanges: (userId: string, params?: ExchangeQueryParams): Promise<BookExchangeDto[]> => {
    const queryString = params?.status ? `?status=${params.status}` : '';
    return apiRequest(`/exchanges/users/${userId}${queryString}`);
  },

  getExchangesAsRequester: (userId: string): Promise<BookExchangeDto[]> =>
    apiRequest(`/exchanges/users/${userId}/as-requester`),

  getExchangesAsOwner: (userId: string): Promise<BookExchangeDto[]> =>
    apiRequest(`/exchanges/users/${userId}/as-owner`),

  getPendingExchangesCount: (userId: string): Promise<number> =>
    apiRequest(`/exchanges/users/${userId}/pending-count`),

  updateExchangeStatus: (
    exchangeId: string,
    userId: string,
    statusData: UpdateExchangeStatusDto
  ): Promise<BookExchangeDto> =>
    apiRequest(`/exchanges/${exchangeId}/status?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),

  createCounterOffer: (
    exchangeId: string,
    userId: string,
    counterOfferData: CounterOfferDto
  ): Promise<BookExchangeDto> => {
    const url = `/exchanges/${exchangeId}/counter-offer?userId=${userId}`;
    const body = JSON.stringify(counterOfferData);

    logger.info('🔄 [API] Creating counter offer - Request Details:', {
      fullUrl: `${API_BASE_URL}${url}`,
      method: 'PUT',
      userId,
      exchangeId,
    });

    logger.info('📦 [API] Counter Offer Body:', {
      counterOfferData,
      bodyString: body,
      bodyParsed: JSON.parse(body),
      ownerBookIds: counterOfferData.owner_book_ids,
      requesterBookIds: counterOfferData.requester_book_ids,
    });

    return apiRequest(url, {
      method: 'PUT',
      body,
    });
  },
};

// Posts API
export const postApi = {
  getPosts: (params?: PostsQueryParams): Promise<PostDto[]> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.communityId) searchParams.append('communityId', params.communityId);

    const queryString = searchParams.toString();
    return apiRequest(`/posts${queryString ? `?${queryString}` : ''}`);
  },

  createPost: async (postData: CreatePostDto, image?: File): Promise<PostDto> => {
    const requestBody: any = { ...postData };

    // Convert image to base64 if provided
    if (image) {
      try {
        const base64Image = await fileToBase64(image);
        requestBody.image = base64Image;
      } catch (error) {
        throw new Error('Failed to process image');
      }
    }

    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  getPostById: (postId: string): Promise<PostDto> =>
    apiRequest(`/posts/${postId}`),

  updatePost: (postId: string, postData: CreatePostDto): Promise<PostDto> =>
    apiRequest(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),

  deletePost: (postId: string): Promise<void> =>
    apiRequest(`/posts/${postId}`, { method: 'DELETE' }),
};

// Comments API
export const commentApi = {
  createComment: (commentData: CreateCommentDto): Promise<CommentDto> =>
    apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),

  getCommentById: (id: string): Promise<CommentDto> =>
    apiRequest(`/comments/${id}`),

  getCommentsByPostId: (postId: string): Promise<CommentDto[]> =>
    apiRequest(`/comments/post/${postId}`),

  getCommentsByUserId: (userId: string): Promise<CommentDto[]> =>
    apiRequest(`/comments/user/${userId}`),

  deleteComment: (id: string): Promise<void> =>
    apiRequest(`/comments/${id}`, { method: 'DELETE' }),
};

// Communities API
export const communityApi = {
  getAllCommunities: (): Promise<CommunityDto[]> =>
    apiRequest('/communities'),

  createCommunity: (communityData: CreateCommunityDto): Promise<CommunityDto> =>
    apiRequest('/communities', {
      method: 'POST',
      body: JSON.stringify(communityData),
    }),

  getCommunityById: (id: string): Promise<CommunityDto> =>
    apiRequest(`/communities/${id}`),

  getUserCommunities: (userId: string): Promise<CommunityDto[]> =>
    apiRequest(`/communities/user/${userId}`),

  searchCommunities: (query: string): Promise<CommunityDto[]> =>
    apiRequest(`/communities/search?q=${encodeURIComponent(query)}`),

  joinCommunity: (communityId: string): Promise<void> =>
    apiVoidRequest(`/communities/${communityId}/join`, { method: 'POST' }),

  leaveCommunity: (communityId: string): Promise<void> =>
    apiVoidRequest(`/communities/${communityId}/leave`, { method: 'DELETE' }),

  deleteCommunity: (communityId: string): Promise<void> =>
    apiVoidRequest(`/communities/${communityId}`, { method: 'DELETE' }),
};

// Reading Clubs API
export const readingClubApi = {
  getAllReadingClubs: (): Promise<ReadingClubDto[]> =>
    apiRequest('/reading-clubs'),

  createReadingClub: (clubData: CreateReadingClubDto): Promise<ReadingClubDto> =>
    apiRequest('/reading-clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    }),

  getReadingClubById: (id: string): Promise<ReadingClubDto> =>
    apiRequest(`/reading-clubs/${id}`),

  getReadingClubsByUserId: (userId: string): Promise<ReadingClubDto[]> =>
    apiRequest(`/reading-clubs/user/${userId}`),

  getReadingClubsByCommunityId: (communityId: string): Promise<ReadingClubDto[]> =>
    apiRequest(`/reading-clubs/community/${communityId}`),

  searchReadingClubs: (query: string): Promise<ReadingClubDto[]> =>
    apiRequest(`/reading-clubs/search?q=${encodeURIComponent(query)}`),

  joinReadingClub: (clubId: string): Promise<void> =>
    apiVoidRequest(`/reading-clubs/${clubId}/join`, { method: 'POST' }),

  leaveReadingClub: (clubId: string): Promise<void> =>
    apiVoidRequest(`/reading-clubs/${clubId}/leave`, { method: 'POST' }),

  deleteReadingClub: (clubId: string): Promise<void> =>
    apiVoidRequest(`/reading-clubs/${clubId}`, { method: 'DELETE' }),
};

// Gamification API
export const gamificationApi = {
  getUserProfile: (userId: string): Promise<GamificationProfileDto> =>
    apiRequest(`/gamification/profile/${userId}`),

  initializeUserProfile: (userId: string): Promise<GamificationProfileDto> =>
    apiRequest(`/gamification/profile/${userId}/initialize`, { method: 'POST' }),

  deleteUserGamificationData: (userId: string): Promise<string> =>
    apiRequest(`/gamification/profile/${userId}/cleanup`, { method: 'DELETE' }),

  getAllUserLevels: (): Promise<UserLevelDto[]> =>
    apiRequest('/gamification/levels'),

  getAllAchievements: (): Promise<AchievementDto[]> =>
    apiRequest('/gamification/achievements'),

  getUserAchievements: (userId: string): Promise<UserAchievementDto[]> =>
    apiRequest(`/gamification/achievements/${userId}`),

  getUnnotifiedAchievements: (userId: string): Promise<UserAchievementDto[]> =>
    apiRequest(`/gamification/achievements/${userId}/unnotified`),

  checkAndAwardAchievements: (userId: string): Promise<UserAchievementDto[]> =>
    apiRequest(`/gamification/achievements/${userId}/check`, { method: 'POST' }),

  markAchievementsAsNotified: (userId: string, achievementIds: string[]): Promise<void> =>
    apiRequest(`/gamification/achievements/${userId}/mark-notified`, {
      method: 'PUT',
      body: JSON.stringify(achievementIds),
    }),

  getAllGamificationActivities: (): Promise<GamificationActivityDto[]> =>
    apiRequest('/gamification/activities'),
};

// Export all APIs as a single object for easy importing
export const api = {
  auth: authApi,
  user: userApi,
  book: bookApi,
  exchange: exchangeApi,
  post: postApi,
  comment: commentApi,
  community: communityApi,
  readingClub: readingClubApi,
  gamification: gamificationApi,
  scene: sceneApi,
};

export default api;