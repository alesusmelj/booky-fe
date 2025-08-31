import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';

interface NavbarProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

interface NavItem {
  key: string;
  icon: string;
  label: string;
  iconFamily: 'MaterialIcons' | 'Feather';
}

const navItems: NavItem[] = [
  { key: 'home', icon: 'home', label: 'Home', iconFamily: 'MaterialIcons' },
  { key: 'search', icon: 'search', label: 'Search', iconFamily: 'MaterialIcons' },
  { key: 'market', icon: 'tag', label: 'Market', iconFamily: 'Feather' },
  { key: 'community', icon: 'people', label: 'Community', iconFamily: 'MaterialIcons' },
  { key: 'messages', icon: 'message-circle', label: 'Messages', iconFamily: 'Feather' },
];

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab = 'home', 
  onTabPress = () => {} 
}) => {
  const renderIcon = (item: NavItem, isActive: boolean) => {
    const iconColor = isActive ? '#6366F1' : '#6B7280';
    const iconSize = 24;

    if (item.iconFamily === 'MaterialIcons') {
      return (
        <MaterialIcons 
          name={item.icon as any} 
          size={iconSize} 
          color={iconColor} 
        />
      );
    } else {
      return (
        <Feather 
          name={item.icon as any} 
          size={iconSize} 
          color={iconColor} 
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => onTabPress(item.key)}
            activeOpacity={0.7}
          >
            {renderIcon(item, isActive)}
            <Text style={[
              styles.label,
              isActive && styles.activeLabel
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#6366F1',
    fontWeight: '600',
  },
});