import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import { CommunityDto } from '../types/api';

interface CommunitySearchCardProps {
  community: CommunityDto;
  onPress?: () => void;
  onJoin?: () => void;
  isJoined?: boolean;
  joinLoading?: boolean;
}

export const CommunitySearchCard: React.FC<CommunitySearchCardProps> = ({
  community,
  onPress,
  onJoin,
  isJoined = false,
  joinLoading = false,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`community-card-${community.id}`}
      accessible={true}
      accessibilityLabel={`Comunidad: ${community.name}`}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="groups" size={32} color={colors.primary.main} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {community.description}
        </Text>
        
        <View style={styles.statsContainer}>
          <MaterialIcons name="people" size={16} color={theme.text.secondary} />
          <Text style={styles.memberCount}>
            {community.member_count} miembros
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.joinButton,
          isJoined && styles.joinedButton,
          joinLoading && styles.joinButtonDisabled,
        ]}
        onPress={onJoin}
        disabled={joinLoading}
        testID={`join-community-${community.id}`}
        accessible={true}
        accessibilityLabel={isJoined ? 'Salir de la comunidad' : 'Unirse a la comunidad'}
      >
        {joinLoading ? (
          <MaterialIcons name="hourglass-empty" size={16} color={colors.neutral.gray500} />
        ) : (
          <>
            <MaterialIcons 
              name={isJoined ? "check" : "add"} 
              size={16} 
              color={isJoined ? colors.status.success : colors.neutral.white} 
            />
            <Text style={[
              styles.joinButtonText,
              isJoined && styles.joinedButtonText,
            ]}>
              {isJoined ? 'Miembro' : 'Unirse'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: theme.background.primary,
    borderRadius: 12,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: theme.text.secondary,
    marginLeft: 4,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    minWidth: 90,
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: colors.status.successLight,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  joinButtonDisabled: {
    backgroundColor: colors.neutral.gray200,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: 4,
  },
  joinedButtonText: {
    color: colors.status.success,
  },
});
