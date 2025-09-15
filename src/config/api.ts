/**
 * API Configuration
 * Centralized configuration for all API endpoints and base URLs
 */

import { ENV_CONFIG, CURRENT_ENV } from './environment';

// Current environment's base URL from environment config
export const API_BASE_URL = ENV_CONFIG.apiBaseUrl;

// API Endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  
  // Communities
  communities: {
    base: '/communities',
    byId: (id: string) => `/communities/${id}`,
    join: (id: string) => `/communities/${id}/join`,
    leave: (id: string) => `/communities/${id}/leave`,
  },
  
  // Posts
  posts: {
    base: '/posts',
    byId: (id: string) => `/posts/${id}`,
    byCommunity: (communityId: string) => `/posts?communityId=${communityId}`,
  },
  
  // Reading Clubs
  readingClubs: {
    base: '/reading-clubs',
    byId: (id: string) => `/reading-clubs/${id}`,
    byCommunity: (communityId: string) => `/reading-clubs?communityId=${communityId}`,
    join: (id: string) => `/reading-clubs/${id}/join`,
    updateMeeting: (id: string) => `/reading-clubs/${id}/meeting`,
  },
  
  // Books
  books: {
    base: '/books',
    search: '/books/search',
    byIsbn: (isbn: string) => `/books/isbn/${isbn}`,
    library: '/books/library',
    exchange: '/books/exchange',
  },
  
  // Users
  users: {
    base: '/users',
    profile: '/users/profile',
    byId: (id: string) => `/users/${id}`,
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get endpoint with parameters
export const getEndpoint = {
  community: (id: string) => API_ENDPOINTS.communities.byId(id),
  post: (id: string) => API_ENDPOINTS.posts.byId(id),
  readingClub: (id: string) => API_ENDPOINTS.readingClubs.byId(id),
  book: (isbn: string) => API_ENDPOINTS.books.byIsbn(isbn),
  user: (id: string) => API_ENDPOINTS.users.byId(id),
} as const;

// Export current environment for debugging
export { CURRENT_ENV } from './environment';

// Default export with main configuration
export default {
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  environment: CURRENT_ENV,
  buildUrl: buildApiUrl,
  get: getEndpoint,
};
