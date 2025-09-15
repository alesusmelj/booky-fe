import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, colors, theme } from '../constants';
import BookImage from './BookImage';

interface Book {
  id: string;
  title: string;
  author: string;
  image: string;
  isAvailable: boolean;
  isUpdating?: boolean;
}

interface LibraryBookCardProps {
  book: Book;
  onToggleAvailability: () => void;
}

export function LibraryBookCard({ book, onToggleAvailability }: LibraryBookCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        book.isAvailable && styles.availableContainer,
        book.isUpdating && styles.updatingContainer
      ]}
      onPress={onToggleAvailability}
      disabled={book.isUpdating}
      testID={`book-card-${book.id}`}
      accessible={true}
      accessibilityLabel={`${book.title} de ${book.author}. ${book.isAvailable ? strings.commerce.status.available : strings.commerce.status.notAvailable}`}
    >
      <BookImage 
        source={book.image} 
        size="small"
        containerStyle={styles.bookImageContainer}
      />
      
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        
        <View style={styles.availabilityContainer}>
          {book.isUpdating ? (
            <ActivityIndicator size="small" color={colors.primary.main} />
          ) : (
            <MaterialIcons 
              name={book.isAvailable ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={book.isAvailable ? colors.status.success : colors.neutral.gray400} 
            />
          )}
          <Text style={[
            styles.availabilityText, 
            book.isAvailable && styles.availableText,
            book.isUpdating && styles.updatingText
          ]}>
            {book.isUpdating 
              ? 'Actualizando...' 
              : book.isAvailable 
                ? strings.commerce.status.available 
                : strings.commerce.status.notAvailable
            }
          </Text>
        </View>
      </View>

      {book.isAvailable && (
        <View style={styles.availableBadge}>
          <Text style={styles.availableBadgeText}>{strings.commerce.actions.makeAvailable}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  availableContainer: {
    borderWidth: 2,
    borderColor: colors.status.success,
    backgroundColor: colors.neutral.white,
  },
  updatingContainer: {
    opacity: 0.7,
    backgroundColor: colors.neutral.gray50,
  },
  bookImageContainer: {
    marginRight: 16,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityText: {
    fontSize: 14,
    color: colors.neutral.gray400,
  },
  availableText: {
    color: colors.status.success,
    fontWeight: '500',
  },
  updatingText: {
    color: colors.primary.main,
    fontStyle: 'italic',
  },
  availableBadge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  availableBadgeText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
});