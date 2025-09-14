/**
 * Temporary LiveKit Token Generator for Testing
 * This should be replaced with proper backend token generation
 */

import { logger } from '../utils/logger';

// These should match your LiveKit server configuration
const LIVEKIT_API_KEY = 'APIQTZk4A9komWw'; // From the JWT you showed
const LIVEKIT_API_SECRET = 'your-secret-here'; // You need to get this from LiveKit dashboard

export interface LiveKitTokenClaims {
  room: string;
  roomJoin: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
}

/**
 * Generate a LiveKit JWT token locally (for testing only)
 * In production, this should be done on the backend
 */
export function generateLiveKitToken(
  identity: string,
  name: string,
  roomName: string,
  claims: LiveKitTokenClaims = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  }
): string {
  try {
    // JWT Header
    const header = {
      typ: 'JWT',
      alg: 'HS256'
    };

    // JWT Payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: identity,
      iss: LIVEKIT_API_KEY,
      name: name,
      video: claims,
      exp: now + (60 * 60), // 1 hour from now
      jti: identity,
      iat: now,
    };

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');

    // Create signature (simplified - in real implementation you'd use proper HMAC-SHA256)
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${LIVEKIT_API_SECRET}`).replace(/=/g, '');

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    logger.info('🎯 Generated LiveKit token locally');
    logger.info('📋 Token payload:', payload);
    
    return token;
    
  } catch (error) {
    logger.error('❌ Error generating LiveKit token:', error);
    throw error;
  }
}

/**
 * Generate token for testing purposes
 */
export function generateTestToken(readingClubId: string, participantName: string, userId: string) {
  const roomName = `reading-club-${readingClubId}`;
  
  return {
    token: generateLiveKitToken(userId, participantName, roomName),
    room_name: roomName,
    participant_name: participantName,
  };
}
