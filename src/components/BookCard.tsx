import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, strings } from '../constants';

export interface BookData {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  status: 'read' | 'reading' | 'available' | 'wishlist';
  coverUrl: string;
  isFavorite?: boolean;
}

interface BookCardProps {
  book: BookData;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export function BookCard({ book, onPress, onFavoritePress }: BookCardProps) {
  const getStatusLabel = (status: BookData['status']) => {
    return strings.search.bookStatus[status];
  };

  const getStatusColor = (status: BookData['status']) => {
    switch (status) {
      case 'read':
        return colors.status.success;
      case 'reading':
        return colors.status.info;
      case 'available':
        return colors.status.warning;
      case 'wishlist':
        return colors.neutral.gray500;
      default:
        return colors.neutral.gray500;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={16}
          color={i <= rating ? '#FFB800' : colors.neutral.gray400}
        />
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
      <View style={styles.imageContainer}>
        <Image source={{ uri: book.coverUrl }} style={styles.coverImage} />
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(book.status)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          testID={`favorite-${book.id}`}
          accessible={true}
          accessibilityLabel={book.isFavorite ? 'Remover de favoritos' : 'Añadir a favoritos'}
        >
          <MaterialIcons
            name={book.isFavorite ? 'favorite' : 'favorite-border'}
            size={20}
            color={book.isFavorite ? colors.status.error : colors.neutral.white}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.ratingContainer}>
          {renderStars(book.rating)}
        </View>
        <Text style={styles.genre}>{book.genre}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  coverImage: {
    width: 140,
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.neutral.gray200,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
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
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  genre: {
    fontSize: 11,
    color: colors.neutral.gray500,
  },
});