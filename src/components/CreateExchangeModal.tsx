import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { bookApi, userApi, exchangeApi } from '../services/api';
import { BookDto, UserDto, UserBookDto, CreateBookExchangeDto } from '../types/api';
import { colors, theme } from '../constants';
import { logger } from '../utils/logger';

interface CreateExchangeModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentUserId: string;
  onSuccess?: (exchange: any) => void;
  preSelectedBook?: BookDto;
  preSelectedUser?: UserDto;
}

interface Step1State {
  searchQuery: string;
  searchResults: BookDto[];
  selectedBooks: BookDto[];
  isSearching: boolean;
}

interface Step2State {
  users: UserDto[];
  selectedUser: UserDto | null;
  isSearching: boolean;
}

interface Step3State {
  myBooks: UserBookDto[];
  selectedMyBooks: UserBookDto[];
  isLoading: boolean;
}

const CreateExchangeModal: React.FC<CreateExchangeModalProps> = ({
  isVisible,
  onClose,
  currentUserId,
  onSuccess,
  preSelectedBook,
  preSelectedUser,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Step 1 state
  const [step1, setStep1] = useState<Step1State>({
    searchQuery: '',
    searchResults: [],
    selectedBooks: [],
    isSearching: false,
  });

  // Step 2 state
  const [step2, setStep2] = useState<Step2State>({
    users: [],
    selectedUser: null,
    isSearching: false,
  });

  // Step 3 state
  const [step3, setStep3] = useState<Step3State>({
    myBooks: [],
    selectedMyBooks: [],
    isLoading: false,
  });

  // Step 3: Load user's library
  const loadMyBooks = useCallback(async () => {
    setStep3(prev => ({ ...prev, isLoading: true }));
    try {
      const books = await bookApi.getUserLibrary(currentUserId, { wantsToExchange: true });
      setStep3(prev => ({ ...prev, myBooks: books, isLoading: false }));
    } catch (error) {
      logger.error('Error loading user library:', error);
      setStep3(prev => ({ ...prev, myBooks: [], isLoading: false }));
    }
  }, [currentUserId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      // If both book and user are pre-selected, skip to step 3
      const hasPreSelection = preSelectedBook && preSelectedUser;
      
      if (hasPreSelection) {
        logger.info('📚 Pre-selected book and user detected, skipping to step 3');
        setCurrentStep(3);
        setStep1({
          searchQuery: '',
          searchResults: [],
          selectedBooks: [preSelectedBook],
          isSearching: false,
        });
        setStep2({
          users: [preSelectedUser],
          selectedUser: preSelectedUser,
          isSearching: false,
        });
        setStep3({
          myBooks: [],
          selectedMyBooks: [],
          isLoading: false,
        });
        // Load my books for step 3
        loadMyBooks();
      } else {
        setCurrentStep(1);
        setStep1({
          searchQuery: '',
          searchResults: [],
          selectedBooks: [],
          isSearching: false,
        });
        setStep2({
          users: [],
          selectedUser: null,
          isSearching: false,
        });
        setStep3({
          myBooks: [],
          selectedMyBooks: [],
          isLoading: false,
        });
      }
      setIsCreating(false);
    }
  }, [isVisible, preSelectedBook, preSelectedUser, loadMyBooks]);

  // Step 1: Search books
  const searchBooks = async (query: string) => {
    if (!query.trim()) {
      setStep1(prev => ({ ...prev, searchResults: [] }));
      return;
    }

    setStep1(prev => ({ ...prev, isSearching: true }));
    try {
      const books = await bookApi.searchBooks(query);
      setStep1(prev => ({ ...prev, searchResults: books, isSearching: false }));
    } catch (error) {
      logger.error('Error searching books:', error);
      setStep1(prev => ({ ...prev, searchResults: [], isSearching: false }));
    }
  };

  const toggleBookSelection = (book: BookDto) => {
    setStep1(prev => ({
      ...prev,
      selectedBooks: prev.selectedBooks.some(b => b.id === book.id)
        ? prev.selectedBooks.filter(b => b.id !== book.id)
        : [...prev.selectedBooks, book]
    }));
  };


  // Step 2: Search users by books
  const searchUsersByBooks = async () => {
    if (step1.selectedBooks.length === 0) return;

    setStep2(prev => ({ ...prev, isSearching: true }));
    try {
      const bookIds = step1.selectedBooks.map(book => book.id);
      const users = await userApi.searchUsersByBooks({ book_ids: bookIds });
      setStep2(prev => ({ ...prev, users, isSearching: false }));
      
      // Log users found with their complete information
      logger.info('👤 [CreateExchangeModal] Users found:', users.map(user => ({
        id: user.id,
        name: `${user.name} ${user.lastname}`,
        username: user.username,
        hasAddress: !!user.address,
        address: user.address ? {
          city: user.address.city,
          state: user.address.state,
          country: user.address.country
        } : null,
        hasUserRate: !!user.user_rate,
        userRate: user.user_rate ? {
          average_rating: user.user_rate.average_rating ?? 0,
          total_ratings: user.user_rate.total_ratings ?? 0
        } : null
      })));
    } catch (error) {
      logger.error('Error searching users:', error);
      setStep2(prev => ({ ...prev, users: [], isSearching: false }));
    }
  };

  const selectUser = (user: UserDto) => {
    setStep2(prev => ({ ...prev, selectedUser: user }));
  };

  const toggleMyBookSelection = (book: UserBookDto) => {
    setStep3(prev => ({
      ...prev,
      selectedMyBooks: prev.selectedMyBooks.some(b => b.id === book.id)
        ? prev.selectedMyBooks.filter(b => b.id !== book.id)
        : [...prev.selectedMyBooks, book]
    }));
  };

  // Step 4: Confirmation
  const renderStep4 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.confirmationHeader}>
        <MaterialIcons name="check-circle" size={32} color={colors.status.success} />
        <Text style={styles.confirmationTitle}>Confirmar intercambio</Text>
        <Text style={styles.confirmationSubtitle}>Revisa tu propuesta antes de enviarla:</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="menu-book" size={20} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>Quiero recibir:</Text>
          </View>
          {step1.selectedBooks.map((book) => (
            <View key={book.id} style={styles.summaryBookItem}>
              <Text style={styles.summaryBookTitle}>• {book.title} - {book.author}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={20} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>De usuario:</Text>
          </View>
          <Text style={styles.summaryUserName}>• {step2.selectedUser?.name} {step2.selectedUser?.lastname} (@{step2.selectedUser?.username})</Text>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="library-books" size={20} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>Voy a ofrecer:</Text>
          </View>
          {step3.selectedMyBooks.map((userBook) => (
            <View key={userBook.id} style={styles.summaryBookItem}>
              <Text style={styles.summaryBookTitle}>• {userBook.book.title} - {userBook.book.author}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // Create exchange
  const createExchange = async () => {
    if (!step2.selectedUser || step3.selectedMyBooks.length === 0) return;

    setIsCreating(true);
    try {
      const exchangeData: CreateBookExchangeDto = {
        owner_id: step2.selectedUser.id,
        requester_id: currentUserId,
        owner_book_ids: step1.selectedBooks.map(book => book.id),
        requester_book_ids: step3.selectedMyBooks.map(book => book.book.id),
      };

      const exchange = await exchangeApi.createExchange(exchangeData);
      
      // Close modal immediately and trigger success callback
      onSuccess?.(exchange);
      onClose();
      
      // Show success message after modal is closed
      setTimeout(() => {
        Alert.alert('Éxito', 'Intercambio creado exitosamente');
      }, 100);
    } catch (error) {
      logger.error('Error creating exchange:', error);
      Alert.alert('Error', 'No se pudo crear el intercambio');
    } finally {
      setIsCreating(false);
    }
  };

  // Navigation handlers
  const goToStep2 = () => {
    if (step1.selectedBooks.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un libro');
      return;
    }
    setCurrentStep(2);
    searchUsersByBooks();
  };

  const goToStep3 = () => {
    if (!step2.selectedUser) {
      Alert.alert('Error', 'Debes seleccionar un usuario');
      return;
    }
    setCurrentStep(3);
    loadMyBooks();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep > step ? styles.stepCircleCompleted :
            currentStep === step ? styles.stepCircleActive : 
            styles.stepCircleInactive
          ]}>
            {currentStep > step ? (
              <MaterialIcons name="check" size={16} color={colors.neutral.white} />
            ) : (
              <Text style={[
                styles.stepNumber,
                currentStep === step ? styles.stepNumberActive : styles.stepNumberInactive
              ]}>
                {step}
              </Text>
            )}
          </View>
          <Text style={styles.stepLabel}>
            {step === 1 ? 'Buscar libros' : 
             step === 2 ? 'Seleccionar usuario' : 
             step === 3 ? 'Mis libros' : 
             'Confirmar'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <MaterialIcons name="menu-book" size={28} color={colors.primary.main} />
        <Text style={styles.stepTitle}>Buscar libros que deseas</Text>
        <Text style={styles.stepDescription}>
          Busca los libros que te gustaría recibir en el intercambio
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.neutral.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, autor o ISBN..."
          placeholderTextColor={colors.neutral.gray400}
          value={step1.searchQuery}
          onChangeText={(text) => {
            setStep1(prev => ({ ...prev, searchQuery: text }));
            searchBooks(text);
          }}
        />
        {step1.isSearching && (
          <ActivityIndicator size="small" color={colors.primary.main} />
        )}
      </View>

      {step1.isSearching && (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary.main} />
      )}

      <View style={styles.bookGrid}>
        {step1.searchResults.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.bookCard,
              step1.selectedBooks.some(b => b.id === book.id) && styles.bookCardSelected
            ]}
            onPress={() => toggleBookSelection(book)}
          >
            <Image source={{ uri: book.image }} style={styles.bookImage} />
            <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
            {step1.selectedBooks.some(b => b.id === book.id) && (
              <MaterialIcons 
                name="check-circle" 
                size={24} 
                color={colors.primary.main} 
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {step1.selectedBooks.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>Libros seleccionados ({step1.selectedBooks.length})</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.selectedBooksScrollView}
          >
            {step1.selectedBooks.map((book) => (
              <View key={book.id} style={styles.selectedBook}>
                <Image source={{ uri: book.image }} style={styles.selectedBookImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => toggleBookSelection(book)}
                >
                  <MaterialIcons name="close" size={16} color={colors.neutral.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <MaterialIcons name="people" size={28} color={colors.primary.main} />
        <Text style={styles.stepTitle}>Seleccionar usuario</Text>
        <Text style={styles.stepDescription}>
          Usuarios que tienen los libros que buscas disponibles para intercambio
        </Text>
      </View>
      
      {step2.isSearching ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary.main} />
      ) : (
        <View style={styles.userList}>
          {step2.users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.userCard,
                step2.selectedUser?.id === user.id && styles.userCardSelected
              ]}
              onPress={() => selectUser(user)}
            >
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name} {user.lastname}</Text>
                    {user.user_rate && user.user_rate.average_rating !== undefined && user.user_rate.average_rating !== null && (
                      <View style={styles.userRatingContainer}>
                        <MaterialIcons name="star" size={14} color={colors.status.warning} />
                        <Text style={styles.userRatingText}>
                          {user.user_rate.average_rating.toFixed(1)}
                        </Text>
                        <Text style={styles.userRatingCount}>
                          ({user.user_rate.total_ratings || 0})
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                  <View style={styles.userAddressContainer}>
                    <MaterialIcons name="location-on" size={14} color={colors.neutral.gray500} />
                    <Text style={styles.userLocation}>
                      {user.address ? (
                        `${user.address.city ? `${user.address.city}, ` : ''}${user.address.state}, ${user.address.country}`
                      ) : (
                        'Ubicación no especificada'
                      )}
                    </Text>
                  </View>
                </View>
              </View>
              {step2.selectedUser?.id === user.id && (
                <MaterialIcons name="check-circle" size={24} color={colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <MaterialIcons name="library-books" size={28} color={colors.primary.main} />
        <Text style={styles.stepTitle}>Seleccionar tus libros</Text>
        <Text style={styles.stepDescription}>
          Elige los libros de tu biblioteca que quieres ofrecer en el intercambio
        </Text>
      </View>
      
      {step3.isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary.main} />
      ) : (
        <View style={styles.bookGrid}>
          {step3.myBooks.map((userBook) => (
            <TouchableOpacity
              key={userBook.id}
              style={[
                styles.bookCard,
                step3.selectedMyBooks.some(b => b.id === userBook.id) && styles.bookCardSelected
              ]}
              onPress={() => toggleMyBookSelection(userBook)}
            >
              <Image source={{ uri: userBook.book.image }} style={styles.bookImage} />
              <Text style={styles.bookTitle} numberOfLines={2}>{userBook.book.title}</Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>{userBook.book.author}</Text>
              {step3.selectedMyBooks.some(b => b.id === userBook.id) && (
                <MaterialIcons 
                  name="check-circle" 
                  size={24} 
                  color={colors.primary.main} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step3.selectedMyBooks.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>Libros seleccionados ({step3.selectedMyBooks.length})</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderNavigationButtons = () => (
    <View style={styles.navigationButtons}>
      {currentStep > 1 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(currentStep - 1)}
        >
          <MaterialIcons name="chevron-left" size={20} color={colors.primary.main} />
          <Text style={styles.backButtonText}>Anterior</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.spacer} />
      
      {currentStep < 4 ? (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={currentStep === 1 ? goToStep2 : currentStep === 2 ? goToStep3 : () => setCurrentStep(4)}
          disabled={
            (currentStep === 1 && step1.selectedBooks.length === 0) ||
            (currentStep === 2 && !step2.selectedUser) ||
            (currentStep === 3 && step3.selectedMyBooks.length === 0)
          }
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3 ? 'Revisar' : 'Siguiente'}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          onPress={createExchange}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.neutral.white} />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color={colors.neutral.white} />
              <Text style={styles.createButtonText}>Enviar Propuestas</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.neutral.gray600} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <MaterialIcons name="swap-horiz" size={24} color={colors.primary.main} />
            <Text style={styles.headerTitle}>Crear Intercambio - Paso {currentStep}/4</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {renderStepIndicator()}

        <View style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </View>

        {renderNavigationButtons()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
    backgroundColor: colors.neutral.white,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.primary.main,
  },
  stepCircleInactive: {
    backgroundColor: colors.neutral.gray200,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.neutral.white,
  },
  stepNumberInactive: {
    color: colors.neutral.gray500,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for navigation buttons
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.text.primary,
  },
  loader: {
    marginVertical: 20,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bookCard: {
    width: '48%',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    position: 'relative',
  },
  bookCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  bookImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectedSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 12,
  },
  selectedBooksScrollView: {
    maxHeight: 100,
  },
  selectedBook: {
    position: 'relative',
    marginRight: 12,
  },
  selectedBookImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.status.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  userCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: colors.neutral.gray600,
    flex: 1,
    marginLeft: 4,
    lineHeight: 16,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  userRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginLeft: 2,
  },
  userRatingCount: {
    fontSize: 10,
    color: colors.neutral.gray600,
    marginLeft: 2,
  },
  userAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 2,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary.main,
    marginLeft: 4,
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    marginRight: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: colors.neutral.gray500,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  // Step 4 - Confirmation styles
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  summaryContainer: {
    gap: 24,
  },
  summarySection: {
    backgroundColor: colors.neutral.gray50,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  summaryBookItem: {
    marginBottom: 6,
  },
  summaryBookTitle: {
    fontSize: 14,
    color: theme.text.primary,
    lineHeight: 20,
  },
  summaryUserName: {
    fontSize: 14,
    color: theme.text.primary,
    fontWeight: '500',
  },
  // Enhanced existing styles
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholder: {
    width: 40,
  },
  stepCircleCompleted: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  stepLineCompleted: {
    backgroundColor: colors.status.success,
  },
  // New step styles
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

export default CreateExchangeModal;
