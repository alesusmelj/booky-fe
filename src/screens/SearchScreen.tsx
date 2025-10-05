import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { 
  SearchBox, 
  SearchFilters, 
  FilterType,
  UserSearchCard,
  BookSearchCard,
  CommunitySearchCard,
  ReadersMapButton,
  ReadersMapScreen
} from '../components';
import { colors, strings, theme } from '../constants';
import { useSearch, useCommunities } from '../hooks';
import { useNavigation } from '../contexts/NavigationContext';
import { logger } from '../utils/logger';

export function SearchScreen() {
  const { navigate } = useNavigation();
  const {
    users,
    books,
    communities,
    loading,
    error,
    query,
    activeFilters,
    setQuery,
    setActiveFilters,
    searchAll,
    clearResults,
    clearError,
  } = useSearch();

  const { joinCommunity, loading: communityLoading } = useCommunities();

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showReadersMap, setShowReadersMap] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim()) {
      const timeout = setTimeout(() => {
        searchAll(query, activeFilters);
      }, 500); // 500ms debounce

      setSearchTimeout(timeout);
    } else {
      clearResults();
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [query, activeFilters]);

  const handleFilterChange = (filters: FilterType[]) => {
    // Map FilterType to SearchFilter
    const searchFilters = filters.map(filter => {
      switch (filter) {
        case 'people':
          return 'users' as const;
        case 'books':
          return 'books' as const;
        case 'communities':
          return 'communities' as const;
        default:
          return filter as never;
      }
    }).filter(Boolean);

    setActiveFilters(searchFilters);
  };

  const handleUserPress = (userId: string) => {
    logger.info('👤 Navigating to user profile:', userId);
    navigate('profile', { userId });
  };


  const handleBookPress = (bookId: string, bookTitle?: string) => {
    logger.info('📚 Book pressed:', bookId);
    navigate('book-owners', { bookId, bookTitle });
  };

  const handleCommunityPress = (communityId: string) => {
    logger.info('🏘️ Navigating to community:', communityId);
    navigate('community-detail', { communityId });
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      logger.info('🏘️ Joining community:', communityId);
      
      const success = await joinCommunity(communityId);
      
      if (success) {
        Alert.alert('Éxito', 'Te has unido a la comunidad exitosamente!');
        logger.info('✅ Successfully joined community:', communityId);
      } else {
        Alert.alert('Error', 'No se pudo unir a la comunidad. Intenta de nuevo.');
      }
    } catch (error) {
      logger.error('❌ Error joining community:', error);
      Alert.alert('Error', 'No se pudo unir a la comunidad. Intenta de nuevo.');
    }
  };

  const handleReadersMapPress = () => {
    logger.info('🗺️ Opening readers map');
    console.log('🗺️ [SearchScreen] Opening readers map, current state:', showReadersMap);
    setShowReadersMap(true);
  };

  const handleCloseReadersMap = () => {
    logger.info('🗺️ Closing readers map');
    setShowReadersMap(false);
  };

  const shouldShowSection = (section: 'users' | 'books' | 'communities') => {
    return activeFilters.includes(section);
  };

  const hasResults = users.length > 0 || books.length > 0 || communities.length > 0;
  const showEmptyState = query.trim() && !loading && !hasResults && !error;

  return (
    <View style={styles.container}>
      <SearchBox
        value={query}
        onChangeText={setQuery}
        placeholder={strings.search.placeholder}
      />
      
      <SearchFilters
        activeFilters={activeFilters.map(filter => {
          switch (filter) {
            case 'users':
              return 'people' as FilterType;
            case 'books':
              return 'books' as FilterType;
            case 'communities':
              return 'communities' as FilterType;
            default:
              return filter as FilterType;
          }
        })}
        onFilterChange={handleFilterChange}
      />

      {/* Readers Map Button - Always visible */}
      <View style={styles.readersMapSection}>
        <ReadersMapButton onPress={handleReadersMapPress} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {showEmptyState && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No se encontraron resultados para "{query}"
          </Text>
          <Text style={styles.emptySubtext}>
            Intenta con otros términos de búsqueda
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {shouldShowSection('users') && users.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.search.sections.people}</Text>
            {users.map((user) => (
              <UserSearchCard
                key={user.id}
                user={user}
                onPress={() => handleUserPress(user.id)}
              />
            ))}
          </View>
        )}

        {shouldShowSection('books') && books.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.search.sections.books}</Text>
            
            {books.map((book) => (
              <BookSearchCard
                key={book.id}
                book={book}
                onPress={() => handleBookPress(book.id, book.title)}
              />
            ))}
          </View>
        )}

        {shouldShowSection('communities') && communities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.search.sections.communities}</Text>
            {communities.map((community) => (
              <CommunitySearchCard
                key={community.id}
                community={community}
                onPress={() => handleCommunityPress(community.id)}
                onJoin={() => handleJoinCommunity(community.id)}
                joinLoading={communityLoading}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Readers Map Modal */}
      <ReadersMapScreen
        visible={showReadersMap}
        onClose={handleCloseReadersMap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: theme.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  readersMapSection: {
    paddingVertical: 16,
  },
});