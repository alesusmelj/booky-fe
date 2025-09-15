import { apiRequest } from './api';
import { logger } from '../utils/logger';

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

export interface UserLevelDto {
  level: number;
  name: string;
  description: string;
  min_points: number;
  max_points: number;
  badge: string;
  color: string;
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

export class GamificationService {
  /**
   * Get user gamification profile
   */
  static async getUserProfile(userId: string): Promise<GamificationProfileDto> {
    try {
      logger.info('🎮 Getting gamification profile for user:', userId);
      
      const response = await apiRequest(`/gamification/profile/${userId}`);
      
      logger.info('✅ Gamification profile retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting gamification profile:', error);
      throw error;
    }
  }

  /**
   * Initialize user gamification profile
   */
  static async initializeUserProfile(userId: string): Promise<GamificationProfileDto> {
    try {
      logger.info('🎮 Initializing gamification profile for user:', userId);
      
      const response = await apiRequest(`/gamification/profile/${userId}/initialize`, {
        method: 'POST',
      });
      
      logger.info('✅ Gamification profile initialized successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error initializing gamification profile:', error);
      throw error;
    }
  }

  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<AchievementDto[]> {
    try {
      logger.info('🏆 Getting all achievements');
      
      const response = await apiRequest('/gamification/achievements');
      
      logger.info('✅ All achievements retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting all achievements:', error);
      throw error;
    }
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(userId: string): Promise<UserAchievementDto[]> {
    try {
      logger.info('🏆 Getting user achievements for user:', userId);
      
      const response = await apiRequest(`/gamification/achievements/${userId}`);
      
      logger.info('✅ User achievements retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting user achievements:', error);
      throw error;
    }
  }

  /**
   * Get unnotified achievements
   */
  static async getUnnotifiedAchievements(userId: string): Promise<UserAchievementDto[]> {
    try {
      logger.info('🔔 Getting unnotified achievements for user:', userId);
      
      const response = await apiRequest(`/gamification/achievements/${userId}/unnotified`);
      
      logger.info('✅ Unnotified achievements retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting unnotified achievements:', error);
      throw error;
    }
  }

  /**
   * Check and award achievements
   */
  static async checkAndAwardAchievements(userId: string): Promise<UserAchievementDto[]> {
    try {
      logger.info('🎯 Checking and awarding achievements for user:', userId);
      
      const response = await apiRequest(`/gamification/achievements/${userId}/check`, {
        method: 'POST',
      });
      
      logger.info('✅ Achievement check completed successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * Mark achievements as notified
   */
  static async markAchievementsAsNotified(userId: string, achievementIds: string[]): Promise<void> {
    try {
      logger.info('✅ Marking achievements as notified:', { userId, achievementIds });
      
      await apiRequest(`/gamification/achievements/${userId}/mark-notified`, {
        method: 'PUT',
        body: JSON.stringify(achievementIds),
      });
      
      logger.info('✅ Achievements marked as notified successfully');
    } catch (error) {
      logger.error('❌ Error marking achievements as notified:', error);
      throw error;
    }
  }

  /**
   * Get all user levels
   */
  static async getAllUserLevels(): Promise<UserLevelDto[]> {
    try {
      logger.info('📊 Getting all user levels');
      
      const response = await apiRequest('/gamification/levels');
      
      logger.info('✅ All user levels retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting all user levels:', error);
      throw error;
    }
  }

  /**
   * Get all gamification activities
   */
  static async getAllGamificationActivities(): Promise<GamificationActivityDto[]> {
    try {
      logger.info('🎯 Getting all gamification activities');
      
      const response = await apiRequest('/gamification/activities');
      
      logger.info('✅ All gamification activities retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting all gamification activities:', error);
      throw error;
    }
  }
}

export default GamificationService;
