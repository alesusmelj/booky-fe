import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import { BookDto } from '../types/api';

interface BookSearchCardProps {
  book: BookDto;
  onPress?: () => void;
  onAddToLibrary?: () => void;
}

export const BookSearchCard: React.FC<BookSearchCardProps> = ({
  book,
  onPress,
  onAddToLibrary,
}) => {
  const getBookCover = () => {
    if (book.image) {
      return (
        <Image 
          source={{ uri: book.image }} 
          style={styles.cover}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.defaultCover}>
        <MaterialIcons name="menu-book" size={32} color={colors.primary.main} />
      </View>
    );
  };

  const formatCategories = () => {
    if (!book.categories || book.categories.length === 0) {
      return 'Sin categoría';
    }
    return book.categories.slice(0, 2).join(', ');
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`book-card-${book.id}`}
      accessible={true}
      accessibilityLabel={`Libro: ${book.title} por ${book.author}`}
    >
      {getBookCover()}
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        <Text style={styles.categories} numberOfLines={1}>
          {formatCategories()}
        </Text>
        
        {book.rate && book.rate > 0 && (
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color={colors.status.warning} />
            <Text style={styles.rating}>{book.rate.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddToLibrary}
        testID={`add-book-${book.id}`}
        accessible={true}
        accessibilityLabel="Agregar a mi biblioteca"
      >
        <MaterialIcons name="add" size={20} color={colors.primary.main} />
      </TouchableOpacity>
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
  cover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.neutral.gray100,
    marginRight: 12,
  },
  defaultCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  author: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 4,
  },
  categories: {
    fontSize: 12,
    color: theme.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.status.warning,
    marginLeft: 4,
  },
  addButton: {
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
