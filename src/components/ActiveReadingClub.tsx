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
import { useAuth } from '../contexts/AuthContext';

interface ActiveReadingClubProps {
  club: {
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
  };
  onJoin: (clubId: string) => void;
  onSetMeeting?: (club: any) => void;
}

export const ActiveReadingClub: React.FC<ActiveReadingClubProps> = ({
  club,
  onJoin,
  onSetMeeting
}) => {
  const { user } = useAuth();
  const isUserModerator = user?.id === club.moderator_id;

  return (
    <View style={styles.container}>

      <View style={styles.content}>
        {/* Book Cover */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: club.book?.image || 'https://via.placeholder.com/120x160?text=No+Image' }} 
            style={styles.bookCover} 
          />
          <View style={styles.chapterOverlay}>
            <Text style={styles.chapterText}>
              📖 Pages {club.current_chapter || 0}/{club.book?.pages || '?'}
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
          </View>

          <View style={styles.bookInfoSection}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {club.book?.title || 'Libro no disponible'}
            </Text>
            <Text style={styles.bookAuthor}>
              by {club.book?.author || 'Autor desconocido'}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>{club.member_count} members</Text>
            </View>
          </View>

          <View style={styles.moderatorContainer}>
            <Image 
              source={{ uri: club.moderator?.image || 'https://via.placeholder.com/24x24?text=M' }} 
              style={styles.moderatorAvatar} 
            />
            <Text style={styles.moderatorText}>
              Moderated by {club.moderator?.name || 'Moderador'} {club.moderator?.lastname || ''}
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => onJoin(club.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.joinButtonText}>Join Reading Club</Text>
            </TouchableOpacity>
            
            {isUserModerator && onSetMeeting && (
              <TouchableOpacity 
                style={styles.setMeetingButton}
                onPress={() => onSetMeeting(club)}
                activeOpacity={0.8}
              >
                <Text style={styles.setMeetingButtonText}>Set Meeting</Text>
              </TouchableOpacity>
            )}
          </View>
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    backgroundColor: colors.primary.indigo600,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  joinButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  setMeetingButton: {
    backgroundColor: colors.neutral.gray100,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  setMeetingButtonText: {
    color: colors.neutral.gray700,
    fontSize: 14,
    fontWeight: '600',
  },
});
