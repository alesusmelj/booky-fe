import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, theme, colors } from '../constants';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '../contexts/AuthContext';

interface TopNavbarProps {
  onNotificationPress?: () => void;
  hasNotifications?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  onNotificationPress = () => {},
  hasNotifications = false,
}) => {
  const { user } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const profileButtonRef = useRef<any>(null);

  const handleProfilePress = () => {
    if (profileButtonRef.current) {
      profileButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setDropdownPosition({
          x: pageX + width,
          y: pageY + height,
        });
        setDropdownVisible(true);
      });
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <MaterialIcons name="menu-book" size={32} color={theme.icon.primary} />
        <Text style={styles.brandText}>{strings.app.name}</Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          testID="notification-button"
          accessible={true}
          accessibilityLabel={strings.accessibility.notifications}
        >
          <MaterialIcons name="notifications-none" size={28} color={theme.icon.default} />
          {hasNotifications && <View style={styles.notificationDot} testID="notification-dot" />}
        </TouchableOpacity>
        
        <TouchableOpacity
          ref={profileButtonRef}
          style={styles.profileButton}
          onPress={handleProfilePress}
          activeOpacity={0.7}
          testID="profile-button"
          accessible={true}
          accessibilityLabel={strings.accessibility.profile}
        >
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} testID="user-avatar" />
          ) : (
            <View style={styles.defaultAvatar} testID="default-avatar">
              <MaterialIcons name="person" size={24} color={theme.icon.primary} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <UserDropdown
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        anchorPosition={dropdownPosition}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    marginLeft: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: colors.status.error,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.background.primary,
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray100,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
});