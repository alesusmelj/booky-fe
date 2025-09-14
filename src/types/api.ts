// API Types based on OpenAPI specification

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Address Types
export interface AddressDto {
  id: string;
  state: string;
  country: string;
  longitude: number;
  latitude: number;
}

// User Types
export interface UserDto {
  id: string;
  username: string;
  email: string;
  name: string;
  lastname: string;
  description?: string;
  image?: string;
  address?: AddressDto;
  date_created: string;
}

export interface UserPreviewDto {
  id: string;
  username: string;
  name: string;
  lastname: string;
  image?: string;
}

export interface UserUpdateDto {
  id: string;
  name?: string;
  lastname?: string;
  description?: string;
  address?: AddressDto;
}

export interface UserSignUpDto {
  username: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface UserSignInDto {
  email: string;
  password: string;
}

export interface UserSignInResponseDto {
  token: string;
  user: UserDto;
}

export interface FollowUserDto {
  target_user_id: string;
}

export interface SearchUsersByBooksDto {
  book_ids: string[];
}

// Book Types
export enum BookStatus {
  WISHLIST = 'WISHLIST',
  READING = 'READING',
  TO_READ = 'TO_READ',
  READ = 'READ',
}

export interface BookDto {
  id: string;
  isbn: string;
  title: string;
  overview?: string;
  synopsis?: string;
  pages?: number;
  edition?: string;
  publisher?: string;
  author: string;
  image?: string;
  rate?: number;
  categories: string[];
}

export interface UserBookDto {
  id: string;
  user_id: string;
  status: BookStatus;
  favorite: boolean;
  wants_to_exchange: boolean;
  book: BookDto;
}

export interface AddBookToLibraryDto {
  isbn: string;
  status: BookStatus;
}

export interface UpdateStatusDto {
  status: BookStatus;
}

export interface UpdateExchangePreferenceDto {
  wants_to_exchange: boolean;
}

// Exchange Types
export enum ExchangeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTERED = 'COUNTERED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface BookExchangeDto {
  id: string;
  requester_id: string;
  owner_id: string;
  status: ExchangeStatus;
  date_created: string;
  date_updated: string;
  owner_book_ids: string[];
  requester_book_ids: string[];
  owner_books: UserBookDto[];
  requester_books: UserBookDto[];
  requester: UserPreviewDto;
  owner: UserPreviewDto;
}

export interface CreateBookExchangeDto {
  owner_id: string;
  requester_id: string;
  owner_book_ids: string[];
  requester_book_ids: string[];
}

export interface UpdateExchangeStatusDto {
  status: ExchangeStatus;
}

export interface CounterOfferDto {
  owner_book_ids: string[];
  requester_book_ids: string[];
}

// Community Types
export interface CommunityDto {
  id: string;
  date_created: string;
  description: string;
  name: string;
  admin_id: string;
  admin: UserPreviewDto;
  member_count: number;
  join_available: boolean;
}

export interface CreateCommunityDto {
  name: string;
  description: string;
}

// Post Types
export interface PostDto {
  id: string;
  body: string;
  date_created: string;
  image?: string;
  user_id: string;
  community_id?: string;
  user: UserPreviewDto;
  community?: CommunityDto;
}

export interface CreatePostDto {
  body: string;
  community_id?: string;
}

// Comment Types
export interface CommentDto {
  id: string;
  body: string;
  date_created: string;
  user_id: string;
  post_id: string;
  user: UserPreviewDto;
}

export interface CreateCommentDto {
  body: string;
  post_id: string;
}

// Reading Club Types
export interface ReadingClubDto {
  id: string;
  date_created: string;
  description?: string;
  last_updated: string;
  name: string;
  book_id: string;
  community_id: string;
  moderator_id: string;
  book: BookDto;
  community: CommunityDto;
  moderator: UserPreviewDto;
  member_count: number;
  join_available: boolean;
  next_meeting?: string;
  current_chapter?: number;
}

export interface CreateReadingClubDto {
  name: string;
  description?: string;
  community_id: string;
  book_id: string;
}

// Gamification Types
export interface UserLevelDto {
  level: number;
  name: string;
  description: string;
  min_points: number;
  max_points: number;
  badge: string;
  color: string;
}

export interface AchievementDto {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  required_value: number;
  condition: string;
  points_reward: number;
  active: boolean;
}

export interface UserAchievementDto {
  id: string;
  user_id: string;
  achievement_id: string;
  date_earned: string;
  notified: boolean;
  achievement: AchievementDto;
}

export interface GamificationProfileDto {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  books_read: number;
  exchanges_completed: number;
  posts_created: number;
  comments_created: number;
  communities_joined: number;
  communities_created: number;
  reading_clubs_joined: number;
  reading_clubs_created: number;
  last_activity: string;
  date_created: string;
  user_level: UserLevelDto;
  achievements: UserAchievementDto[];
  points_to_next_level: number;
}

export interface GamificationActivityDto {
  name: string;
  points: number;
  description: string;
}

// Query Parameters
export interface PostsQueryParams {
  type?: 'feed' | 'general';
  userId?: string;
  communityId?: string;
}

export interface LibraryQueryParams {
  favorites?: boolean;
  status?: BookStatus;
  wantsToExchange?: boolean;
}

export interface ExchangeQueryParams {
  status?: ExchangeStatus;
}