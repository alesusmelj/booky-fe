import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LibraryBookCard } from './LibraryBookCard';
import { strings, colors, theme } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../hooks/useBooks';
import { logger } from '../utils/logger';

export function MyLibraryView() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingBookId, setUpdatingBookId] = useState<string | null>(null);
  
  const {
    userBooks,
    loading,
    error,
    getUserLibrary,
    updateExchangePreference,
  } = useBooks();

  // Load user's library when component mounts
  useEffect(() => {
    if (user?.id) {
      getUserLibrary(user.id);
    }
  }, [user?.id, getUserLibrary]);

  const handleToggleAvailability = async (bookId: string) => {
    if (!userBooks || !user?.id) return;
    
    const book = userBooks.find(b => b.book.id === bookId);
    if (!book) return;

    setUpdatingBookId(bookId);
    
    try {
      await updateExchangePreference(book.book.id, {
        wants_to_exchange: !book.wants_to_exchange,
      });
      
      // Reload the library to show updated data
      await getUserLibrary(user.id);
    } catch (error) {
      logger.error('❌ Error updating exchange preference:', error);
    } finally {
      setUpdatingBookId(null);
    }
  };

  const filteredBooks = (userBooks || []).filter(book =>
    book.book?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.book?.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{strings.commerce.sections.myBooks}</Text>
      
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={theme.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={strings.commerce.labels.searchBooks}
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="search-books-input"
          accessible={true}
          accessibilityLabel={strings.commerce.labels.searchBooks}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Cargando tu biblioteca...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={24} color={colors.status.error} />
          <Text style={styles.errorText}>Error al cargar los libros</Text>
        </View>
      ) : filteredBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="book" size={48} color={colors.neutral.gray400} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No se encontraron libros' : 'No tienes libros en tu biblioteca'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Intenta con otro término de búsqueda' : 'Agrega algunos libros para comenzar'}
          </Text>
        </View>
      ) : (
        <View style={styles.booksList}>
          {filteredBooks.map((userBook) => (
            <LibraryBookCard 
              key={userBook.id} 
              book={{
                id: userBook.book.id,
                title: userBook.book.title || '',
                author: userBook.book.author || '',
                image: userBook.book.image || '',
                isAvailable: userBook.wants_to_exchange,
                isUpdating: updatingBookId === userBook.book.id,
              }}
              onToggleAvailability={() => handleToggleAvailability(userBook.book.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border.default,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
  },
  booksList: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
});