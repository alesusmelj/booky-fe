import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { 
  SearchBox, 
  SearchFilters, 
  FilterType, 
  BookCard, 
  BookData, 
  PersonCard, 
  PersonData, 
  CommunityCard, 
  CommunityData,
  ReadersMapButton 
} from '../components';
import { colors, strings } from '../constants';

// Mock data for development
const mockBooks: BookData[] = [
  {
    id: '1',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    genre: 'Literary Fiction',
    rating: 5,
    status: 'read',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
    isFavorite: true,
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    rating: 4,
    status: 'reading',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
    isFavorite: false,
  },
  {
    id: '3',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    rating: 3,
    status: 'available',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop',
    isFavorite: true,
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Classic',
    rating: 0,
    status: 'wishlist',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop',
    isFavorite: false,
  },
];

const mockPeople: PersonData[] = [
  {
    id: '1',
    name: 'Jane Cooper',
    bio: 'Book lover, coffee addict. Always looking for the next great story.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Alex Morgan',
    bio: 'Sci-fi enthusiast and aspiring writer. Will trade books for coffee.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    bio: 'Romance and mystery lover. Always happy to discuss books over tea.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

const mockCommunities: CommunityData[] = [
  {
    id: '1',
    name: 'Fantasy Book Lovers',
    description: 'For lovers of fantasy literature from classics to new releases',
    iconUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Madrid Book Club',
    description: 'Local book enthusiasts meeting monthly in Madrid',
    iconUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Science Fiction Explorers',
    description: 'Discussing the stars, space, and everything in between',
    iconUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=100&h=100&fit=crop',
  },
];

export function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['books', 'people', 'communities']);

  const handleBookPress = (_book: BookData) => {
    // TODO: Navigate to book details
  };

  const handleFavoritePress = (_book: BookData) => {
    // TODO: Toggle favorite status
  };

  const handlePersonPress = (_person: PersonData) => {
    // TODO: Navigate to person profile
  };

  const handleCommunityPress = (_community: CommunityData) => {
    // TODO: Navigate to community
  };

  const handleReadersMapPress = () => {
    // TODO: Navigate to readers map
  };

  const shouldShowSection = (section: 'books' | 'people' | 'communities') => {
    return activeFilters.includes(section);
  };

  return (
    <View style={styles.container}>
      <SearchBox
        value={searchText}
        onChangeText={setSearchText}
      />
      
      <SearchFilters
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {shouldShowSection('books') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{strings.search.sections.books}</Text>
              <ReadersMapButton onPress={handleReadersMapPress} />
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {mockBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onPress={() => handleBookPress(book)}
                  onFavoritePress={() => handleFavoritePress(book)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {shouldShowSection('people') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.search.sections.people}</Text>
            {mockPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onPress={() => handlePersonPress(person)}
              />
            ))}
          </View>
        )}

        {shouldShowSection('communities') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.search.sections.communities}</Text>
            {mockCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onPress={() => handleCommunityPress(community)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
  },
});