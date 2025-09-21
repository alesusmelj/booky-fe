import { logger } from '../utils/logger';
import { API_BASE_URL } from '../config/api';
import { getAuthToken, apiRequest } from './api';
import { uriToBase64 } from '../utils';

export interface AddressDto {
  id?: string;
  state?: string;
  country?: string;
  longitude?: number;
  latitude?: number;
}

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

export interface UserUpdateDto {
  id?: string;
  name?: string;
  lastname?: string;
  description?: string;
  address?: AddressDto;
  image?: string; // Base64 encoded image
}

export class UsersService {

  /**
   * Update user profile with optional image
   * Uses JSON body with base64 encoded image
   */
  static async updateUserProfile(userData: UserUpdateDto, imageUri?: string): Promise<UserDto> {
    try {
      logger.info('👤 Updating user profile:', { userData, hasImage: !!imageUri });

      // Clean user object (remove undefined fields)
      const userObject: UserUpdateDto = {
        id: userData.id,
        name: userData.name,
        lastname: userData.lastname,
        description: userData.description,
      };
      Object.keys(userObject).forEach((k) => {
        const key = k as keyof typeof userObject;
        if (userObject[key] === undefined) delete userObject[key];
      });

      // Convert image to base64 if provided
      if (imageUri) {
        try {
          logger.info('📸 Converting profile image to base64...', {
            imageUri: imageUri.substring(0, 50) + '...'
          });

          const base64Image = await uriToBase64(imageUri);
          userObject.image = base64Image;

          logger.info('✅ Profile image converted to base64 successfully', {
            base64Length: base64Image.length,
            base64Preview: base64Image.substring(0, 50) + '...'
          });
        } catch (error) {
          logger.error('❌ Error converting profile image to base64:', error);
          logger.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            imageUri: imageUri
          });
          throw new Error('Failed to process image');
        }
      }

      logger.info('📋 USER OBJECT:', { ...userObject, image: userObject.image ? '[base64 data]' : undefined });

      // Use apiRequest with JSON body
      const result = await apiRequest('/users', {
        method: 'PUT',
        body: JSON.stringify(userObject),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      logger.info('✅ User profile updated successfully:', result);
      return result;
    } catch (error) {
      logger.error('❌ Error updating user profile:', error);
      throw error;
    }
  }



  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserDto> {
    try {
      logger.info('👤 Getting user by ID:', userId);

      const response = await apiRequest(`/users/${userId}`);

      logger.info('✅ User retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting user:', error);
      throw error;
    }
  }
}

export default UsersService;