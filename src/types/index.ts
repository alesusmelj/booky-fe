// Legacy types - kept for backward compatibility
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Export all API types
export * from './api';

// Export communities types (excluding duplicates)
export type { 
  GetCommunitiesResponse,
  GetCommunityByIdResponse,
  ApiError as CommunitiesApiError
} from './communities';
