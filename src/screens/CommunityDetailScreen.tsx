import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';
import { logger } from '../utils/logger';
import { ensureHttps } from '../utils';
import { CreateReadingClubModal, SetMeetingModal, Post, CreatePost, VideoCallRoom } from '../components';
import { useCommunity, usePosts, useReadingClubs } from '../hooks';
import { CommunityDto } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { useNavigation } from '../contexts/NavigationContext';

interface ReadingClubCardProps {
  club: any; // Real API structure
  onJoinRoom: (club: any) => void;
  onJoinClub: (clubId: string) => void;
  onSetMeeting: (club: any) => void;
  onDelete: (clubId: string) => void;
}

const ReadingClubCard: React.FC<ReadingClubCardProps> = ({ club, onJoinRoom, onJoinClub, onSetMeeting, onDelete }) => {
  const { user } = useAuth();
  const isUserModerator = user?.id === club.moderator_id;

  // 🔍 Debug logging for book attributes
  logger.info('📚 ReadingClubCard - Club data:', {
    clubId: club.id,
    clubName: club.name,
    book: club.book,
    bookTitle: club.book?.title,
    bookAuthor: club.book?.author,
    bookPages: club.book?.pages,
    currentChapter: club.current_chapter,
    fullClubObject: JSON.stringify(club, null, 2)
  });

  // Calculate progress percentage
  const progressPercentage = club.current_chapter && club.book?.pages
    ? Math.min((club.current_chapter / club.book.pages) * 100, 100)
    : 0;

  // Format next meeting date
  const nextMeetingDate = new Date(club.next_meeting);
  const formattedDate = nextMeetingDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = nextMeetingDate.toLocaleTimeString('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <View style={styles.clubCard}>
      {/* Club Header with Name */}
      <View style={styles.clubHeader}>
        <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
        {isUserModerator && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(club.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="delete-outline" size={24} color={colors.status.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content - Horizontal Layout */}
      <View style={styles.clubContent}>
        {/* Book Image */}
        <View style={styles.bookImageContainer}>
          <Image
            source={{ uri: ensureHttps(club.book?.image) || 'https://via.placeholder.com/80x120?text=No+Image' }}
            style={styles.bookImage}
          />
        </View>

        {/* Book & Club Info */}
        <View style={styles.clubInfo}>
          {/* Book Title & Author */}
          <View style={styles.bookTitleSection}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {club.book?.title || 'Libro no disponible'}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {club.book?.author || 'Autor desconocido'}
            </Text>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progreso de Lectura</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                />
              </View>
            </View>
            <Text style={styles.progressText}>
              Página {club.current_chapter || 0} de {club.book?.pages || '?'}
            </Text>
          </View>

          {/* Meeting Info Box */}
          <View style={styles.meetingInfoBox}>
            <Text style={styles.meetingLabel}>Próxima Reunión</Text>
            <Text style={styles.meetingDate}>{formattedDate} a las {formattedTime}</Text>
          </View>

          {/* Members Info */}
          <View style={styles.membersInfo}>
            <Text style={styles.membersIcon}>👥</Text>
            <Text style={styles.membersText}>{club.member_count} miembros</Text>
            <Text style={styles.moderatorText}>
              {club.moderator?.name || 'Moderador'} {club.moderator?.lastname || ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {club.join_available ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onJoinClub(club.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Unirse al Club de Lectura</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onJoinRoom(club)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Unirse a la Reunión</Text>
          </TouchableOpacity>
        )}

        {isUserModerator && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onSetMeeting(club)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Programar Reunión</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface CommunityDetailScreenProps {
  communityId?: string;
}

export const CommunityDetailScreen: React.FC<CommunityDetailScreenProps> = ({ communityId }) => {
  const { navigate } = useNavigation();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'posts' | 'reading-clubs'>('posts');
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showSetMeetingModal, setShowSetMeetingModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallClub, setVideoCallClub] = useState<any | null>(null);

  // Use hooks to fetch real data
  const {
    community,
    loading: communityLoading,
    error: communityError,
    joinCommunity: joinCommunityAction,
    leaveCommunity: leaveCommunityAction
  } = useCommunity(communityId);

  const {
    posts,
    loading: postsLoading,
    error: postsError,
    createPost,
    deletePost,
    toggleLike,
    refresh: refreshPosts,
  } = usePosts(communityId);

  const {
    readingClubs,
    loading: clubsLoading,
    error: clubsError,
    createReadingClub,
    joinReadingClub,
    updateMeeting,
    deleteReadingClub,
    refresh: refreshClubs,
  } = useReadingClubs(communityId);

  const { user } = useAuth();

  const handleUserClick = (userId: string) => {
    logger.info('👤 User profile pressed from community:', userId);
    navigate('profile', { userId });
  };

  const handleLike = async (postId: string) => {
    logger.info('❤️ Post liked:', postId);
    try {
      await toggleLike(postId);
    } catch (error) {
      logger.error('❌ Error toggling like:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo dar/quitar like. Intenta de nuevo.',
        buttons: [{ text: 'OK', style: 'default' }]
      });
    }
  };

  const handleComment = (postId: string) => {
    logger.info('Comment on post:', postId);
  };

  const handleDelete = async (postId: string) => {
    const success = await deletePost(postId);
    if (!success) {
      showAlert({
        title: 'Error',
        message: 'No se pudo eliminar la publicación. Intenta de nuevo.',
        buttons: [{ text: 'OK', style: 'default' }]
      });
    }
  };

  const handleJoinRoom = (club: typeof readingClubs[0]) => {
    logger.info('Join room for club:', club.name);
    setVideoCallClub(club);
    setShowVideoCall(true);
  };

  const handleJoinClub = async (clubId: string) => {
    console.log('🎯 Starting join reading club process for:', clubId);

    try {
      const success = await joinReadingClub(clubId);

      if (success) {
        console.log('✅ Successfully joined reading club:', clubId);
        showAlert({
          title: 'Éxito',
          message: '¡Te has unido al club de lectura exitosamente!',
          buttons: [{ text: 'OK', style: 'default' }]
        });

        // Refresh reading clubs to get updated data
        console.log('🔄 Refreshing reading clubs after join...');
        await refreshClubs();
        console.log('✅ Reading clubs refreshed successfully');
      } else {
        console.log('❌ Failed to join reading club:', clubId);
        showAlert({
          title: 'Error',
          message: 'No se pudo unir al club de lectura. Por favor intenta de nuevo.',
          buttons: [{ text: 'OK', style: 'default' }]
        });
      }
    } catch (error) {
      console.error('❌ Error in handleJoinClub:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo unir al club de lectura. Por favor intenta de nuevo.',
        buttons: [{ text: 'OK', style: 'default' }]
      });
    }
  };

  const handleSetMeetingClick = (club: typeof readingClubs[0]) => {
    setSelectedClub(club);
    setShowSetMeetingModal(true);
  };


  const handleCreatePost = async (content: string, images?: string[]) => {
    if (content.trim() && communityId) {
      try {
        logger.info('📝 Creating new community post:', { content, communityId, hasImages: !!images?.length });

        // Handle the first image if provided (backend supports single image for now)
        const imageUri = images && images.length > 0 ? images[0] : null;

        const success = await createPost({
          body: content,
          community_id: communityId,
        }, imageUri);

        if (!success) {
          showAlert({
            title: 'Error',
            message: 'No se pudo crear el post. Intenta de nuevo.',
            buttons: [{ text: 'OK', style: 'default' }]
          });
        }
      } catch (error) {
        logger.error('❌ Error creating community post:', error);
        showAlert({
          title: 'Error',
          message: 'No se pudo crear el post. Intenta de nuevo.',
          buttons: [{ text: 'OK', style: 'default' }]
        });
      }
    } else {
      if (!content.trim()) {
        showAlert({
          title: 'Error',
          message: 'El post no puede estar vacío',
          buttons: [{ text: 'OK', style: 'default' }]
        });
      }
      if (!communityId) {
        logger.error('❌ No communityId provided for post creation');
        showAlert({
          title: 'Error',
          message: 'Error interno: ID de comunidad no encontrado',
          buttons: [{ text: 'OK', style: 'default' }]
        });
      }
    }
  };

  const handleCreateClub = async (clubData: {
    name: string;
    description: string;
    selectedBook: any;
    nextMeeting: string;
  }) => {
    if (!communityId) return;

    try {
      const success = await createReadingClub({
        name: clubData.name,
        description: clubData.description,
        community_id: communityId,
        book_id: clubData.selectedBook.id,
        next_meeting: clubData.nextMeeting,
      });

      if (success) {
        setShowCreateClubModal(false);
        refreshClubs(); // Refresh the reading clubs list
        logger.info('Reading club created successfully');
      }
    } catch (error) {
      logger.error('Error creating reading club:', error);
    }
  };

  const handleSetMeeting = async (meetingData: {
    chapter: number;
    nextMeeting: string;
  }) => {
    if (!selectedClub) return;

    try {
      const success = await updateMeeting(selectedClub.id, {
        next_meeting: meetingData.nextMeeting,
        current_chapter: meetingData.chapter,
      });

      if (success) {
        setShowSetMeetingModal(false);
        setSelectedClub(null);
        refreshClubs(); // Refresh the reading clubs list
        logger.info('Meeting updated successfully');
      }
    } catch (error) {
      logger.error('Error updating meeting:', error);
    }
  };

  const handleDeleteReadingClub = (clubId: string) => {
    showAlert({
      title: 'Eliminar Club de Lectura',
      message: '¿Estás seguro de que quieres eliminar este club de lectura? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteReadingClub(clubId);
              if (success) {
                logger.info('Reading club deleted successfully');
                // Optional: Show success toast/alert
              } else {
                showAlert({ title: 'Error', message: 'No se pudo eliminar el club de lectura.' });
              }
            } catch (error) {
              logger.error('Error deleting reading club:', error);
              showAlert({ title: 'Error', message: 'Ocurrió un error al eliminar el club.' });
            }
          },
        },
      ]
    });
  };

  const handleLeaveVideoCall = () => {
    setShowVideoCall(false);
    setVideoCallClub(null);
  };

  // Loading state
  if (communityLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading community...</Text>
      </View>
    );
  }

  // Error state
  if (communityError || !community) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Community not found</Text>
        <Text style={styles.errorText}>
          {communityError || 'The community you are looking for does not exist.'}
        </Text>
      </View>
    );
  }

  // Prepare data for single FlatList
  const prepareFlatListData = () => {
    const data = [];

    // Header section
    data.push({ type: 'header', data: community });

    // Tabs section
    data.push({ type: 'tabs', activeTab });

    if (activeTab === 'posts') {
      // Create post section
      data.push({ type: 'createPost' });

      // Posts
      logger.info('📄 [CommunityDetail] Preparing posts for render:', {
        postsCount: posts.length,
        communityId,
        firstPostPreview: posts[0] ? {
          id: posts[0].id,
          hasUser: !!posts[0].user,
          hasBody: !!posts[0].body,
          userInfo: posts[0].user ? {
            id: posts[0].user.id,
            name: posts[0].user.name,
            lastname: posts[0].user.lastname
          } : 'No user'
        } : 'No posts'
      });

      posts.forEach(post => {
        data.push({ type: 'post', data: post });
      });
    } else if (activeTab === 'reading-clubs') {
      // Create club button
      data.push({ type: 'createClub' });

      // All clubs title and clubs
      if (readingClubs.length > 0) {
        data.push({ type: 'allClubsTitle' });

        // Reading clubs
        readingClubs.forEach(club => {
          data.push({ type: 'club', data: club });
        });
      } else {
        data.push({ type: 'emptyClubs' });
      }
    }

    return data;
  };

  const renderFlatListItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.communityHeader}>
            <View style={styles.communityImagePlaceholder}>
              <MaterialIcons name="groups" size={80} color={colors.neutral.white} />
            </View>
            <View style={styles.communityOverlay}>
              <View style={styles.communityInfo}>
                <View style={styles.communityContent}>
                  <Text style={styles.communityTitle}>{community.name}</Text>
                  <Text style={styles.communityDescription}>{community.description}</Text>
                  <Text style={styles.communityMembers}>👥 {community.member_count} miembros</Text>
                  <Text style={styles.communityAdmin}>
                    Admin: {community.admin?.name} {community.admin?.lastname}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'tabs':
        return (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reading-clubs' && styles.activeTab]}
              onPress={() => setActiveTab('reading-clubs')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'reading-clubs' && styles.activeTabText]}>
                Clubes de Lectura
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'createPost':
        return (
          <CreatePost
            onPost={handleCreatePost}
            maxLength={280}
            showCharacterCount={false}
          />
        );

      case 'post': {
        // Pass the PostDto directly to the Post component
        logger.info('📄 [CommunityDetail] Rendering post:', {
          postId: item.data.id,
          hasUser: !!item.data.user,
          hasBody: !!item.data.body,
          bodyPreview: item.data.body ? item.data.body.substring(0, 50) + '...' : 'No body',
          userInfo: item.data.user ? {
            id: item.data.user.id,
            name: item.data.user.name,
            lastname: item.data.user.lastname
          } : 'No user data'
        });

        return (
          <Post
            post={item.data}
            onLike={handleLike}
            onComment={handleComment}
            onUserPress={handleUserClick}
            onDelete={handleDelete}
          />
        );
      }

      case 'createClub':
        return (
          <View style={styles.createClubContainer}>
            <TouchableOpacity
              style={styles.createClubButton}
              onPress={() => setShowCreateClubModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.createClubButtonText}>+ Crear Club de Lectura</Text>
            </TouchableOpacity>
          </View>
        );

      case 'allClubsTitle':
        return <Text style={styles.allClubsTitle}>Todos los Clubes de Lectura</Text>;

      case 'club':
        return (
          <View style={{ marginBottom: 16 }}>
            <ReadingClubCard
              club={item.data}
              onJoinRoom={handleJoinRoom}
              onJoinClub={handleJoinClub}
              onSetMeeting={handleSetMeetingClick}
              onDelete={handleDeleteReadingClub}
            />
          </View>
        );

      case 'emptyClubs':
        return (
          <View style={styles.emptyClubsContainer}>
            <Text style={styles.emptyClubsIcon}>📖</Text>
            <Text style={styles.emptyClubsTitle}>Aún no hay clubes de lectura</Text>
            <Text style={styles.emptyClubsText}>
              Crea un club de lectura para empezar a discutir libros con los miembros de la comunidad.
            </Text>
            <TouchableOpacity
              style={styles.createFirstClubButton}
              onPress={() => setShowCreateClubModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.createFirstClubButtonText}>+ Crea tu primer club de lectura</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={prepareFlatListData()}
        renderItem={renderFlatListItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      />

      {/* Create Reading Club Modal */}
      <CreateReadingClubModal
        visible={showCreateClubModal}
        onClose={() => setShowCreateClubModal(false)}
        onCreateClub={handleCreateClub}
      />

      {/* Set Meeting Modal */}
      {selectedClub && (
        <SetMeetingModal
          visible={showSetMeetingModal}
          clubName={selectedClub.name}
          onClose={() => {
            setShowSetMeetingModal(false);
            setSelectedClub(null);
          }}
          onSetMeeting={handleSetMeeting}
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

// const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  communityHeader: {
    position: 'relative',
    height: 200,
    backgroundColor: colors.neutral.white,
  },
  communityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  communityImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.neutral.white,
  },
  communityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  communityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  communityContent: {
    flex: 1,
    marginRight: 12,
  },
  communityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.white,
    marginBottom: 4,
  },
  communityDescription: {
    fontSize: 16,
    color: colors.neutral.white,
    marginBottom: 8,
    opacity: 0.9,
  },
  communityMembers: {
    fontSize: 14,
    color: colors.neutral.white,
    opacity: 0.8,
  },
  communityAdmin: {
    fontSize: 12,
    color: colors.neutral.white,
    fontWeight: '400',
    opacity: 0.9,
    marginTop: 4,
  },
  joinCommunityButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinCommunityButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary.indigo600,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.gray500,
  },
  activeTabText: {
    color: colors.primary.indigo600,
  },
  createClubContainer: {
    padding: 16,
    alignItems: 'flex-end',
  },
  createClubButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createClubButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  allClubsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  // New Reading Club Card Styles - Compact Design
  clubCard: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  clubHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
    marginRight: -8,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.gray900,
  },
  clubContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
  },
  bookImageContainer: {
    marginRight: 12,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  clubInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitleSection: {
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.gray900,
    lineHeight: 20,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    color: colors.neutral.gray600,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.gray700,
    marginBottom: 4,
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary.indigo600,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.neutral.gray500,
    fontWeight: '500',
  },
  meetingInfoBox: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.indigo600,
    marginBottom: 8,
  },
  meetingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral.gray600,
    marginBottom: 2,
  },
  meetingDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.gray900,
  },
  membersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  membersIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  membersText: {
    fontSize: 11,
    color: colors.neutral.gray600,
    fontWeight: '500',
    marginRight: 8,
  },
  moderatorText: {
    fontSize: 11,
    color: colors.neutral.gray500,
    fontWeight: '400',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary.indigo600,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary.indigo600,
  },
  secondaryButtonText: {
    color: colors.primary.indigo600,
    fontSize: 14,
    fontWeight: '600',
  },
  clubSeparator: {
    height: 16,
  },
  emptyClubsContainer: {
    backgroundColor: colors.neutral.white,
    margin: 16,
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    alignItems: 'center',
  },
  emptyClubsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyClubsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  emptyClubsText: {
    fontSize: 14,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createFirstClubButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createFirstClubButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.neutral.gray500,
  },
  modalForm: {
    padding: 20,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray700,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    gap: 8,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCancelText: {
    color: colors.neutral.gray600,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCreateButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCreateText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  meetingSchedulerContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
});
