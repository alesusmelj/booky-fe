import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants';

export interface BookData {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  status: 'read' | 'reading' | 'available' | 'wishlist';
  coverUrl: string;
  isFavorite: boolean;
}

interface BookCardProps {
  book: BookData;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onFavoritePress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading':
        return colors.primary.main;
      case 'read':
        return colors.green[600];
      case 'available':
        return colors.status.info;
      case 'wishlist':
        return colors.status.warning;
      default:
        return colors.neutral.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reading':
        return 'Leyendo';
      case 'read':
        return 'Leído';
      case 'available':
        return 'Disponible';
      case 'wishlist':
        return 'Lista de deseos';
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, { color: i <= rating ? colors.status.warning : colors.neutral.gray300 }]}>
          ★
        </Text>
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      testID={`book-card-${book.id}`}
      accessible={true}
      accessibilityLabel={`Libro: ${book.title} por ${book.author}`}
    >
      <Image source={{ uri: book.coverUrl }} style={styles.cover} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        
        <Text style={styles.genre} numberOfLines={1}>
          {book.genre}
        </Text>
        
        {book.rating > 0 && (
          <View style={styles.ratingContainer}>
            {renderStars(book.rating)}
          </View>
        )}
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(book.status)}
          </Text>
        </View>
      </View>
      
      {onFavoritePress && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          testID={`favorite-${book.id}`}
          accessibilityLabel={book.isFavorite ? 'Remover de favoritos' : 'Añadir a favoritos'}
        >
          <Text style={[styles.favoriteIcon, { color: book.isFavorite ? colors.status.error : colors.neutral.gray400 }]}>
            {book.isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 12,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cover: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: colors.neutral.gray200,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 4,
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    color: colors.neutral.gray600,
    marginBottom: 4,
  },
  genre: {
    fontSize: 11,
    color: colors.neutral.gray500,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
    marginRight: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.neutral.white,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteIcon: {
    fontSize: 16,
  },
});

export default BookCard;
