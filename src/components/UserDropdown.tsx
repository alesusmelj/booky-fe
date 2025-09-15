import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';

interface UserDropdownProps {
  visible: boolean;
  onClose: () => void;
  anchorPosition: { x: number; y: number };
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  visible,
  onClose,
  anchorPosition,
}) => {
  const { signOut, user } = useAuth();
  const { navigate } = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, scaleAnim]);

  const handleMyProfile = () => {
    onClose();
    navigate('profile');
  };

  const handleLogout = async () => {
    onClose();
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!visible) return null;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate dropdown position
  const dropdownWidth = 200;
  const dropdownHeight = 120;
  
  // Position dropdown below and to the left of the anchor point
  const left = Math.min(anchorPosition.x - dropdownWidth + 40, screenWidth - dropdownWidth - 20);
  const top = Math.min(anchorPosition.y + 10, screenHeight - dropdownHeight - 20);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.dropdown,
            {
              left,
              top,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* User Info Header */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name} {user?.lastname}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Menu Items */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleMyProfile}
            activeOpacity={0.7}
          >
            <MaterialIcons name="person" size={20} color={colors.neutral.gray600} />
            <Text style={styles.menuText}>Mi perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={20} color={colors.status.error} />
            <Text style={[styles.menuText, styles.logoutText]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.neutral.gray500,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.gray200,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  menuText: {
    fontSize: 16,
    color: colors.neutral.gray700,
    marginLeft: 12,
    flex: 1,
  },
  logoutText: {
    color: colors.status.error,
  },
});
