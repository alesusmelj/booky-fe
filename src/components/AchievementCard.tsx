import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants';
import { UserAchievementDto, AchievementDto } from '../services/gamificationService';

interface AchievementCardProps {
  achievement: UserAchievementDto | AchievementDto;
  onPress?: () => void;
  earned?: boolean;
  progress?: number;
  compact?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
  earned = false,
  progress,
  compact = false,
}) => {
  const isUserAchievement = 'date_earned' in achievement;
  const achievementData = isUserAchievement ? achievement.achievement : achievement;

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'reading':
        return {
          background: colors.primary.light,
          icon: colors.primary.main,
          text: colors.primary.main,
        };
      case 'social':
        return {
          background: colors.green[100],
          icon: colors.green[600],
          text: colors.green[600],
        };
      case 'collection':
        return {
          background: '#F3E8FF',
          icon: '#9333EA',
          text: '#9333EA',
        };
      case 'exchange':
        return {
          background: '#FEF3C7',
          icon: '#D97706',
          text: '#D97706',
        };
      default:
        return {
          background: colors.neutral.gray100,
          icon: colors.neutral.gray600,
          text: colors.neutral.gray600,
        };
    }
  };

  const categoryColors = getCategoryColor(achievementData.category);

  const getAchievementIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'reading':
        return '📚';
      case 'social':
        return '👥';
      case 'collection':
        return '📖';
      case 'exchange':
        return '🔄';
      default:
        return '🏆';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          { backgroundColor: categoryColors.background },
          !earned && styles.compactCardDisabled,
        ]}
        onPress={onPress}
      >
        <View style={[styles.compactIconContainer, { backgroundColor: categoryColors.icon }]}>
          <Text style={styles.compactIcon}>
            {getAchievementIcon(achievementData.category)}
          </Text>
        </View>
        <Text style={[styles.compactTitle, { color: categoryColors.text }]} numberOfLines={1}>
          {achievementData.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: categoryColors.background },
        !earned && styles.cardDisabled,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryColors.icon }]}>
        <Text style={styles.icon}>
          {getAchievementIcon(achievementData.category)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: categoryColors.text }]} numberOfLines={2}>
          {achievementData.name}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {achievementData.description}
        </Text>

        {achievementData.points_reward && (
          <View style={styles.points}>
            <Text style={styles.pointsText}>+{achievementData.points_reward} pts</Text>
          </View>
        )}

        {progress !== undefined && progress < 100 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: categoryColors.icon,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}% Completado</Text>
          </View>
        )}

        {isUserAchievement && (
          <View style={styles.earnedContainer}>
            <Text style={styles.earnedText}>
              Obtenido el {new Date(achievement.date_earned).toLocaleDateString('es-ES')}
            </Text>
            {!achievement.notified && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NUEVO</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    minWidth: 120,
  },
  compactCardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  compactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 32,
  },
  compactIcon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginBottom: 8,
    textAlign: 'center',
  },
  points: {
    alignSelf: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.main,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral.white,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginTop: 4,
  },
  earnedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  earnedText: {
    fontSize: 12,
    color: colors.neutral.gray600,
  },
  newBadge: {
    backgroundColor: colors.status.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});

export default AchievementCard;
