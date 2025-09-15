import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { colors } from '../constants';
import { logger } from '../utils/logger';
import { LiveKitService, LiveKitToken } from '../services/liveKitService';
import { useAuth } from '../contexts/AuthContext';
import { getLiveKitUrl } from '../config/livekit';

// For Expo managed workflow, we'll use a mock implementation
// In production, you'd need to eject to bare workflow or use EAS Build
import { Room, Track } from 'livekit-client';

interface VideoCallRoomProps {
  readingClubId: string;
  onClose: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  readingClubId,
  onClose,
}) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(true);
  const [token, setToken] = useState<LiveKitToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [room] = useState(() => new Room());

  // Mock LiveKit hooks for Expo managed workflow
  const [participants, setParticipants] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  
  // Mock connection state
  const [isConnected, setIsConnected] = useState(false);

  const connectToRoom = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      logger.info('Connecting to video call for reading club:', readingClubId);

      // Get LiveKit token
      const tokenData = await LiveKitService.getToken({
        reading_club_id: readingClubId,
        participant_name: `${user.name} ${user.lastname || ''}`.trim(),
      });

      logger.info('🎯 Token data received:', tokenData);

      // Validate token data
      if (!tokenData || !tokenData.token) {
        throw new Error('Invalid token data received from server');
      }

      if (!tokenData.room_name) {
        logger.warn('⚠️ No room_name in token data, using fallback');
        tokenData.room_name = `reading-club-${readingClubId}`;
      }

      setToken(tokenData);

      // Mock connection for Expo managed workflow
      logger.info('🔧 Mock connection to LiveKit room:', tokenData.room_name);
      logger.warn('⚠️ Using mock implementation - LiveKit native features not available in Expo managed workflow');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock participants (including current user)
      const mockParticipants = [
        {
          identity: user.id,
          name: `${user.name} ${user.lastname || ''}`.trim(),
          isLocal: true,
        },
        // Add more mock participants if needed for testing
      ];
      
      setParticipants(mockParticipants);
      setIsConnected(true);
      logger.info('✅ Mock connection established with', mockParticipants.length, 'participants');
      setIsConnecting(false);

    } catch (err) {
      logger.error('Error connecting to video call:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
      Alert.alert('Connection Error', 'Failed to connect to video call');
    }
  }, [readingClubId, user]);

  const disconnectFromRoom = useCallback(async () => {
    try {
      logger.info('Disconnecting from video call');
      setIsConnected(false);
      setParticipants([]);
      setToken(null);
    } catch (err) {
      logger.error('Error disconnecting:', err);
    }
  }, []);

  // Mock state for controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    logger.info('🎤 Microphone toggled:', !isMuted ? 'muted' : 'unmuted');
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(!isVideoEnabled);
    logger.info('📹 Camera toggled:', !isVideoEnabled ? 'disabled' : 'enabled');
  }, [isVideoEnabled]);

  const handleLeave = useCallback(async () => {
    await disconnectFromRoom();
    onClose();
  }, [disconnectFromRoom, onClose]);

  useEffect(() => {
    connectToRoom();

    return () => {
      disconnectFromRoom();
    };
  }, [connectToRoom, disconnectFromRoom]);

  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Connecting to meeting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={connectToRoom}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reading Club Meeting</Text>
        <TouchableOpacity onPress={handleLeave} style={styles.headerCloseButton}>
          <Text style={styles.headerCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Video Container */}
      <View style={styles.videoContainer}>
        {/* Main video view - placeholder for now */}
        <View style={styles.mainVideoView}>
          <View style={styles.placeholderVideo}>
            <Text style={styles.placeholderText}>📹</Text>
            <Text style={styles.placeholderSubtext}>
              {isConnected ? 'Connected to meeting' : 'Connecting...'}
            </Text>
          </View>
        </View>

        {/* Participants thumbnails */}
        <View style={styles.thumbnailContainer}>
          {participants.map((participant) => {
            // Find video track for this participant
            const videoTrack = tracks.find(
              (track) => 
                track.participant.identity === participant.identity &&
                track.source === Track.Source.Camera
            );
            
            return (
              <View key={participant.identity} style={styles.thumbnail}>
                <View style={styles.thumbnailVideo}>
                  {videoTrack && videoTrack.publication && !videoTrack.publication.isMuted ? (
                    <View style={styles.videoView}>
                      <Text style={styles.thumbnailIcon}>📹</Text>
                      <Text style={styles.videoPlaceholder}>Video Active</Text>
                    </View>
                  ) : (
                    <Text style={styles.thumbnailIcon}>👤</Text>
                  )}
                </View>
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.name || participant.identity}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          {/* Mute button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive,
            ]}
            onPress={toggleMute}
          >
            <Text style={styles.controlIcon}>
              {!isMuted ? '🎤' : '🔇'}
            </Text>
          </TouchableOpacity>

          {/* Video button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isVideoEnabled && styles.controlButtonActive,
            ]}
            onPress={toggleVideo}
          >
            <Text style={styles.controlIcon}>
              {isVideoEnabled ? '📹' : '📷'}
            </Text>
          </TouchableOpacity>

          {/* Leave button */}
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
            <Text style={styles.leaveButtonText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'} • {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.black,
  },
  loadingText: {
    color: colors.neutral.white,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.neutral.black,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    color: colors.neutral.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: colors.neutral.gray600,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.gray800,
  },
  headerTitle: {
    color: colors.neutral.white,
    fontSize: 18,
    fontWeight: '600',
  },
  headerCloseButton: {
    padding: 8,
  },
  headerCloseText: {
    color: colors.neutral.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  videoContainer: {
    flex: 1,
    padding: 16,
  },
  mainVideoView: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  placeholderVideo: {
    flex: 1,
    backgroundColor: colors.neutral.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: colors.neutral.white,
    fontSize: 16,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    height: 80,
  },
  thumbnail: {
    width: 60,
    marginRight: 8,
    alignItems: 'center',
  },
  thumbnailVideo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.neutral.gray700,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  videoView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray800,
  },
  videoPlaceholder: {
    color: colors.neutral.white,
    fontSize: 12,
    marginTop: 4,
  },
  thumbnailIcon: {
    fontSize: 24,
  },
  participantName: {
    fontSize: 12,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  controlsContainer: {
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    marginHorizontal: 8,
    borderRadius: 28,
    backgroundColor: colors.neutral.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.status.error,
  },
  controlIcon: {
    fontSize: 24,
  },
  leaveButton: {
    backgroundColor: colors.status.error,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    marginLeft: 16,
  },
  leaveButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  statusText: {
    color: colors.neutral.gray400,
    fontSize: 14,
  },
});
