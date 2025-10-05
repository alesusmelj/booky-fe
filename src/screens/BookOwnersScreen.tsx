import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import { CreateExchangeModal } from '../components';
import { UsersService, SearchUsersByBooksDto } from '../services/usersService';
import { UserDto, BookDto } from '../types/api';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface BookOwnersScreenProps {
  bookId: string;
  bookTitle?: string;
}

export function BookOwnersScreen({ bookId, bookTitle }: BookOwnersScreenProps) {
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

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

  const handleRequestExchange = (targetUser: UserDto) => {
    logger.info('💱 Requesting exchange with user:', targetUser.id);
    setSelectedUser(targetUser);
    setShowExchangeModal(true);
  };

  const handleExchangeSuccess = () => {
    logger.info('✅ Exchange created successfully');
    setShowExchangeModal(false);
    setSelectedUser(null);
  };

  const handleCloseModal = () => {
    logger.info('❌ Exchange modal closed');
    setShowExchangeModal(false);
    setSelectedUser(null);
  };

  // Format address to avoid empty commas
  const formatAddress = (address: { city?: string; state: string; country: string }) => {
    const parts = [address.city, address.state, address.country].filter(part => part && part.trim() !== '');
    return parts.join(', ');
  };

  // Create a minimal BookDto for the pre-selection
  const preSelectedBook: BookDto | undefined = bookId
    ? {
        id: bookId,
        title: bookTitle || '',
        author: '',
        isbn: '',
      }
    : undefined;

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
            {users.map((targetUser) => (
              <View key={targetUser.id} style={styles.userCardContainer}>
                {/* Avatar - clickeable para ir al perfil */}
                <TouchableOpacity
                  onPress={() => handleUserPress(targetUser.id)}
                  activeOpacity={0.7}
                >
                  {targetUser.image ? (
                    <Image 
                      source={{ uri: targetUser.image }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.defaultAvatar}>
                      <MaterialIcons name="person" size={24} color={colors.primary.main} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Info del usuario - clickeable para ir al perfil */}
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => handleUserPress(targetUser.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.userName} numberOfLines={1}>
                    {`${targetUser.name} ${targetUser.lastname}`.trim()}
                  </Text>
                  <Text style={styles.username} numberOfLines={1}>
                    @{targetUser.username}
                  </Text>
                  {targetUser.address && (
                    <View style={styles.locationContainer}>
                      <MaterialIcons name="location-on" size={14} color={colors.status.info} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {formatAddress(targetUser.address)}
                      </Text>
                    </View>
                  )}
                  {targetUser.description && (
                    <Text style={styles.description} numberOfLines={2}>
                      {targetUser.description}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Botón de intercambio a la derecha */}
                <TouchableOpacity
                  style={styles.exchangeButton}
                  onPress={() => handleRequestExchange(targetUser)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="swap-horiz" size={20} color={colors.neutral.white} />
                  <Text style={styles.exchangeButtonText}>Intercambio</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Exchange Modal */}
      {user && (
        <CreateExchangeModal
          isVisible={showExchangeModal}
          onClose={handleCloseModal}
          currentUserId={user.id}
          onSuccess={handleExchangeSuccess}
          preSelectedBook={preSelectedBook}
          preSelectedUser={selectedUser || undefined}
        />
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
  userCardContainer: {
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.gray100,
    marginRight: 12,
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: colors.status.info,
    marginLeft: 4,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 18,
  },
  exchangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  exchangeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: 6,
  },
});

