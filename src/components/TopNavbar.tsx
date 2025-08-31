import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TopNavbarProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  hasNotifications?: boolean;
  userAvatar?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  onNotificationPress = () => {},
  onProfilePress = () => {},
  hasNotifications = false,
  userAvatar
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <MaterialIcons name="menu-book" size={32} color="#6366F1" />
        <Text style={styles.brandText}>Booky</Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          testID="notification-button"
          accessible={true}
          accessibilityLabel="Notifications"
        >
          <MaterialIcons name="notifications-none" size={28} color="#374151" />
          {hasNotifications && <View style={styles.notificationDot} testID="notification-dot" />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
          testID="profile-button"
          accessible={true}
          accessibilityLabel="Profile"
        >
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} testID="user-avatar" />
          ) : (
            <View style={styles.defaultAvatar} testID="default-avatar">
              <MaterialIcons name="person" size={24} color="#6366F1" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
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
    color: '#1F2937',
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
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
});