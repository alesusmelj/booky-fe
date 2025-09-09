import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LibraryBookCard } from './LibraryBookCard';
import { strings, colors, theme } from '../constants';

// Mock data - replace with actual API data
const mockBooks = [
  {
    id: 1,
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    image: '/book1.jpg',
    isAvailable: false,
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    image: '/book2.jpg',
    isAvailable: true,
  },
  {
    id: 3,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    image: '/book3.jpg',
    isAvailable: false,
  },
];

export function MyLibraryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState(mockBooks);

  const handleToggleAvailability = (bookId: number) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, isAvailable: !book.isAvailable } : book
      )
    );
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
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

      <View style={styles.booksList}>
        {filteredBooks.map((book) => (
          <LibraryBookCard 
            key={book.id} 
            book={book} 
            onToggleAvailability={() => handleToggleAvailability(book.id)}
          />
        ))}
      </View>
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
});