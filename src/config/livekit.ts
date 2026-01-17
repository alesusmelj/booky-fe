/**
 * LiveKit Configuration
 * 
 * Replace these values with your actual LiveKit server configuration
 */

// Your LiveKit server URL
export const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_WS_URL || 'wss://booky-rru3jofi.livekit.cloud';

// Alternative URLs for different environments
export const LIVEKIT_CONFIG = {
  development: LIVEKIT_URL,
  production: 'wss://your-prod-livekit-server.livekit.cloud',
};

// Get the appropriate URL based on environment
export const getLiveKitUrl = (): string => {
  return LIVEKIT_URL;
};

export default {
  url: LIVEKIT_URL,
  config: LIVEKIT_CONFIG,
  getLiveKitUrl,
};
