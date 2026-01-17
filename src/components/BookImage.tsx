import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import { ensureHttps } from '../utils';

interface BookImageProps {
  source: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

const BookImage: React.FC<BookImageProps> = ({
  source,
  style,
  containerStyle,
  size = 'small'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 44 };
      case 'medium':
        return { width: 48, height: 68 };
      case 'large':
        return { width: 64, height: 90 };
      default:
        return { width: 32, height: 44 };
    }
  };

  const sizeStyles = getSizeStyles();

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError || !source) {
    return (
      <View style={[
        styles.fallbackContainer,
        sizeStyles,
        containerStyle
      ]}>
        <MaterialIcons
          name="menu-book"
          size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
          color={colors.neutral.gray400}
        />
        <Text style={[
          styles.fallbackText,
          { fontSize: size === 'small' ? 8 : size === 'medium' ? 10 : 12 }
        ]}>
          📚
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: ensureHttps(source) }}
      style={[
        styles.image,
        sizeStyles,
        style
      ]}
      onError={handleImageError}
      onLoad={handleImageLoad}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    marginRight: 10,
  },
  fallbackContainer: {
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderStyle: 'dashed',
  },
  fallbackText: {
    color: colors.neutral.gray400,
    marginTop: 2,
  },
});

export default BookImage;
