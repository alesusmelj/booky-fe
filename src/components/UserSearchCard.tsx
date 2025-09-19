import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import { UserDto } from '../types/api';

interface UserSearchCardProps {
  user: UserDto;
  onPress?: () => void;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({
  user,
  onPress,
}) => {
  const getFullName = () => {
    return `${user.name} ${user.lastname}`.trim();
  };

  const getUserAvatar = () => {
    if (user.image) {
      return (
        <Image 
          source={{ uri: user.image }} 
          style={styles.avatar}
        />
      );
    }

    return (
      <View style={styles.defaultAvatar}>
        <MaterialIcons name="person" size={24} color={colors.primary.main} />
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`user-card-${user.id}`}
      accessible={true}
      accessibilityLabel={`Ver perfil de ${getFullName()}`}
    >
      {getUserAvatar()}
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {getFullName()}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
        {user.description && (
          <Text style={styles.description} numberOfLines={2}>
            {user.description}
          </Text>
        )}
      </View>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.gray100,
    marginRight: 12,
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 18,
  },
});
