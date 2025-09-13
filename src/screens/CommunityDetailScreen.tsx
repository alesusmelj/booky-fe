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
} from 'react-native';
import { colors } from '../constants';
import { logger } from '../utils/logger';
import { ActiveReadingClub, CreateReadingClubModal, SetMeetingModal } from '../components';

// Mock data - should be moved to a service later
const users = [
  {
    id: '1',
    name: 'Jane Cooper',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '2',
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

const communities = [
  {
    id: '1',
    name: 'Fantasy Book Lovers',
    members: 1243,
    image: 'https://images.unsplash.com/photo-1618944847828-82e943c3bdb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    description: 'For lovers of fantasy literature from classics to new releases'
  },
  {
    id: '2',
    name: 'Madrid Book Club',
    members: 328,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    description: 'Local book enthusiasts meeting monthly in Madrid'
  },
  {
    id: '3',
    name: 'Science Fiction Explorers',
    members: 892,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    description: 'Discussing the stars, space, and everything in between'
  },
];

const communityPosts = [
  {
    id: '1',
    userId: '2',
    content: "Just finished 'The Midnight Library' by Matt Haig and I'm completely blown away. Has anyone else read it? Would love to discuss!",
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    likes: 24,
    comments: 8,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    userId: '3',
    content: 'Looking for book recommendations in the historical fiction genre. Any suggestions?',
    image: null,
    likes: 7,
    comments: 15,
    timestamp: '5 hours ago'
  },
];

const readingClubs = [
  {
    id: '1',
    communityId: '1',
    name: 'Fantasy Adventurers',
    description: 'We explore epic fantasy worlds together',
    currentBook: {
      id: '1',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      totalChapters: 24,
      currentChapter: 12
    },
    members: 28,
    moderator: users[0],
    nextMeeting: '2024-02-15T19:00:00',
    meetingDay: 'Thursdays',
    meetingTime: '19:00',
    progress: 50,
    joined: true
  },
  {
    id: '2',
    communityId: '1',
    name: 'Sci-Fi Explorers',
    description: 'For lovers of science fiction and space adventures',
    currentBook: {
      id: '2',
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      totalChapters: 32,
      currentChapter: 18
    },
    members: 15,
    moderator: users[1],
    nextMeeting: '2024-02-18T20:00:00',
    meetingDay: 'Sundays',
    meetingTime: '20:00',
    progress: 56,
    joined: false
  },
];

interface PostCardProps {
  post: typeof communityPosts[0];
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onUserPress: (userId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onUserPress }) => {
  const author = users.find(user => user.id === post.userId);
  
  return (
    <View style={styles.postCard}>
      <TouchableOpacity 
        style={styles.postHeader}
        onPress={() => onUserPress(post.userId)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: author?.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{author?.name}</Text>
          <Text style={styles.postTime}>{post.timestamp}</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onComment(post.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ReadingClubCardProps {
  club: typeof readingClubs[0];
  onJoinRoom: (club: typeof readingClubs[0]) => void;
  onJoinClub: (clubId: string) => void;
  onSetMeeting: (club: typeof readingClubs[0]) => void;
}

const ReadingClubCard: React.FC<ReadingClubCardProps> = ({ club, onJoinRoom, onJoinClub, onSetMeeting }) => {
  return (
    <View style={styles.clubCard}>
      <View style={styles.clubCardHeader}>
        <View style={styles.clubCardInfo}>
          <Text style={styles.clubCardName}>{club.name}</Text>
          <View style={styles.clubStatus}>
            {club.joined ? (
              <Text style={styles.memberBadge}>Member</Text>
            ) : (
              <Text style={styles.openBadge}>Open</Text>
            )}
          </View>
        </View>
        <Text style={styles.clubCardDescription}>{club.description}</Text>
      </View>
      
      <View style={styles.clubCardContent}>
        <Image source={{ uri: club.currentBook.cover }} style={styles.clubBookCover} />
        <View style={styles.clubBookInfo}>
          <Text style={styles.clubBookTitle}>{club.currentBook.title}</Text>
          <Text style={styles.clubBookAuthor}>by {club.currentBook.author}</Text>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Reading Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(club.currentBook.currentChapter / club.currentBook.totalChapters) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Chapter {club.currentBook.currentChapter} of {club.currentBook.totalChapters}
            </Text>
          </View>
          
          <View style={styles.clubDetails}>
            <Text style={styles.clubDetailText}>
              📅 Next: {new Date(club.nextMeeting).toLocaleDateString()}
            </Text>
            <Text style={styles.clubDetailText}>
              ⏰ {club.meetingTime}
            </Text>
            <Text style={styles.clubDetailText}>
              👥 {club.members} members
            </Text>
          </View>
          
          <View style={styles.moderatorInfo}>
            <Image source={{ uri: club.moderator.avatar }} style={styles.moderatorAvatar} />
            <Text style={styles.moderatorText}>
              Moderator: {club.moderator.name}
            </Text>
          </View>
          
          <View style={styles.clubActions}>
            {club.joined ? (
              <>
                <TouchableOpacity 
                  style={styles.joinRoomButton}
                  onPress={() => onJoinRoom(club)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.joinRoomButtonText}>🎤 Join Room</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.setMeetingButton}
                  onPress={() => onSetMeeting(club)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.setMeetingButtonText}>📅 Set Meeting</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.joinClubButton}
                onPress={() => onJoinClub(club.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.joinClubButtonText}>👥 Join Club</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

interface CommunityDetailScreenProps {
  communityId?: string;
}

export const CommunityDetailScreen: React.FC<CommunityDetailScreenProps> = ({ communityId }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reading-clubs'>('posts');
  const [newPostText, setNewPostText] = useState('');
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showSetMeetingModal, setShowSetMeetingModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<typeof readingClubs[0] | null>(null);
  
  // Simple scroll tracking for iOS compatibility (currently not used but kept for future enhancement)
  // const scrollY = useRef(new Animated.Value(0)).current;

  // Find the community based on the ID
  const community = communities.find(c => c.id === communityId) || communities[0];

  const handleUserClick = (userId: string) => {
    logger.info('User clicked:', userId);
  };

  const handleLike = (postId: string) => {
    logger.info('Post liked:', postId);
  };

  const handleComment = (postId: string) => {
    logger.info('Comment on post:', postId);
  };

  const handleJoinRoom = (club: typeof readingClubs[0]) => {
    logger.info('Join room for club:', club.name);
  };

  const handleJoinClub = (clubId: string) => {
    logger.info('Join club:', clubId);
  };

  const handleSetMeetingClick = (club: typeof readingClubs[0]) => {
    setSelectedClub(club);
    setShowSetMeetingModal(true);
  };

  const handleJoinActiveClub = (clubId: string) => {
    logger.info('Join active club:', clubId);
  };

  const handleCreatePost = () => {
    if (newPostText.trim()) {
      logger.info('Create post:', newPostText);
      setNewPostText('');
    }
  };

  const handleCreateClub = (clubData: {
    name: string;
    description: string;
    selectedBook: any;
    nextMeeting: string;
  }) => {
    // In a real app, this would create a new reading club
    logger.info('Create club:', clubData);
    logger.info('Formatted meeting date-time:', clubData.nextMeeting);
    setShowCreateClubModal(false);
  };

  const handleSetMeeting = (meetingData: {
    chapter: number;
    nextMeeting: string;
  }) => {
    // In a real app, this would update the meeting details
    logger.info('Meeting scheduled:', meetingData);
    logger.info('Formatted meeting date-time:', meetingData.nextMeeting);
    setShowSetMeetingModal(false);
    setSelectedClub(null);
  };

  // Find featured club - the one with the closest upcoming meeting
  const getFeaturedClub = () => {
    if (readingClubs.length === 0) return null;
    const now = new Date();
    return readingClubs.reduce((featured, current) => {
      const currentDate = new Date(current.nextMeeting);
      const featuredDate = featured ? new Date(featured.nextMeeting) : null;
      
      if (currentDate < now) return featured;
      
      if (!featured || !featuredDate || currentDate < featuredDate) {
        return {
          ...current,
          activeParticipants: Math.floor(Math.random() * 10) + 5
        };
      }
      return featured;
    }, null as any);
  };

  const featuredClub = getFeaturedClub();

  const renderPost = ({ item }: { item: typeof communityPosts[0] }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onUserPress={handleUserClick}
    />
  );

  const renderClub = ({ item }: { item: typeof readingClubs[0] }) => (
    <ReadingClubCard
      club={item}
      onJoinRoom={handleJoinRoom}
      onJoinClub={handleJoinClub}
      onSetMeeting={handleSetMeetingClick}
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Community Header */}
        <View style={styles.communityHeader}>
          <Image source={{ uri: community.image }} style={styles.communityImage} />
          <View style={styles.communityOverlay}>
            <View style={styles.communityInfo}>
              <View style={styles.communityContent}>
                <Text style={styles.communityTitle}>{community.name}</Text>
                <Text style={styles.communityDescription}>{community.description}</Text>
                <Text style={styles.communityMembers}>👥 {community.members} members</Text>
              </View>
              <TouchableOpacity style={styles.joinCommunityButton} activeOpacity={0.8}>
                <Text style={styles.joinCommunityButtonText}>Join Community</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sticky Navigation Tabs */}
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
              Reading Clubs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
        {activeTab === 'posts' && (
          <View>
            {/* Create New Post */}
            <View style={styles.createPostContainer}>
              <Image source={{ uri: users[0].avatar }} style={styles.createPostAvatar} />
              <View style={styles.createPostContent}>
                <TextInput
                  style={styles.createPostInput}
                  placeholder="¿Qué estás leyendo?"
                  placeholderTextColor={colors.neutral.gray500}
                  value={newPostText}
                  onChangeText={setNewPostText}
                  multiline
                />
                <View style={styles.createPostActions}>
                  <TouchableOpacity style={styles.imageButton} activeOpacity={0.7}>
                    <Text style={styles.imageButtonText}>🖼️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.publishButton,
                      !newPostText.trim() && styles.publishButtonDisabled
                    ]}
                    onPress={handleCreatePost}
                    disabled={!newPostText.trim()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.publishButtonText}>Publicar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Posts Feed */}
            <FlatList
              data={communityPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
            />
          </View>
        )}

        {activeTab === 'reading-clubs' && (
          <View>
            {/* Create New Reading Club Button */}
            <View style={styles.createClubContainer}>
              <TouchableOpacity 
                style={styles.createClubButton}
                onPress={() => setShowCreateClubModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.createClubButtonText}>+ Create Reading Club</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Reading Club */}
            {featuredClub && (
              <View style={styles.featuredSection}>
                <Text style={styles.featuredTitle}>Featured Active Club</Text>
                <ActiveReadingClub club={featuredClub} onJoin={handleJoinActiveClub} />
              </View>
            )}

            {/* Reading Clubs List */}
            {readingClubs.length > 0 ? (
              <View>
                <Text style={styles.allClubsTitle}>All Reading Clubs</Text>
                <FlatList
                  data={readingClubs}
                  renderItem={renderClub}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.clubSeparator} />}
                />
              </View>
            ) : (
              <View style={styles.emptyClubsContainer}>
                <Text style={styles.emptyClubsIcon}>📖</Text>
                <Text style={styles.emptyClubsTitle}>No reading clubs yet</Text>
                <Text style={styles.emptyClubsText}>
                  Create a reading club to start discussing books with community members.
                </Text>
                <TouchableOpacity 
                  style={styles.createFirstClubButton}
                  onPress={() => setShowCreateClubModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createFirstClubButtonText}>+ Create your first reading club</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        </View>
      </ScrollView>

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
    </View>
  );
};

// const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  scrollContainer: {
    flex: 1,
    ...Platform.select({
      ios: {
        backgroundColor: colors.neutral.gray50,
      },
      android: {
        backgroundColor: colors.neutral.gray50,
      },
      web: {
        backgroundColor: colors.neutral.gray50,
      },
    }),
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
  tabContent: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  createPostContainer: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  createPostContent: {
    flex: 1,
  },
  createPostInput: {
    fontSize: 16,
    color: colors.neutral.gray900,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
    paddingBottom: 8,
    marginBottom: 16,
    minHeight: 40,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageButton: {
    padding: 8,
  },
  imageButtonText: {
    fontSize: 20,
  },
  publishButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    backgroundColor: colors.primary.indigo200,
  },
  publishButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
  },
  postTime: {
    fontSize: 12,
    color: colors.neutral.gray500,
  },
  postContent: {
    fontSize: 16,
    color: colors.neutral.gray800,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  actionText: {
    fontSize: 14,
    color: colors.neutral.gray500,
  },
  postSeparator: {
    height: 1,
    backgroundColor: colors.neutral.gray200,
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
  featuredSection: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 12,
  },
  allClubsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  clubCard: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    overflow: 'hidden',
  },
  clubCardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  clubCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clubCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    flex: 1,
  },
  clubStatus: {
    marginLeft: 8,
  },
  memberBadge: {
    backgroundColor: colors.green[100],
    color: colors.green[600],
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: colors.neutral.gray100,
    color: colors.neutral.gray600,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clubCardDescription: {
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  clubCardContent: {
    padding: 16,
    flexDirection: 'row',
  },
  clubBookCover: {
    width: 96,
    height: 144,
    borderRadius: 8,
    marginRight: 16,
    resizeMode: 'cover',
  },
  clubBookInfo: {
    flex: 1,
  },
  clubBookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  clubBookAuthor: {
    fontSize: 14,
    color: colors.neutral.gray500,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    marginBottom: 4,
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
  },
  clubDetails: {
    marginBottom: 16,
  },
  clubDetailText: {
    fontSize: 14,
    color: colors.neutral.gray500,
    marginBottom: 2,
  },
  moderatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moderatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  moderatorText: {
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  clubActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinRoomButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
  },
  joinRoomButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  setMeetingButton: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
  },
  setMeetingButtonText: {
    color: colors.neutral.gray700,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  joinClubButton: {
    backgroundColor: colors.primary.indigo600,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
  },
  joinClubButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
});
