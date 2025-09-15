/**
 * LiveKit Configuration
 * 
 * Replace these values with your actual LiveKit server configuration
 */

// Your LiveKit server URL
// Get this from your LiveKit Cloud dashboard or self-hosted server
export const LIVEKIT_URL = 'wss://booky-rru3jofi.livekit.cloud';

// Alternative URLs for different environments
export const LIVEKIT_CONFIG = {
  development: 'wss://booky-rru3jofi.livekit.cloud',
  production: 'wss://your-prod-livekit-server.livekit.cloud',
};

// Get the appropriate URL based on environment
export const getLiveKitUrl = (): string => {
  // You can add environment detection logic here
  // For now, return the main URL
  return LIVEKIT_URL;
};

export default {
  url: LIVEKIT_URL,
  config: LIVEKIT_CONFIG,
  getLiveKitUrl,
};
