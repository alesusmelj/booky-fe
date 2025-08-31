import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken } from './api';
import { logger } from '../utils/logger';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SETTINGS: 'app_settings',
} as const;

// Generic storage functions
export const storage = {
  // Set item in storage
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      logger.error(`Error setting storage item ${key}:`, error);
      throw error;
    }
  },

  // Get item from storage
  getItem: async <T = any>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      logger.error(`Error getting storage item ${key}:`, error);
      return null;
    }
  },

  // Remove item from storage
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error(`Error removing storage item ${key}:`, error);
      throw error;
    }
  },

  // Clear all storage
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Get all keys
  getAllKeys: async (): Promise<readonly string[]> => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      logger.error('Error getting all storage keys:', error);
      return [];
    }
  },
};

// Auth-specific storage functions
export const authStorage = {
  // Save auth token
  saveToken: async (token: string): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    setAuthToken(token);
  },

  // Get auth token
  getToken: async (): Promise<string | null> => {
    return await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Remove auth token
  removeToken: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    clearAuthToken();
  },

  // Initialize auth token on app start
  initializeToken: async (): Promise<void> => {
    const token = await authStorage.getToken();
    if (token) {
      setAuthToken(token);
    }
  },
};

// User data storage functions
export const userStorage = {
  // Save user data
  saveUser: async (userData: any): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
  },

  // Get user data
  getUser: async (): Promise<any | null> => {
    return await storage.getItem(STORAGE_KEYS.USER_DATA);
  },

  // Remove user data
  removeUser: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

// App settings storage functions
export const settingsStorage = {
  // Save app settings
  saveSettings: async (settings: any): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  // Get app settings
  getSettings: async (): Promise<any | null> => {
    return await storage.getItem(STORAGE_KEYS.SETTINGS);
  },

  // Remove app settings
  removeSettings: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};