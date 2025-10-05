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
  // Si join_available es true: usuario NO es miembro, mostrar botón "Unirse", NO permitir entrar
  // Si join_available es false: usuario YA es miembro, mostrar badge "Miembro", SÍ permitir entrar
  const isUserMember = !community.join_available;
  const canEnterCommunity = isUserMember;
  const showJoinButton = community.join_available;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={canEnterCommunity ? onPress : undefined}
      activeOpacity={canEnterCommunity ? 0.7 : 1}
      disabled={!canEnterCommunity}
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

      {showJoinButton ? (
        <TouchableOpacity
          style={[
            styles.joinButton,
            joinLoading && styles.joinButtonDisabled,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          disabled={joinLoading}
          testID={`join-community-${community.id}`}
          accessible={true}
          accessibilityLabel="Unirse a la comunidad"
        >
          {joinLoading ? (
            <MaterialIcons name="hourglass-empty" size={16} color={colors.neutral.gray500} />
          ) : (
            <>
              <MaterialIcons 
                name="add" 
                size={16} 
                color={colors.neutral.white} 
              />
              <Text style={styles.joinButtonText}>
                Unirse
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.memberBadge}>
          <MaterialIcons 
            name="check" 
            size={16} 
            color={colors.status.success} 
          />
          <Text style={styles.memberBadgeText}>Miembro</Text>
        </View>
      )}
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
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.status.successLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.status.success,
    minWidth: 90,
    justifyContent: 'center',
  },
  memberBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.status.success,
    marginLeft: 4,
  },
});
