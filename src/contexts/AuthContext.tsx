import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserDto, UserSignInDto, UserSignUpDto } from '../types/api';
import { authApi } from '../services/api';
import { authStorage, userStorage } from '../services/storage';
import { logger } from '../utils/logger';

export interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (credentials: UserSignInDto) => Promise<void>;
  signUp: (userData: UserSignUpDto) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Initialize token in API client
      await authStorage.initializeToken();
      
      // Get stored user data and token
      const [storedUser, storedToken] = await Promise.all([
        userStorage.getUser(),
        authStorage.getToken(),
      ]);

      if (storedUser && storedToken) {
        setState({
          user: storedUser,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      logger.error('Failed to initialize auth:', error);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  };

  const signIn = async (credentials: UserSignInDto) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      logger.info('Attempting to sign in with credentials:', credentials.email);
      const response = await authApi.signIn(credentials);
      logger.info('Sign in API response received:', response);
      
      // Validate response structure
      if (!response.token) {
        logger.error('Missing token in sign in response:', response);
        throw new Error('Invalid response: missing token');
      }
      
      if (!response.user) {
        logger.error('Missing user in sign in response:', response);
        throw new Error('Invalid response: missing user');
      }
      
      logger.info('Storing authentication data...');
      // Store token and user data
      await Promise.all([
        authStorage.saveToken(response.token),
        userStorage.saveUser(response.user),
      ]);

      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      logger.error('Sign in failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const signUp = async (userData: UserSignUpDto) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authApi.signUp(userData);

      // After successful signup, automatically sign in
      await signIn({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Clear stored data
      await Promise.all([
        authStorage.removeToken(),
        userStorage.removeUser(),
      ]);

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      logger.error('Failed to sign out:', error);
      // Even if clearing storage fails, clear the state
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const refreshUser = async () => {
    if (!state.user?.id) return;

    try {
      // You would typically have a refresh endpoint or get user endpoint
      // For now, we'll just keep the existing user data
      // In a real app, you might call: const updatedUser = await userApi.getUser(state.user.id);
      logger.info('User refresh not implemented yet');
    } catch (error) {
      logger.error('Failed to refresh user:', error);
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};