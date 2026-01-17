import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../constants';
import { logger } from '../utils/logger';
import { VideoCallRoom } from '../components';
import { ReadingClubsService } from '../services/readingClubsService';
import { LiveKitService } from '../services/liveKitService';
import { useAuth } from '../contexts/AuthContext';

interface ReadingClub {
  id: string;
  name: string;
  description: string;
  book?: {
    id: string;
    title: string;
    author: string;
    image?: string;
    pages?: number;
  };
  book_id: string;
  current_chapter?: number;
  member_count: number;
  next_meeting: string;
  moderator?: {
    id: string;
    name: string;
    lastname?: string;
    image?: string;
  };
  moderator_id: string;
  meetingActive?: boolean;
  meetingParticipantCount?: number;
}

interface ReadingClubCardProps {
  club: ReadingClub;
  onPress: (clubId: string) => void;
  onJoin: (clubId: string) => void;
  onJoinRoom: (club: ReadingClub) => void;
  onStartMeeting: (club: ReadingClub) => void;
  isUserModerator: boolean;
}

const ReadingClubCard: React.FC<ReadingClubCardProps> = ({
  club,
  onPress,
  onJoin,
  onJoinRoom,
  onStartMeeting,
  isUserModerator
}) => {
  return (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={() => onPress(club.id)}
      activeOpacity={0.7}
    >
      {/* Live indicator */}
      {club.meetingActive && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            🔴 EN VIVO • {club.meetingParticipantCount || 0} participantes
          </Text>
        </View>
      )}

      <View style={styles.clubHeader}>
        <View style={styles.clubInfo}>
          <Text style={styles.clubName} numberOfLines={1}>
            {club.name}
          </Text>
          <View style={styles.membersContainer}>
            <Text style={styles.membersText}>
              👥 {club.member_count} miembros
            </Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Activo</Text>
        </View>
      </View>

      <View style={styles.currentBookSection}>
        <Text style={styles.sectionLabel}>Leyendo Actualmente</Text>
        <View style={styles.bookInfo}>
          <Text style={styles.bookIcon}>📖</Text>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {club.book?.title || 'Libro no disponible'}
          </Text>
        </View>
      </View>

      <View style={styles.meetingSection}>
        <Text style={styles.sectionLabel}>Próxima Reunión</Text>
        <View style={styles.meetingInfo}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.meetingDay}>
            {new Date(club.next_meeting).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionLabel}>Progreso de Lectura</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, ((club.current_chapter || 0) / (club.book?.pages || 1)) * 100)}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Página {club.current_chapter || 0} de {club.book?.pages || '?'}
        </Text>
      </View>

      {/* Action buttons */}
      {club.meetingActive ? (
        <TouchableOpacity
          style={styles.joinMeetingButton}
          onPress={() => onJoinRoom(club)}
          activeOpacity={0.8}
        >
          <Text style={styles.joinMeetingButtonText}>Unirse a la Reunión</Text>
        </TouchableOpacity>
      ) : isUserModerator ? (
        <TouchableOpacity
          style={styles.startMeetingButton}
          onPress={() => onStartMeeting(club)}
          activeOpacity={0.8}
        >
          <Text style={styles.startMeetingButtonText}>Iniciar Reunión</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => onJoin(club.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>Unirse al Club</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export const ReadingClubsScreen: React.FC = () => {
  const { user } = useAuth();
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallClub, setVideoCallClub] = useState<ReadingClub | null>(null);
  const [readingClubs, setReadingClubs] = useState<ReadingClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReadingClubs = useCallback(async () => {
    try {
      logger.info('Loading reading clubs...');
      const { data } = await ReadingClubsService.getAllReadingClubs();

      // Fetch meeting status for each club
      const clubsWithStatus = await Promise.all(
        data.map(async (club: any) => {
          try {
            const status = await LiveKitService.getMeetingStatus(club.id);
            return {
              ...club,
              meetingActive: status.active || false,
              meetingParticipantCount: status.participant_count || 0,
            };
          } catch (err) {
            logger.error('Error fetching meeting status for club:', club.id, err);
            return {
              ...club,
              meetingActive: false,
              meetingParticipantCount: 0,
            };
          }
        })
      );

      setReadingClubs(clubsWithStatus);
      logger.info('Loaded', clubsWithStatus.length, 'reading clubs');
    } catch (error) {
      logger.error('Error loading reading clubs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReadingClubs();

    // Poll for meeting status updates every 30 seconds
    const interval = setInterval(loadReadingClubs, 30000);

    return () => clearInterval(interval);
  }, [loadReadingClubs]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReadingClubs();
  }, [loadReadingClubs]);

  const handleClubPress = (clubId: string) => {
    // TODO: Navigate to club detail
    logger.info('Club pressed:', clubId);
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      logger.info('Joining club:', clubId);
      await ReadingClubsService.joinReadingClub(clubId);
      // Refresh clubs to update member count
      loadReadingClubs();
    } catch (error) {
      logger.error('Error joining club:', error);
    }
  };

  const handleStartMeeting = async (club: ReadingClub) => {
    try {
      logger.info('Starting meeting for club:', club.id);
      await LiveKitService.startMeeting(club.id);
      // Open video call
      setVideoCallClub(club);
      setShowVideoCall(true);
      // Refresh to show meeting as active
      loadReadingClubs();
    } catch (error) {
      logger.error('Error starting meeting:', error);
    }
  };

  const handleJoinRoom = (club: ReadingClub) => {
    logger.info('Join meeting for club:', club.id);
    setVideoCallClub(club);
    setShowVideoCall(true);
  };

  const handleLeaveVideoCall = async () => {
    setShowVideoCall(false);
    setVideoCallClub(null);
    // Refresh to update meeting status
    loadReadingClubs();
  };


  const handleCreateClub = () => {
    // TODO: Navigate to create club screen
    logger.info('Create club pressed');
  };

  const renderClubCard = ({ item }: { item: ReadingClub }) => {
    const isUserModerator = user?.id === item.moderator_id;

    return (
      <ReadingClubCard
        club={item}
        onPress={handleClubPress}
        onJoin={handleJoinClub}
        onJoinRoom={handleJoinRoom}
        onStartMeeting={handleStartMeeting}
        isUserModerator={isUserModerator}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Clubes de Lectura</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateClub}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Crear Club</Text>
        </TouchableOpacity>
      </View>

      {/* Clubs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.indigo600} />
          <Text style={styles.loadingText}>Cargando clubes...</Text>
        </View>
      ) : (
        <FlatList
          data={readingClubs}
          renderItem={renderClubCard}
          keyExtractor={(item) => item.id}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.indigo600]}
            />
          }
        />
      )}

      {/* Video Call Modal */}
      {showVideoCall && videoCallClub && (
        <Modal
          visible={showVideoCall}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <VideoCallRoom
            readingClubId={videoCallClub.id}
            onClose={handleLeaveVideoCall}
          />
        </Modal>
      )}

    </View>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // 16px margin on each side

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  createButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  clubCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    width: cardWidth,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersText: {
    fontSize: 14,
    color: colors.neutral.gray500,
  },
  statusBadge: {
    backgroundColor: colors.primary.indigo100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: colors.primary.indigo600,
    fontWeight: '600',
  },
  currentBookSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray500,
    marginBottom: 4,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  bookTitle: {
    fontSize: 16,
    color: colors.neutral.gray900,
    flex: 1,
  },
  meetingSection: {
    marginBottom: 16,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  meetingDay: {
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.indigo600,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.neutral.gray500,
    textAlign: 'right',
  },
  joinButton: {
    backgroundColor: colors.primary.indigo50,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: colors.primary.indigo600,
    fontSize: 14,
    fontWeight: '600',
  },
  liveIndicator: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.white,
    marginRight: 8,
  },
  liveText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  joinMeetingButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinMeetingButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  startMeetingButton: {
    backgroundColor: colors.primary.indigo600,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startMeetingButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.gray600,
  },
});
