import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { colors } from '../constants';

interface ActiveReadingClubProps {
  club: {
    id: string;
    name: string;
    description: string;
    currentBook: {
      title: string;
      author: string;
      cover: string;
      currentChapter: number;
      totalChapters: number;
    };
    members: number;
    activeParticipants?: number;
    nextMeeting: string;
    moderator: {
      name: string;
      avatar: string;
    };
  };
  onJoin: (clubId: string) => void;
}

export const ActiveReadingClub: React.FC<ActiveReadingClubProps> = ({
  club,
  onJoin
}) => {
  // Calculate time remaining until next meeting
  const nextMeetingDate = new Date(club.nextMeeting);
  const now = new Date();
  const diffTime = Math.abs(nextMeetingDate.getTime() - now.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  const timeRemaining = diffDays > 0 
    ? `${diffDays}d ${diffHours}h remaining`
    : diffHours > 0 
    ? `${diffHours}h ${diffMinutes}m remaining`
    : `${diffMinutes} minutes remaining`;

  const isLive = diffDays === 0 && diffHours === 0 && diffMinutes < 30;

  return (
    <View style={styles.container}>
      {/* Live indicator */}
      {isLive && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE DISCUSSION NOW</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Book Cover */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: club.currentBook.cover }} 
            style={styles.bookCover} 
          />
          <View style={styles.chapterOverlay}>
            <Text style={styles.chapterText}>
              📖 Chapter {club.currentBook.currentChapter}/{club.currentBook.totalChapters}
            </Text>
          </View>
        </View>

        {/* Club Info */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.clubName} numberOfLines={1}>
                {club.name}
              </Text>
              <Text style={styles.clubDescription} numberOfLines={2}>
                {club.description}
              </Text>
            </View>
            {club.activeParticipants && (
              <View style={styles.activeParticipantsBadge}>
                <Text style={styles.activeParticipantsText}>
                  👥 {club.activeParticipants} active now
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bookInfoSection}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {club.currentBook.title}
            </Text>
            <Text style={styles.bookAuthor}>
              by {club.currentBook.author}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>⏰</Text>
              <Text style={styles.detailText}>{timeRemaining}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💬</Text>
              <Text style={styles.detailText}>Active discussion</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>{club.members} members</Text>
            </View>
          </View>

          <View style={styles.moderatorContainer}>
            <Image 
              source={{ uri: club.moderator.avatar }} 
              style={styles.moderatorAvatar} 
            />
            <Text style={styles.moderatorText}>
              Moderated by {club.moderator.name}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => onJoin(club.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonIcon}>
              {isLive ? '🎤' : '📖'}
            </Text>
            <Text style={styles.joinButtonText}>
              {isLive ? 'Join Live Discussion' : 'Join Reading Club'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary.indigo100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  liveIndicator: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  content: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: width * 0.3,
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  chapterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chapterText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  clubDescription: {
    fontSize: 14,
    color: colors.neutral.gray600,
    lineHeight: 18,
  },
  activeParticipantsBadge: {
    backgroundColor: colors.primary.indigo100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeParticipantsText: {
    fontSize: 12,
    color: colors.primary.indigo700,
    fontWeight: '600',
  },
  bookInfoSection: {
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: colors.neutral.gray600,
    flex: 1,
  },
  moderatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moderatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  moderatorText: {
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  joinButton: {
    backgroundColor: colors.primary.indigo600,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  joinButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
