import { useState, useCallback } from 'react';
import { 
  GamificationService, 
  GamificationProfileDto, 
  AchievementDto, 
  UserAchievementDto, 
  UserLevelDto, 
  GamificationActivityDto 
} from '../services/gamificationService';
import { logger } from '../utils/logger';

export const useGamification = () => {
  const [profile, setProfile] = useState<GamificationProfileDto | null>(null);
  const [achievements, setAchievements] = useState<AchievementDto[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievementDto[]>([]);
  const [unnotifiedAchievements, setUnnotifiedAchievements] = useState<UserAchievementDto[]>([]);
  const [userLevels, setUserLevels] = useState<UserLevelDto[]>([]);
  const [activities, setActivities] = useState<GamificationActivityDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🎮 Getting gamification profile:', userId);

      const result = await GamificationService.getUserProfile(userId);
      setProfile(result);
      
      logger.info('✅ Gamification profile retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get gamification profile';
      setError(errorMessage);
      logger.error('❌ Get gamification profile failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeUserProfile = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🎮 Initializing gamification profile:', userId);

      const result = await GamificationService.initializeUserProfile(userId);
      setProfile(result);
      
      logger.info('✅ Gamification profile initialized');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize gamification profile';
      setError(errorMessage);
      logger.error('❌ Initialize gamification profile failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🏆 Getting all achievements');

      const result = await GamificationService.getAllAchievements();
      setAchievements(result);
      
      logger.info('✅ All achievements retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all achievements';
      setError(errorMessage);
      logger.error('❌ Get all achievements failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserAchievements = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🏆 Getting user achievements:', userId);

      const result = await GamificationService.getUserAchievements(userId);
      setUserAchievements(result);
      
      logger.info('✅ User achievements retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user achievements';
      setError(errorMessage);
      logger.error('❌ Get user achievements failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnnotifiedAchievements = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🔔 Getting unnotified achievements:', userId);

      const result = await GamificationService.getUnnotifiedAchievements(userId);
      setUnnotifiedAchievements(result);
      
      logger.info('✅ Unnotified achievements retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get unnotified achievements';
      setError(errorMessage);
      logger.error('❌ Get unnotified achievements failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAndAwardAchievements = useCallback(async (userId: string): Promise<UserAchievementDto[]> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🎯 Checking and awarding achievements:', userId);

      const result = await GamificationService.checkAndAwardAchievements(userId);
      
      // Update unnotified achievements
      setUnnotifiedAchievements(prev => [...prev, ...result]);
      
      logger.info('✅ Achievement check completed');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check achievements';
      setError(errorMessage);
      logger.error('❌ Check achievements failed:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const markAchievementsAsNotified = useCallback(async (userId: string, achievementIds: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('✅ Marking achievements as notified:', { userId, achievementIds });

      await GamificationService.markAchievementsAsNotified(userId, achievementIds);
      
      // Remove from unnotified achievements
      setUnnotifiedAchievements(prev => 
        prev.filter(achievement => !achievementIds.includes(achievement.id))
      );
      
      logger.info('✅ Achievements marked as notified');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark achievements as notified';
      setError(errorMessage);
      logger.error('❌ Mark achievements as notified failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllUserLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('📊 Getting all user levels');

      const result = await GamificationService.getAllUserLevels();
      setUserLevels(result);
      
      logger.info('✅ All user levels retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all user levels';
      setError(errorMessage);
      logger.error('❌ Get all user levels failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllGamificationActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🎯 Getting all gamification activities');

      const result = await GamificationService.getAllGamificationActivities();
      setActivities(result);
      
      logger.info('✅ All gamification activities retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all gamification activities';
      setError(errorMessage);
      logger.error('❌ Get all gamification activities failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async (userId: string) => {
    await Promise.all([
      getUserProfile(userId),
      getUserAchievements(userId),
      getUnnotifiedAchievements(userId),
    ]);
  }, [getUserProfile, getUserAchievements, getUnnotifiedAchievements]);

  return {
    profile,
    achievements,
    userAchievements,
    unnotifiedAchievements,
    userLevels,
    activities,
    loading,
    error,
    getUserProfile,
    initializeUserProfile,
    getAllAchievements,
    getUserAchievements,
    getUnnotifiedAchievements,
    checkAndAwardAchievements,
    markAchievementsAsNotified,
    getAllUserLevels,
    getAllGamificationActivities,
    refresh,
  };
};

export default useGamification;
