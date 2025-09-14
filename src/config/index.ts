/**
 * Configuration Index
 * Central export for all configuration modules
 */

// API Configuration
export {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  getEndpoint,
  CURRENT_ENV as API_CURRENT_ENV,
} from './api';

// Environment Configuration
export {
  getCurrentEnvironment,
  environmentConfig,
  CURRENT_ENV,
  ENV_CONFIG,
  isDevelopment,
  isStaging,
  isProduction,
} from './environment';

// Default API config export
export { default as apiConfig } from './api';

// Default environment config export
export { default as envConfig } from './environment';

// Combined configuration object
export const config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: ENV_CONFIG.apiTimeout,
    enableLogging: ENV_CONFIG.enableLogging,
  },
  environment: CURRENT_ENV,
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
} as const;

// Re-export for convenience
import { API_BASE_URL } from './api';
import { ENV_CONFIG, CURRENT_ENV, isDevelopment, isProduction } from './environment';
