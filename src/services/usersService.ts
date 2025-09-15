import { logger } from '../utils/logger';
import { API_BASE_URL } from '../config/api';
import { getAuthToken, apiRequest } from './api';

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
}

export class UsersService {

  /**
   * Update user profile with optional image
   * Specifically designed for Spring Boot @RequestPart endpoint
   */
  static async updateUserProfile(userData: UserUpdateDto, imageUri?: string): Promise<UserDto> {
    try {
      logger.info('👤 Updating user profile:', { userData, hasImage: !!imageUri });

      // Clean user object (remove undefined fields)
      const userObject: Partial<UserUpdateDto> = {
        id: userData.id,
        name: userData.name,
        lastname: userData.lastname,
        description: userData.description,
      };
      Object.keys(userObject).forEach((k) => {
        const key = k as keyof typeof userObject;
        if (userObject[key] === undefined) delete userObject[key];
      });

      logger.info('📋 USER OBJECT:', userObject);

      // Create FormData for multipart request
      const formData = new FormData();

      // Add user part with proper Content-Type
      try {
        // Try File constructor first (best for web environments)
        const userFile = new File([JSON.stringify(userObject)], 'user.json', {
          type: 'application/json'
        });
        formData.append('user', userFile);
        logger.info('✅ User part added as File with application/json');
      } catch (fileError) {
        try {
          // Fallback to Blob (web environments)
          const userBlob = new Blob([JSON.stringify(userObject)], {
            type: 'application/json'
          });
          formData.append('user', userBlob, 'user.json');
          logger.info('✅ User part added as Blob with application/json');
        } catch (blobError) {
          // Final fallback: plain string (may not work with Spring Boot)
          logger.warn('⚠️ File/Blob not available, using string fallback');
          formData.append('user', JSON.stringify(userObject));
        }
      }

      // Add image if provided
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
        const mime =
          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
            : ext === 'png' ? 'image/png'
              : ext === 'webp' ? 'image/webp'
                : 'image/jpeg';

        logger.info('📋 IMAGE FILE:', { filename, type: mime, uri: imageUri });

        // React Native FormData format for files
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type: mime,
        } as any);

        logger.info('✅ Image part added to FormData');
      }

      // Use apiRequest with FormData (it now detects FormData automatically)
      const result = await apiRequest('/users', {
        method: 'PUT',
        body: formData,
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