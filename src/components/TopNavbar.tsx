import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { strings, theme, colors } from '../constants';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '../contexts/AuthContext';

interface TopNavbarProps {
  onNotificationPress?: () => void;
  hasNotifications?: boolean;
  disableSafeAreaTop?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  onNotificationPress = () => {},
  hasNotifications = false,
  disableSafeAreaTop = false,
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: disableSafeAreaTop ? 6 : insets.top + 6 }]}>
      <View style={styles.leftSection}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>{strings.app.name}</Text>
      </View>
      
      <View style={styles.rightSection}>
      
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
  logoImage: {
    width: 32,
    height: 32,
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