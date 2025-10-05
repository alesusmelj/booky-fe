import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import { UserSearchCard } from '../components';
import { UsersService, SearchUsersByBooksDto } from '../services/usersService';
import { UserDto } from '../types/api';
import { useNavigation } from '../contexts/NavigationContext';
import { logger } from '../utils/logger';

interface BookOwnersScreenProps {
  bookId: string;
  bookTitle?: string;
}

export function BookOwnersScreen({ bookId, bookTitle }: BookOwnersScreenProps) {
  const { navigate } = useNavigation();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      logger.info('📚 Loading users with book:', bookId);

      const searchData: SearchUsersByBooksDto = {
        book_ids: [bookId],
      };

      const foundUsers = await UsersService.searchUsersByBooks(searchData);
      setUsers(foundUsers);

      logger.info('✅ Users loaded successfully:', foundUsers.length);
    } catch (err) {
      logger.error('❌ Error loading users:', err);
      setError('No se pudieron cargar los usuarios con este libro');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [bookId]);

  const handleUserPress = (userId: string) => {
    logger.info('👤 Navigating to user profile:', userId);
    navigate('profile', { userId });
  };

  const handleRefresh = () => {
    loadUsers(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="people" size={24} color={colors.primary.main} />
          <Text style={styles.headerTitle}>Usuarios con este libro</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="people" size={24} color={colors.primary.main} />
          <Text style={styles.headerTitle}>Usuarios con este libro</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.status.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="people" size={24} color={colors.primary.main} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Usuarios con este libro</Text>
          {bookTitle && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {bookTitle}
            </Text>
          )}
        </View>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="person-off" size={64} color={colors.neutral.gray400} />
          <Text style={styles.emptyText}>
            No hay usuarios con este libro disponible para intercambio
          </Text>
          <Text style={styles.emptySubtext}>
            Intenta buscar otros libros o vuelve más tarde
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
        >
          <View style={styles.usersContainer}>
            <Text style={styles.resultCount}>
              {users.length} {users.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}
            </Text>
            {users.map((user) => (
              <UserSearchCard
                key={user.id}
                user={user}
                onPress={() => handleUserPress(user.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  usersContainer: {
    paddingVertical: 16,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    paddingHorizontal: 16,
    marginBottom: 12,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error,
    textAlign: 'center',
    marginTop: 16,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
});

