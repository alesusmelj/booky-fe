import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { logger } from '../utils/logger';
import { LiveKitService, LiveKitToken } from '../services/liveKitService';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { getLiveKitUrl } from '../config/livekit';
import { PanoramaViewer } from './PanoramaViewer';

// LiveKit React Native hooks
import {
  useRoom,
  useParticipants,
  useTracks,
  VideoTrack,
  AudioSession,
  registerGlobals,
} from '@livekit/react-native';

// LiveKit core classes and enums
import {
  Room,
  Track,
  RoomEvent,
  ParticipantEvent,
  LocalParticipant,
  RemoteParticipant,
} from 'livekit-client';

// ============================================================================
// DESIGN SYSTEM - Premium dark theme for book club aesthetic
// ============================================================================
const theme = {
  colors: {
    // Background hierarchy
    background: '#0D1117',      // Deep dark with blue tint
    surface: '#161B22',         // Elevated surface
    surfaceElevated: '#21262D', // Cards and modals
    surfaceHover: '#30363D',    // Interactive hover

    // Text hierarchy
    textPrimary: '#F0F6FC',     // Main text
    textSecondary: '#8B949E',   // Secondary text
    textMuted: '#484F58',       // Subtle text

    // Accent colors
    accent: '#58A6FF',          // Primary blue accent
    accentMuted: '#388BFD26',   // Blue with transparency

    // Status colors
    success: '#3FB950',
    successMuted: '#23863626',
    error: '#F85149',
    errorMuted: '#F8514926',
    warning: '#D29922',

    // Borders
    border: '#30363D',
    borderSubtle: '#21262D',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
};

interface VideoCallRoomProps {
  readingClubId: string;
  onClose: () => void;
  isModerator?: boolean;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  readingClubId,
  onClose,
  isModerator = false,
}) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [isConnecting, setIsConnecting] = useState(true);
  const [token, setToken] = useState<LiveKitToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUserModerator, setIsUserModerator] = useState(isModerator);
  // Sync isModerator prop with local state
  useEffect(() => {
    logger.info('👤 Prop isModerator updated:', isModerator);
    if (isModerator) {
      setIsUserModerator(true);
    }
  }, [isModerator]);

  // Real LiveKit room
  const [room] = useState(() => new Room());

  // Track participants manually through room events
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [agentReady, setAgentReady] = useState(false); // Track if agent has connected at least once

  const connectToRoom = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Register WebRTC globals for React Native
      registerGlobals();
      logger.info('WebRTC globals registered');

      logger.info('Connecting to video call for reading club:', readingClubId);

      // Get LiveKit token from backend
      const tokenData = await LiveKitService.getToken({
        reading_club_id: readingClubId,
        participant_name: `${user.name} ${user.lastname || ''}`.trim(),
      });

      logger.info('Token data received:', tokenData);

      // Validate token data
      if (!tokenData || !tokenData.token) {
        throw new Error('Invalid token data received from server');
      }

      if (!tokenData.room_name) {
        logger.warn('No room_name in token data, using fallback');
        tokenData.room_name = `reading-club-${readingClubId}`;
      }

      // Log token details for debugging (without exposing full token)
      logger.info('Token validation:', {
        hasToken: !!tokenData.token,
        tokenLength: tokenData.token?.length,
        roomName: tokenData.room_name,
        participantName: tokenData.participant_name,
        participantId: tokenData.participant_id,
        isModerator: tokenData.moderator,
      });

      setToken(tokenData);
      if (tokenData.moderator) {
        logger.info('👑 Token confirms moderator role');
        setIsUserModerator(true);
      }

      // Get LiveKit server URL
      const livekitUrl = getLiveKitUrl();
      logger.info('Connecting to LiveKit server:', livekitUrl);
      logger.info('Room name:', tokenData.room_name);

      // Configure audio session for mobile
      await AudioSession.startAudioSession();

      // Connect to LiveKit room
      logger.info('Attempting to connect to room...');
      await room.connect(livekitUrl, tokenData.token);
      logger.info('✅ Successfully connected to LiveKit room');
      setIsConnected(true);
      setIsConnecting(false);

      // Set local participant and ensure microphone starts disabled
      const local = room.localParticipant;
      setLocalParticipant(local);
      if (local) {
        await local.setMicrophoneEnabled(false);
        logger.info('🔇 Initial state: Microphone disabled');
      }

      // Set up room event listeners
      room.on(RoomEvent.Disconnected, () => {
        logger.info('Disconnected from room');
        setIsConnected(false);
        setParticipants([]);
        setLocalParticipant(null);
      });

      room.on(RoomEvent.Reconnecting, () => {
        logger.info('Reconnecting to room...');
      });

      room.on(RoomEvent.Reconnected, () => {
        logger.info('Reconnected to room');
        setIsConnected(true);
      });

      // Track participants
      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        logger.info('Participant connected:', participant.identity);
        setParticipants(prev => [...prev, participant]);

        // Mark agent as ready when it connects
        if (participant.identity?.includes('agent')) {
          logger.info('🤖 Agent connected, marking as ready');
          setAgentReady(true);
        }
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        logger.info('Participant disconnected:', participant.identity);
        setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
      });

      // Track updates
      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        logger.info(`🎤 Local track published: ${publication.trackName} (${publication.kind})`);
      });

      room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
        logger.info(`🎤 Local track unpublished: ${publication.trackName} (${publication.kind})`);
      });

      room.on(RoomEvent.TrackMuted, (publication, participant) => {
        if (participant === room.localParticipant) {
          logger.info(`🎤 Local track MUTED: ${publication.trackName}`);
        }
      });

      room.on(RoomEvent.TrackUnmuted, (publication, participant) => {
        if (participant === room.localParticipant) {
          logger.info(`🎤 Local track UNMUTED: ${publication.trackName}`);
        }
      });

      // Initialize with current participants
      setParticipants(Array.from(room.remoteParticipants.values()));
    } catch (err) {
      logger.error('Error connecting to video call:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
      showAlert({
        title: 'Error de Conexión',
        message: 'No se pudo conectar a la videollamada. Por favor intenta de nuevo.',
        buttons: [{ text: 'OK', style: 'default' }]
      });
    }
  }, [readingClubId, user, room]);



  const disconnectFromRoom = useCallback(async () => {
    try {
      logger.info('Disconnecting from video call');
      await room.disconnect();
      await AudioSession.stopAudioSession();
      setIsConnected(false);
      setToken(null);
    } catch (err) {
      logger.error('Error disconnecting:', err);
    }
  }, [room]);

  // Real state for controls
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [showPanoramaViewer, setShowPanoramaViewer] = useState(false);

  // Reading Mode State
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [capturedText, setCapturedText] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [hasNewScene, setHasNewScene] = useState(false); // Notification badge for new scenes

  const PANORAMA_URL = 'https://res.cloudinary.com/dfsfkyyx7/image/upload/v1758152482/descarga_1_emrail.png';

  const handleGenerateScene = useCallback(async (text: string) => {
    try {
      setIsGeneratingImage(true);
      logger.info('📤 Starting scene generation...');

      await LiveKitService.generateSceneImage(readingClubId, text);
      logger.info('✅ Scene generation request finished');

      // Fetch latest images
      const scenes = await LiveKitService.getSceneImages(readingClubId);
      if (scenes && Array.isArray(scenes) && scenes.length > 0) {
        setGeneratedImageBase64(scenes[0].image_base64);
        logger.info('✅ Moderator state updated with latest scene');

        // Auto-open panorama viewer for moderator
        setShowPanoramaViewer(true);
        logger.info('🎬 Auto-opening panorama viewer for moderator');
      }

      // Notify others via LiveKit
      if (room && room.localParticipant) {
        const notification = {
          type: 'NEW_SCENE_AVAILABLE',
          timestamp: Date.now(),
          generatedBy: room.localParticipant.identity,
        };

        logger.info(`📡 Publishing notification type: ${notification.type}`);
        await room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify(notification)),
          { reliable: true, topic: 'scene_notifications' }
        );
        logger.info('✅ Notification published to all participants');
      }
    } catch (err) {
      logger.error('❌ Error in handleGenerateScene:', err);
      showAlert({
        title: 'Error',
        message: 'No se pudo generar la escena.',
        buttons: [{ text: 'OK', style: 'default' }]
      });
    } finally {
      setIsGeneratingImage(false);
    }
  }, [readingClubId, room, showAlert]);

  // Handle incoming LiveKit data messages
  useEffect(() => {
    if (!isConnected || !room) {
      logger.info('📡 [DATA-LISTENER] Waiting for connection...');
      return;
    }

    logger.info('📡 [DATA-LISTENER] Setting up data message listener');

    const onDataReceived = async (payload: Uint8Array, participant: any, kind: any, topic?: string) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const message = JSON.parse(decoded);

        logger.info(`📡 Data Received | Topic: ${topic || 'none'} | Type: ${message.type}`);

        // 1. STT Results (from Agent)
        if (topic === 'voice_cmd_result' || message.type === 'STT_RESULT') {
          if (message.type === 'STT_RESULT') {
            const { speaker, text } = message;
            logger.info(`📝 STT_RESULT received | Speaker: ${speaker} | Text length: ${text?.length || 0}`);

            if (speaker === room.localParticipant?.identity && text.trim()) {
              logger.info('✅ STT_RESULT matches local participant, triggering scene generation');
              handleGenerateScene(text.trim());
            } else {
              logger.info(`⏭️ STT_RESULT ignored (speaker: ${speaker}, local: ${room.localParticipant?.identity})`);
            }
          } else if (message.type === 'BUSY') {
            logger.info('⚠️ Agent BUSY message received');
            setIsReadingMode(false);
          }
        }

        // 2. Scene Notifications (from Narrator)
        if (topic === 'scene_notifications' || message.type === 'NEW_SCENE_AVAILABLE') {
          if (message.type === 'NEW_SCENE_AVAILABLE') {
            if (message.generatedBy !== room.localParticipant?.identity) {
              logger.info(`🎬 NEW_SCENE_AVAILABLE from ${message.generatedBy}`);
              setHasNewScene(true);

              // Auto-sync latest image
              try {
                const scenes = await LiveKitService.getSceneImages(readingClubId);
                if (scenes && Array.isArray(scenes) && scenes.length > 0) {
                  setGeneratedImageBase64(scenes[0].image_base64);
                  logger.info('✅ Image state synced automatically');

                  // Auto-open panorama viewer for participants
                  setShowPanoramaViewer(true);
                  logger.info('🎬 Auto-opening panorama viewer for participant');
                }
              } catch (err) {
                logger.error('❌ Sync failed:', err);
              }
            }
          }
        }
      } catch (err) {
        logger.error('❌ Error processing data message:', err);
      }
    };

    room.on(RoomEvent.DataReceived, onDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, onDataReceived);
    };
  }, [isConnected, room, readingClubId, handleGenerateScene]);

  const handleToggleReadingMode = useCallback(async () => {
    if (!localParticipant || !room) return;

    if (!isReadingMode) {
      logger.info('📖 Starting Reading Mode');
      setCapturedText('');
      setIsReadingMode(true);
      try {
        await localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);

        // If this is the first time and agent just connected, wait a bit for it to be ready
        if (!agentReady) {
          logger.info('⏳ First STT attempt - waiting 1s for agent to initialize...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const startMessage = { type: 'START_STT', speaker: localParticipant.identity, ts: Date.now() };
        await room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify(startMessage)),
          { reliable: true, topic: 'voice_cmd' }
        );
        logger.info('✅ START_STT command sent to agent');
      } catch (err) {
        logger.error('❌ Failed to start STT:', err);
        setIsReadingMode(false);
      }
    } else {
      logger.info('⏹️ Stopping Reading Mode');
      try {
        const stopMessage = { type: 'STOP_STT', speaker: localParticipant.identity, ts: Date.now() };
        await room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify(stopMessage)),
          { reliable: true, topic: 'voice_cmd' }
        );
      } catch (err) {
        logger.error('❌ Failed to stop STT:', err);
      }
      setIsReadingMode(false);
    }
  }, [isReadingMode, localParticipant, room, handleGenerateScene]);

  const toggleMute = useCallback(async () => {
    try {
      if (localParticipant) {
        await localParticipant.setMicrophoneEnabled(isMuted);
        setIsMuted(!isMuted);
      }
    } catch (err) {
      logger.error('Error toggling microphone:', err);
    }
  }, [isMuted, localParticipant]);

  const toggleVideo = useCallback(async () => {
    try {
      if (localParticipant) {
        await localParticipant.setCameraEnabled(isVideoEnabled);
        setIsVideoEnabled(!isVideoEnabled);
      }
    } catch (err) {
      logger.error('Error toggling camera:', err);
    }
  }, [isVideoEnabled, localParticipant]);

  const handleLeave = useCallback(async () => {
    await disconnectFromRoom();
    onClose();
  }, [disconnectFromRoom, onClose]);

  const handleOpenPanoramaViewer = useCallback(async () => {
    logger.info('Opening panorama viewer from meeting');

    // Clear notification badge when user opens the viewer
    setHasNewScene(false);

    try {
      // Fetch scene images for this reading club
      const scenes = await LiveKitService.getSceneImages(readingClubId);

      logger.info('📦 Raw scenes response:', JSON.stringify(scenes));
      logger.info('📊 Type of scenes:', typeof scenes);
      logger.info('📊 Is Array:', Array.isArray(scenes));
      logger.info('📊 Length:', scenes?.length);

      if (scenes && Array.isArray(scenes) && scenes.length > 0) {
        logger.info(`✅ Found ${scenes.length} scene(s)`);
        // Use the most recent scene
        const latestScene = scenes[0];
        logger.info('📸 Latest scene object:', JSON.stringify(latestScene));
        logger.info('📸 Has image_base64:', !!latestScene.image_base64);

        setGeneratedImageBase64(latestScene.image_base64);
        setShowPanoramaViewer(true);
        logger.info('✅ Scene image set successfully');
      } else {
        logger.warn('⚠️ No scenes found for this reading club');
        logger.warn('⚠️ Scenes value:', scenes);
        showAlert({
          title: 'Sin contenido',
          message: 'Aún no hay escenas 360 generadas para este club de lectura. Usa el botón de lectura para crear una.',
          buttons: [{ text: 'OK', style: 'default' }]
        });
      }
    } catch (err) {
      logger.error('❌ Error fetching scene images:', err);
      showAlert({
        title: 'Error',
        message: 'No se pudieron cargar las escenas. Inténtalo de nuevo.',
        buttons: [{ text: 'OK', style: 'default' }]
      });
    }
  }, [readingClubId]);

  useEffect(() => {
    connectToRoom();

    return () => {
      disconnectFromRoom();
    };
  }, [connectToRoom, disconnectFromRoom]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconWrapper}>
            <Ionicons name="book" size={48} color={theme.colors.accent} />
          </View>
          <Text style={styles.loadingTitle}>Conectando a la reunión</Text>
          <Text style={styles.loadingSubtitle}>Preparando tu sesión del club...</Text>
          <ActivityIndicator
            size="small"
            color={theme.colors.accent}
            style={styles.loadingSpinner}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrapper}>
            <Ionicons name="alert-circle" size={56} color={theme.colors.error} />
          </View>
          <Text style={styles.errorTitle}>Error de conexión</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={connectToRoom}>
            <Ionicons name="refresh" size={20} color={theme.colors.textPrimary} />
            <Text style={styles.primaryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // MAIN MEETING VIEW
  // ============================================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      {/* ════════════════════════════════════════════════════════════════════
          HEADER - Clean dark header with elegant typography
          ════════════════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Ionicons
              name="book-outline"
              size={20}
              color={theme.colors.accent}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Reunión del Club</Text>
          </View>
          <TouchableOpacity
            onPress={handleLeave}
            style={styles.headerCloseButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN VIDEO AREA - Clean centered status
          ════════════════════════════════════════════════════════════════════ */}
      <View style={styles.videoContainer}>
        <View style={styles.mainVideoView}>
          <View style={styles.connectionStatus}>
            {/* Connection indicator */}
            <View style={[
              styles.statusBadge,
              isConnected ? styles.statusConnected : styles.statusDisconnected
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isConnected ? theme.colors.success : theme.colors.error }
              ]} />
              <Text style={styles.statusBadgeText}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Text>
            </View>

            {/* Central icon */}
            <View style={styles.centralIconWrapper}>
              <Ionicons
                name={isVideoEnabled ? "mic" : "mic-off"}
                size={64}
                color={theme.colors.textMuted}
              />
            </View>

            {/* Status text */}
            <Text style={styles.connectionTitle}>
              {isConnected ? 'En sesión' : 'Sin conexión'}
            </Text>
            <Text style={styles.connectionSubtitle}>
              {isConnected
                ? 'Estás participando en la reunión del club'
                : 'Intentando reconectar...'}
            </Text>

            {/* Recording Indicator for Reading Mode */}
            {isReadingMode && (
              <View style={styles.recordingContainer}>
                <View style={[styles.recordingDot, { backgroundColor: theme.colors.error }]} />
                <Text style={styles.recordingText}>Capturando lectura...</Text>
              </View>
            )}

            {/* Generated text preview (optional, for debug or UX) */}
            {capturedText.length > 0 && isReadingMode && (
              <View style={styles.textPreviewContainer}>
                <Text style={styles.textPreview} numberOfLines={2}>
                  "{capturedText}"
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            PARTICIPANTS - Refined cards with avatars
            ════════════════════════════════════════════════════════════════════ */}
        <View style={styles.participantsSection}>
          <Text style={styles.participantsTitle}>
            Participantes ({participants.length + (localParticipant ? 1 : 0)})
          </Text>
          <View style={styles.participantsList}>
            {/* Local participant */}
            {localParticipant && (
              <View key="local" style={styles.participantCard}>
                <View style={styles.participantAvatar}>
                  <Ionicons
                    name={isVideoEnabled ? "videocam" : "videocam-off"}
                    size={20}
                    color={isVideoEnabled ? theme.colors.success : theme.colors.textSecondary}
                  />
                </View>
                <Text style={styles.participantName} numberOfLines={1}>
                  {user?.name || 'You'}
                </Text>
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>Tú</Text>
                </View>
              </View>
            )}

            {/* Remote participants */}
            {participants.map((participant) => {
              const isAgent = participant.identity?.includes('agent') || participant.name?.includes('agent');

              // Check if participant has camera enabled
              const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
              const hasVideo = cameraPublication && !cameraPublication.isMuted;

              return (
                <View key={participant.identity} style={styles.participantCard}>
                  <View style={[
                    styles.participantAvatar,
                    isAgent && { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent + '40', borderWidth: 1 }
                  ]}>
                    <MaterialCommunityIcons
                      name={isAgent ? "robot" : "account"}
                      size={20}
                      color={isAgent ? theme.colors.accent : theme.colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.participantName, isAgent && { color: theme.colors.accent }]} numberOfLines={1}>
                    {isAgent ? 'IA (Escucha)' : (participant.name || participant.identity)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* ════════════════════════════════════════════════════════════════════
          CONTROLS BAR - Unified circular buttons
          ════════════════════════════════════════════════════════════════════ */}
      <View style={styles.controlsWrapper}>
        <View style={styles.controlsContainer}>
          {/* Microphone toggle */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonMuted,
            ]}
            onPress={toggleMute}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Reading Mode / Scene Generation (Moderator only) */}
          {isUserModerator && (
            <TouchableOpacity
              style={[
                styles.controlButton,
                isReadingMode && styles.controlButtonActive,
                isGeneratingImage && styles.controlButtonDisabled,
              ]}
              onPress={handleToggleReadingMode}
              disabled={isGeneratingImage}
              activeOpacity={0.8}
            >
              {isGeneratingImage ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : (
                <Ionicons
                  name={isReadingMode ? "book" : "book-outline"}
                  size={24}
                  color={isReadingMode ? theme.colors.error : theme.colors.textPrimary}
                />
              )}
            </TouchableOpacity>
          )}

          {/* 360° Panorama Viewer - Accent button */}
          <TouchableOpacity
            style={styles.panoramaButton}
            onPress={handleOpenPanoramaViewer}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="panorama-sphere-outline"
              size={26}
              color={theme.colors.textPrimary}
            />
            {hasNewScene && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>!</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Leave meeting - Destructive action */}
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeave}
            activeOpacity={0.8}
          >
            <Feather name="phone-off" size={20} color={theme.colors.textPrimary} />
            <Text style={styles.leaveButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ════════════════════════════════════════════════════════════════════
          PANORAMA VIEWER MODAL
          ════════════════════════════════════════════════════════════════════ */}
      {showPanoramaViewer && (
        <PanoramaViewer
          uri={generatedImageBase64 ? `data:image/jpeg;base64,${generatedImageBase64}` : PANORAMA_URL}
          isModerator={isUserModerator}
          isReadingMode={isReadingMode}
          onToggleReadingMode={handleToggleReadingMode}
          isGeneratingImage={isGeneratingImage}
          onClose={() => {
            setShowPanoramaViewer(false);
            setGeneratedImageBase64(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  // ════════════════════════════════════════════════════════════════════════
  // CONTAINER
  // ════════════════════════════════════════════════════════════════════════
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════════════════
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  loadingTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    marginBottom: theme.spacing.lg,
  },
  loadingSpinner: {
    marginTop: theme.spacing.sm,
  },

  // ════════════════════════════════════════════════════════════════════════
  // ERROR STATE
  // ════════════════════════════════════════════════════════════════════════
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.errorMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.3,
  },
  errorMessage: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  primaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },

  // ════════════════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════════════════
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + theme.spacing.sm : theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ════════════════════════════════════════════════════════════════════════
  // VIDEO CONTAINER
  // ════════════════════════════════════════════════════════════════════════
  videoContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  mainVideoView: {
    flex: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  connectionStatus: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.lg,
  },
  statusConnected: {
    backgroundColor: theme.colors.successMuted,
  },
  statusDisconnected: {
    backgroundColor: theme.colors.errorMuted,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  centralIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  connectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  connectionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },

  // ════════════════════════════════════════════════════════════════════════
  // PARTICIPANTS
  // ════════════════════════════════════════════════════════════════════════
  participantsSection: {
    marginTop: theme.spacing.sm,
  },
  participantsTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  participantName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 120,
  },
  youBadge: {
    backgroundColor: theme.colors.accentMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginLeft: theme.spacing.sm,
  },
  youBadgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },

  // ════════════════════════════════════════════════════════════════════════
  // CONTROLS
  // ════════════════════════════════════════════════════════════════════════
  controlsWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonMuted: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  panoramaButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    gap: theme.spacing.sm,
    // Subtle shadow
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderColor: 'rgba(248, 81, 73, 0.3)',
    borderWidth: 1,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  textPreviewContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    maxWidth: '85%',
  },
  textPreview: {
    color: 'rgba(240, 246, 252, 0.8)',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ════════════════════════════════════════════════════════════════════════
  // NOTIFICATION BADGE
  // ════════════════════════════════════════════════════════════════════════
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: theme.radius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
    // Shadow for visibility
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  notificationBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
