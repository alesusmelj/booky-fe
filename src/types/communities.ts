// Types generated from Swagger API for Communities

export interface CommunityDto {
  id: string;
  date_created: string;
  description: string;
  name: string;
  admin_id: string;
  admin: UserPreviewDto;
  member_count: number;
}

export interface UserPreviewDto {
  id: string;
  username: string;
  name: string;
  lastname: string;
  image?: string;
}

export interface CreateCommunityDto {
  name: string;
  description: string;
}

// API Response types
export interface GetCommunitiesResponse {
  communities: CommunityDto[];
}

export interface GetCommunityByIdResponse {
  community: CommunityDto;
}

// Error response type
export interface ApiError {
  message: string;
  statusCode: number;
}
