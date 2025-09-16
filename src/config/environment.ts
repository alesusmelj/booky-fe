/**
 * Environment Configuration
 * Manages different environment settings and variables
 */

export type Environment = 'development' | 'staging' | 'production';

// Get current environment from process.env or default to development
export const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV as Environment;

  // Validate environment
  if (['development', 'staging', 'production'].includes(env)) {
    return env;
  }

  // Default to development if invalid or undefined
  return 'development';
};

// "https://booky-be.fly.dev"
// "http://localhost:8080"
// Environment-specific configurations
export const environmentConfig = {
  development: {
    apiBaseUrl: "http://localhost:8080",
    enableLogging: true,
    enableMockData: false,
    apiTimeout: 10000, // 10 seconds
  },
  staging: {
    apiBaseUrl: 'https://api-staging.booky.com',
    enableLogging: true,
    enableMockData: false,
    apiTimeout: 15000, // 15 seconds
  },
  production: {
    apiBaseUrl: 'https://api.booky.com',
    enableLogging: false,
    enableMockData: false,
    apiTimeout: 20000, // 20 seconds
  },
} as const;

// Current environment
export const CURRENT_ENV = getCurrentEnvironment();

// Current environment configuration
export const ENV_CONFIG = environmentConfig[CURRENT_ENV];

// Helper functions
export const isDevelopment = () => CURRENT_ENV === 'development';
export const isStaging = () => CURRENT_ENV === 'staging';
export const isProduction = () => CURRENT_ENV === 'production';

// Export for easy access
export default {
  current: CURRENT_ENV,
  config: ENV_CONFIG,
  isDev: isDevelopment(),
  isStaging: isStaging(),
  isProd: isProduction(),
};
