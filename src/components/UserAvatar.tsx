import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';

interface UserAvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  backgroundColor?: string;
  style?: any;
}

export function UserAvatar({ 
  imageUrl, 
  name, 
  size = 'medium', 
  backgroundColor = colors.primary.main,
  style 
}: UserAvatarProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'medium':
        return { width: 36, height: 36, borderRadius: 18 };
      case 'large':
        return { width: 48, height: 48, borderRadius: 24 };
      case 'xlarge':
        return { width: 80, height: 80, borderRadius: 40 };
      default:
        return { width: 36, height: 36, borderRadius: 18 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 18;
      case 'xlarge':
        return 32;
      default:
        return 14;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      case 'xlarge':
        return 40;
      default:
        return 20;
    }
  };

  const sizeStyle = getSize();
  const containerStyle = [
    styles.container,
    sizeStyle,
    { backgroundColor },
    style
  ];

  // If we have an image URL, show the image
  if (imageUrl) {
    return (
      <View style={containerStyle}>
        <Image 
          source={{ uri: imageUrl }} 
          style={[styles.image, sizeStyle]}
          onError={() => {
            // If image fails to load, this will fall back to the default avatar
            console.log('Failed to load user image:', imageUrl);
          }}
        />
      </View>
    );
  }

  // If we have a name, show the first letter
  if (name && name.trim()) {
    return (
      <View style={containerStyle}>
        <Text style={[styles.text, { fontSize: getFontSize() }]}>
          {name.trim().charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  // Default fallback - show person icon
  return (
    <View style={containerStyle}>
      <MaterialIcons 
        name="person" 
        size={getIconSize()} 
        color={colors.neutral.white} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    resizeMode: 'cover',
  },
  text: {
    color: colors.neutral.white,
    fontWeight: '700',
  },
});
