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

// LiveKit Web SDK imports (for web)
import { Room, Track, RemoteParticipant, LocalParticipant, RoomEvent } from 'livekit-client';

interface VideoCallRoomProps {
  readingClubId: string;
  clubName: string;
  onLeave: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  readingClubId,
  clubName,
  onLeave,
}) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<LiveKitToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [room] = useState(() => new Room());
  const [participants, setParticipants] = useState<(LocalParticipant | RemoteParticipant)[]>([]);

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
      console.log('🔍 Full tokenData object:', JSON.stringify(tokenData, null, 2));

      // Validate token data
      if (!tokenData || !tokenData.token) {
        throw new Error('Invalid token data received from server');
      }

      if (!tokenData.room_name) {
        logger.warn('⚠️ No room_name in token data, using fallback');
        tokenData.room_name = `reading-club-${readingClubId}`;
      }

      setToken(tokenData);

      // Connect to LiveKit room using the real token
      logger.info('Connecting to LiveKit room:', tokenData.room_name);
      
      await room.connect(getLiveKitUrl(), tokenData.token);

      logger.info('Connected to LiveKit room successfully');
      setIsConnected(true);
      setIsConnecting(false);

    } catch (err) {
      logger.error('Error connecting to video call:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to video call');
      setIsConnecting(false);
    }
  }, [readingClubId, user, room]);

  const disconnectFromRoom = useCallback(async () => {
    logger.info('Disconnecting from video call');
    
    try {
      await room.disconnect();
      logger.info('Disconnected from LiveKit room');
    } catch (error) {
      logger.error('Error disconnecting from room:', error);
    }
    
    setToken(null);
    setIsConnected(false);
    onLeave();
  }, [room, onLeave]);

  const toggleMute = useCallback(async () => {
    try {
      await room.localParticipant.setMicrophoneEnabled(
        !room.localParticipant.isMicrophoneEnabled
      );
      logger.info('Audio muted:', !room.localParticipant.isMicrophoneEnabled);
    } catch (error) {
      logger.error('Error toggling mute:', error);
    }
  }, [room]);

  const toggleVideo = useCallback(async () => {
    try {
      await room.localParticipant.setCameraEnabled(
        !room.localParticipant.isCameraEnabled
      );
      logger.info('Video enabled:', room.localParticipant.isCameraEnabled);
    } catch (error) {
      logger.error('Error toggling video:', error);
    }
  }, [room]);

  // Setup room event listeners
  useEffect(() => {
    const updateParticipants = () => {
      setParticipants([room.localParticipant, ...Array.from(room.remoteParticipants.values())]);
    };

    room.on(RoomEvent.ParticipantConnected, updateParticipants);
    room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    room.on(RoomEvent.LocalTrackPublished, updateParticipants);
    room.on(RoomEvent.LocalTrackUnpublished, updateParticipants);
    room.on(RoomEvent.TrackSubscribed, updateParticipants);
    room.on(RoomEvent.TrackUnsubscribed, updateParticipants);

    return () => {
      room.off(RoomEvent.ParticipantConnected, updateParticipants);
      room.off(RoomEvent.ParticipantDisconnected, updateParticipants);
      room.off(RoomEvent.LocalTrackPublished, updateParticipants);
      room.off(RoomEvent.LocalTrackUnpublished, updateParticipants);
      room.off(RoomEvent.TrackSubscribed, updateParticipants);
      room.off(RoomEvent.TrackUnsubscribed, updateParticipants);
    };
  }, [room]);

  useEffect(() => {
    connectToRoom();
    
    return () => {
      // Cleanup on unmount
      logger.info('Cleaning up video call room');
      room.disconnect();
    };
  }, [connectToRoom, room]);

  const handleLeave = () => {
    Alert.alert(
      'Leave Meeting',
      'Are you sure you want to leave the meeting?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: disconnectFromRoom,
        },
      ]
    );
  };

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
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={connectToRoom}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onLeave}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.clubName}>{clubName}</Text>
        <Text style={styles.participantCount}>
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Video Container */}
      <View style={styles.videoContainer}>
        {/* Main video view */}
        <View style={styles.mainVideoView}>
          <View style={styles.placeholderVideo}>
            <Text style={styles.placeholderText}>
              📹 Web Video Support
            </Text>
            <Text style={styles.placeholderSubtext}>
              Video rendering for web coming soon
            </Text>
          </View>
        </View>

        {/* Participant thumbnails */}
        <View style={styles.participantThumbnails}>
          {participants.map((participant) => (
            <View key={participant.identity} style={styles.thumbnail}>
              <View style={styles.thumbnailVideo}>
                <Text style={styles.thumbnailIcon}>👤</Text>
              </View>
              <Text style={styles.participantName} numberOfLines={1}>
                {participant.name || participant.identity}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton, 
            !room.localParticipant.isMicrophoneEnabled && styles.controlButtonActive
          ]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>
            {room.localParticipant.isMicrophoneEnabled ? '🎤' : '🔇'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton, 
            !room.localParticipant.isCameraEnabled && styles.controlButtonActive
          ]}
          onPress={toggleVideo}
        >
          <Text style={styles.controlIcon}>
            {room.localParticipant.isCameraEnabled ? '📹' : '📷'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray900,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 24,
  },
  errorTitle: {
    color: colors.neutral.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.neutral.gray300,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: colors.neutral.gray300,
    fontSize: 16,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  clubName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.white,
    marginBottom: 4,
  },
  participantCount: {
    fontSize: 14,
    color: colors.neutral.gray300,
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
    color: colors.neutral.white,
    fontSize: 24,
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: colors.neutral.gray300,
    fontSize: 14,
    textAlign: 'center',
  },
  participantThumbnails: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    alignItems: 'center',
  },
  thumbnailVideo: {
    width: 80,
    height: 60,
    backgroundColor: colors.neutral.gray800,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    overflow: 'hidden',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
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
  },
  leaveButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
