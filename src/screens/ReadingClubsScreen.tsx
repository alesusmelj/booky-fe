import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { colors } from '../constants';
import { logger } from '../utils/logger';

// Mock data - should be moved to a service later
const readingClubs = [
  {
    id: '1',
    name: 'Classic Literature Club',
    currentBook: 'Pride and Prejudice',
    members: 28,
    meetingDay: 'Thursdays',
    progress: 65
  },
  {
    id: '2',
    name: 'Mystery Readers',
    currentBook: 'The Silent Patient',
    members: 42,
    meetingDay: 'Tuesdays',
    progress: 32
  },
  {
    id: '3',
    name: 'Sci-Fi Explorers',
    currentBook: 'Project Hail Mary',
    members: 15,
    meetingDay: 'Sundays',
    progress: 78
  },
];

interface ReadingClubCardProps {
  club: typeof readingClubs[0];
  onPress: (clubId: string) => void;
  onJoin: (clubId: string) => void;
}

const ReadingClubCard: React.FC<ReadingClubCardProps> = ({ club, onPress, onJoin }) => {
  return (
    <TouchableOpacity 
      style={styles.clubCard} 
      onPress={() => onPress(club.id)}
      activeOpacity={0.7}
    >
      <View style={styles.clubHeader}>
        <View style={styles.clubInfo}>
          <Text style={styles.clubName} numberOfLines={1}>
            {club.name}
          </Text>
          <View style={styles.membersContainer}>
            <Text style={styles.membersText}>
              👥 {club.members} members
            </Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <View style={styles.currentBookSection}>
        <Text style={styles.sectionLabel}>Currently Reading</Text>
        <View style={styles.bookInfo}>
          <Text style={styles.bookIcon}>📖</Text>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {club.currentBook}
          </Text>
        </View>
      </View>

      <View style={styles.meetingSection}>
        <Text style={styles.sectionLabel}>Next Meeting</Text>
        <View style={styles.meetingInfo}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.meetingDay}>
            {club.meetingDay}s
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionLabel}>Reading Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${club.progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {club.progress}% complete
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => onJoin(club.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.joinButtonText}>Join Club</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const ReadingClubsScreen: React.FC = () => {
  const handleClubPress = (clubId: string) => {
    // TODO: Navigate to club detail
    logger.info('Club pressed:', clubId);
  };

  const handleJoinClub = (clubId: string) => {
    // TODO: Implement join club functionality
    logger.info('Join club:', clubId);
  };

  const handleCreateClub = () => {
    // TODO: Navigate to create club screen
    logger.info('Create club pressed');
  };

  const renderClubCard = ({ item }: { item: typeof readingClubs[0] }) => (
    <ReadingClubCard
      club={item}
      onPress={handleClubPress}
      onJoin={handleJoinClub}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reading Clubs</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateClub}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Create Club</Text>
        </TouchableOpacity>
      </View>

      {/* Clubs List */}
      <FlatList
        data={readingClubs}
        renderItem={renderClubCard}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
});
