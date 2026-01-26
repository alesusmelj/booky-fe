import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useBooks, useBarcodeHandler } from '../hooks';
import { UserLibraryBookCard } from '../components/BookCard';
import { BarcodeScannerWrapper } from '../components/BarcodeScannerWrapper';
import { UserBookDto, AddBookToLibraryDto, UpdateStatusDto, UpdateExchangePreferenceDto } from '../services/booksService';
import { logger } from '../utils/logger';

type LibraryFilter = 'all' | 'READING' | 'READ' | 'TO_READ' | 'WISHLIST' | 'favorites' | 'exchange';
type ViewMode = 'grid' | 'list';

export const LibraryScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Debug: Log when showBarcodeScanner changes
  useEffect(() => {
    logger.info('📱 [LIBRARY] showBarcodeScanner state changed to:', showBarcodeScanner);
  }, [showBarcodeScanner]);
  const [isbn, setIsbn] = useState('');
  const [readingStatus, setReadingStatus] = useState<'WISHLIST' | 'READING' | 'TO_READ' | 'READ'>('READING');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<UserBookDto | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookPreview, setBookPreview] = useState<any>(null);
  const [loadingBookData, setLoadingBookData] = useState(false);
  const [isbnScannedMessage, setIsbnScannedMessage] = useState<string | null>(null);
  const [lastFetchedISBN, setLastFetchedISBN] = useState<string | null>(null);

  // Barcode handler with debounce protection
  const handleBarcodeScannedInternal = (scannedISBN: string) => {
    logger.info('📱 [LIBRARY] Processing scanned ISBN:', scannedISBN);

    // Fill the ISBN input field and auto-fetch book data
    setIsbn(scannedISBN);
    setShowBarcodeScanner(false);

    // Show success message
    setIsbnScannedMessage(`📷 ISBN scanned: ${scannedISBN}`);

    // Auto-fetch book data immediately (mark as from scanner to avoid duplicate alerts)
    fetchBookByISBN(scannedISBN, true);

    // Reopen the Add Book modal so user can review and add manually
    setTimeout(() => {
      setShowAddBookModal(true);
      logger.info('📱 [LIBRARY] Add Book modal reopened with scanned ISBN and book data');

      // Clear the message after a few seconds
      setTimeout(() => {
        setIsbnScannedMessage(null);
      }, 3000);
    }, 300);
  };

  const { handleBarcodeScanned } = useBarcodeHandler({
    debounceMs: 2000, // 2 second debounce
    onBarcodeProcessed: handleBarcodeScannedInternal
  });

  const {
    userBooks,
    loading,
    error,
    getUserLibrary,
    addBookToLibrary,
    updateBookStatus,
    toggleBookFavorite,
    updateExchangePreference,
    getBookByIsbn,
  } = useBooks();

  useEffect(() => {
    if (user?.id) {
      loadLibrary();
    }
  }, [user?.id]);

  const loadLibrary = useCallback(async () => {
    if (!user?.id) return;

    try {
      await getUserLibrary(user.id);
    } catch (error) {
      logger.error('❌ Error loading library:', error);
      Alert.alert('Error', 'No se pudo cargar la biblioteca');
    }
  }, [user?.id, getUserLibrary]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLibrary();
    setRefreshing(false);
  }, [loadLibrary]);

  const getTabCounts = () => {
    if (!userBooks) return {};

    return {
      all: userBooks.length,
      READING: userBooks.filter(b => b.status === 'READING').length,
      read: userBooks.filter(b => b.status === 'READ').length,
      TO_READ: userBooks.filter(b => b.status === 'TO_READ').length,
      WISHLIST: userBooks.filter(b => b.status === 'WISHLIST').length,
      favorites: userBooks.filter(b => b.favorite).length,
      exchange: userBooks.filter(b => b.wants_to_exchange).length,
    };
  };

  const getFilteredBooks = () => {
    if (!userBooks) return [];

    let filtered = userBooks;

    // Apply tab filter
    switch (activeTab) {
      case 'favorites':
        filtered = filtered.filter(book => book.favorite);
        break;
      case 'exchange':
        filtered = filtered.filter(book => book.wants_to_exchange);
        break;
      case 'all':
        // Show all books - no filtering by status
        break;
      case 'READING':
      case 'TO_READ':
      case 'WISHLIST':
        filtered = filtered.filter(book => book.status === activeTab);
        break;
      case 'READ':
        // Handle READ -> read mapping (backend uses lowercase)
        filtered = filtered.filter(book => book.status === 'READ' || (book.status as any) === 'read');
        break;
      default:
        // Fallback for any other status
        filtered = filtered.filter(book => book.status === (activeTab as string));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.book?.title?.toLowerCase().includes(query) ||
        book.book?.author?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const handleScanISBN = () => {
    logger.info('📱 [LIBRARY] User pressed Scan book ISBN button - USING DIRECT APPROACH');

    // DIRECT SOLUTION: Close the add book modal and show scanner directly
    setShowAddBookModal(false);

    // Small delay to ensure modal closes, then show scanner
    setTimeout(() => {
      logger.info('📱 [LIBRARY] Opening scanner directly');
      setShowBarcodeScanner(true);
    }, 100);
  };


  const handleCloseBarcodeScanner = () => {
    setShowBarcodeScanner(false);
  };

  const fetchBookByISBN = async (isbnValue: string, fromScanner: boolean = false) => {
    if (!isbnValue.trim()) {
      setBookPreview(null);
      return;
    }

    const cleanISBN = isbnValue.trim();

    // Prevent duplicate calls - if we just fetched this ISBN, skip
    if (lastFetchedISBN === cleanISBN && !fromScanner) {
      logger.info('📚 [LIBRARY] Skipping duplicate fetch for ISBN:', cleanISBN);
      return;
    }

    // If already loading, don't make another call
    if (loadingBookData) {
      logger.info('📚 [LIBRARY] Already loading book data, skipping duplicate call');
      return;
    }

    setLastFetchedISBN(cleanISBN);
    setLoadingBookData(true);

    try {
      logger.info('📚 [LIBRARY] Fetching book data for ISBN:', cleanISBN);
      const bookData = await getBookByIsbn(cleanISBN);

      if (bookData) {
        setBookPreview(bookData);
        logger.info('📚 [LIBRARY] Book data fetched successfully:', bookData.title);
      } else {
        setBookPreview(null);
        // Only show alert if this is from scanner - not from typing
        if (fromScanner) {
          // Use setTimeout to ensure only one alert shows
          setTimeout(() => {
            Alert.alert('Libro No Encontrado', 'No se encontró ningún libro con este ISBN. Aún puedes agregarlo manualmente.');
          }, 100);
        }
      }
    } catch (error) {
      logger.error('📚 [LIBRARY] Error fetching book data:', error);
      setBookPreview(null);
      // Only show alert if this is from scanner - not from typing
      if (fromScanner) {
        // Use setTimeout to ensure only one alert shows
        setTimeout(() => {
          Alert.alert('Error', 'No se pudieron obtener los datos del libro. Aún puedes agregar el libro manualmente.');
        }, 100);
      }
    } finally {
      setLoadingBookData(false);
    }
  };

  const handleISBNChange = (value: string) => {
    setIsbn(value);
    // Auto-fetch book data when ISBN is complete (typically 10 or 13 digits)
    if (value.length >= 10) {
      fetchBookByISBN(value);
    } else {
      setBookPreview(null);
    }
  };

  const handleAddBook = async () => {
    if (!isbn.trim() || !readingStatus) {
      Alert.alert('Error', 'Por favor ingresa el ISBN y selecciona el estado de lectura');
      return;
    }

    try {
      const bookData: AddBookToLibraryDto = {
        isbn: isbn.trim(),
        status: readingStatus,
      };

      const success = await addBookToLibrary(bookData);
      if (success) {
        setShowAddBookModal(false);
        setIsbn('');
        setReadingStatus('READING');
        setBookPreview(null);

        const bookTitle = bookPreview?.title || 'Book';
        Alert.alert('Éxito', `${bookTitle} agregado a tu biblioteca!`);
      }
    } catch (error) {
      logger.error('❌ Error adding book:', error);
      Alert.alert('Error', 'No se pudo agregar el libro a la biblioteca');
    }
  };

  const handleBookPress = (book: UserBookDto) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const handleFavoritePress = async (book: UserBookDto) => {
    try {
      await toggleBookFavorite(book.book.id);
    } catch (error) {
      logger.error('❌ Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de favorito');
    }
  };

  const handleExchangePress = async (book: UserBookDto) => {
    try {
      const preferenceData: UpdateExchangePreferenceDto = {
        wants_to_exchange: !book.wants_to_exchange,
      };
      await updateExchangePreference(book.id, preferenceData);
    } catch (error) {
      logger.error('❌ Error updating exchange preference:', error);
      Alert.alert('Error', 'No se pudo actualizar la preferencia de intercambio');
    }
  };

  const handleStatusPress = (book: UserBookDto) => {
    Alert.alert(
      'Actualizar Estado',
      'Selecciona el nuevo estado de lectura:',
      [
        { text: 'Lista de Deseos', onPress: () => updateStatus(book.book.id, 'WISHLIST') },
        { text: 'Por Leer', onPress: () => updateStatus(book.book.id, 'TO_READ') },
        { text: 'Leyendo', onPress: () => updateStatus(book.book.id, 'READING') },
        { text: 'Leído', onPress: () => updateStatus(book.book.id, 'READ') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const updateStatus = async (bookId: string, status: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ') => {
    try {
      const statusData: UpdateStatusDto = { status };
      await updateBookStatus(bookId, statusData);
    } catch (error) {
      logger.error('❌ Error updating book status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del libro');
    }
  };

  const tabCounts = getTabCounts();
  const filteredBooks = getFilteredBooks();

  const tabs = [
    { id: 'all' as const, label: '📚 Todos los Libros', count: tabCounts.all || 0 },
    { id: 'READING' as const, label: '📖 Leyendo', count: tabCounts.READING || 0 },
    { id: 'READ' as const, label: '✅ Leídos', count: tabCounts.read || 0 },
    { id: 'TO_READ' as const, label: '📋 Por Leer', count: tabCounts.TO_READ || 0 },
    { id: 'WISHLIST' as const, label: '⭐ Lista de Deseos', count: tabCounts.WISHLIST || 0 },
    { id: 'favorites' as const, label: '❤️ Favoritos', count: tabCounts.favorites || 0 },
    { id: 'exchange' as const, label: '🔄 Intercambio', count: tabCounts.exchange || 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Biblioteca</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddBookModal(true)}
        >
          <Text style={styles.addButtonText}>+ Agregar Libro</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en biblioteca..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={styles.viewModeText}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.viewModeText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing && (
          <View style={styles.originalLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.originalLoadingText}>Cargando biblioteca...</Text>
          </View>
        )}

        {!loading && filteredBooks.length > 0 && (
          <View style={viewMode === 'grid' ? styles.booksGrid : styles.booksList}>
            {filteredBooks.map((book) => (
              <UserLibraryBookCard
                key={book.id}
                book={book}
                compact={viewMode === 'list'}
                onFavoritePress={() => handleFavoritePress(book)}
                onExchangePress={() => handleExchangePress(book)}
                onStatusChange={(newStatus) => updateStatus(book.id, newStatus)}
              />
            ))}
          </View>
        )}

        {!loading && filteredBooks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📚</Text>
            <Text style={styles.emptyStateTitle}>No se encontraron libros</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'WISHLIST'
                ? 'Agrega libros a tu lista de deseos para verlos aquí.'
                : searchQuery.trim()
                  ? 'Ningún libro coincide con tu búsqueda.'
                  : 'Agrega algunos libros a tu biblioteca para comenzar.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowAddBookModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Agrega tu primer libro</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Book Modal */}
      <Modal
        visible={showAddBookModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddBookModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="height"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalTitle}>Agregar Nuevo Libro</Text>

              <TouchableOpacity style={styles.scanButton} onPress={handleScanISBN}>
                <Text style={styles.scanButtonText}>📷 Escanear ISBN del libro</Text>
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ISBN</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ingresa el número ISBN"
                  value={isbn}
                  onChangeText={handleISBNChange}
                />
                <Text style={styles.inputHelp}>
                  El título y autor del libro se obtendrán automáticamente según el ISBN
                </Text>

                {/* Scanned ISBN Success Message */}
                {isbnScannedMessage && (
                  <View style={styles.scannedMessageContainer}>
                    <Text style={styles.scannedMessageText}>{isbnScannedMessage}</Text>
                  </View>
                )}

                {/* Loading indicator */}
                {loadingBookData && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary.main} />
                    <Text style={styles.loadingText}>Obteniendo datos del libro...</Text>
                  </View>
                )}

                {/* Book preview */}
                {bookPreview && (
                  <View style={styles.bookPreview}>
                    <Text style={styles.previewTitle}>📖 Libro Encontrado:</Text>
                    <Text style={styles.previewBookTitle}>{bookPreview.title}</Text>
                    {bookPreview.author && (
                      <Text style={styles.previewAuthor}>por {bookPreview.author}</Text>
                    )}
                    {bookPreview.genre && (
                      <Text style={styles.previewGenre}>Género: {bookPreview.genre}</Text>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Estado de Lectura</Text>
                <View style={styles.statusButtons}>
                  {[
                    { value: 'WISHLIST' as const, label: 'Lista de Deseos' },
                    { value: 'TO_READ' as const, label: 'Por Leer' },
                    { value: 'READING' as const, label: 'Leyendo' },
                    { value: 'READ' as const, label: 'Leído' },
                  ].map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.statusButton,
                        readingStatus === status.value && styles.activeStatusButton,
                      ]}
                      onPress={() => setReadingStatus(status.value)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          readingStatus === status.value && styles.activeStatusButtonText,
                        ]}
                      >
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddBookModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addBookButton, (!isbn.trim() || !readingStatus) && styles.disabledButton]}
                  onPress={handleAddBook}
                  disabled={!isbn.trim() || !readingStatus}
                >
                  <Text style={styles.addBookButtonText}>Agregar Libro</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Book Detail Modal */}
      <Modal
        visible={showBookModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBook && (
              <>
                <Text style={styles.modalTitle}>{selectedBook.book.title}</Text>
                <Text style={styles.modalAuthor}>por {selectedBook.book.author}</Text>
                {selectedBook.book.synopsis && (
                  <Text style={styles.modalSynopsis}>{selectedBook.book.synopsis}</Text>
                )}
                <View style={styles.bookDetails}>
                  <Text style={styles.bookDetailText}>Estado: {selectedBook.status}</Text>
                  <Text style={styles.bookDetailText}>
                    Favorito: {selectedBook.favorite ? 'Sí' : 'No'}
                  </Text>
                  <Text style={styles.bookDetailText}>
                    Disponible para intercambio: {selectedBook.wants_to_exchange ? 'Sí' : 'No'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setShowBookModal(false)}
                >
                  <Text style={styles.closeModalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal - FULL SCREEN APPROACH */}
      <Modal
        visible={showBarcodeScanner}
        transparent={false}
        animationType="slide"
        onRequestClose={handleCloseBarcodeScanner}
        presentationStyle="fullScreen"
      >
        <BarcodeScannerWrapper
          onBarcodeScanned={handleBarcodeScanned}
          onClose={handleCloseBarcodeScanner}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  addButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.neutral.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 4,
  },
  activeViewMode: {
    backgroundColor: colors.neutral.gray200,
  },
  viewModeText: {
    fontSize: 18,
    color: colors.neutral.gray600,
  },
  tabsCard: {
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray100,
  },
  activeTab: {
    backgroundColor: colors.primary.main,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  activeTabText: {
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  originalLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  originalLoadingText: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginTop: 8,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  booksList: {
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    width: '100%',
    maxHeight: '85%',
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.gray900,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalAuthor: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSynopsis: {
    fontSize: 14,
    color: colors.neutral.gray700,
    lineHeight: 20,
    marginBottom: 16,
  },
  bookDetails: {
    marginBottom: 20,
  },
  bookDetailText: {
    fontSize: 14,
    color: colors.neutral.gray700,
    marginBottom: 4,
  },
  scanButton: {
    backgroundColor: colors.neutral.gray100,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    borderStyle: 'dashed',
  },
  scanButtonText: {
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray700,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputHelp: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginTop: 4,
  },
  scannedMessageContainer: {
    backgroundColor: colors.green[100] || '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.success || '#4CAF50',
  },
  scannedMessageText: {
    fontSize: 14,
    color: colors.green[600] || '#2E7D32',
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeStatusButton: {
    backgroundColor: colors.primary.main,
  },
  statusButtonText: {
    fontSize: 12,
    color: colors.neutral.gray700,
  },
  activeStatusButtonText: {
    color: colors.neutral.white,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.neutral.gray700,
  },
  addBookButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.neutral.gray300,
  },
  addBookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  closeModalButton: {
    backgroundColor: colors.neutral.gray100,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 14,
    color: colors.neutral.gray700,
  },
  // New styles for book preview
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 6,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.neutral.gray600,
  },
  bookPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.green[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green[600],
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green[600],
    marginBottom: 4,
  },
  previewBookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 2,
  },
  previewAuthor: {
    fontSize: 12,
    color: colors.neutral.gray600,
    marginBottom: 2,
  },
  previewGenre: {
    fontSize: 11,
    color: colors.neutral.gray500,
  },
});

export default LibraryScreen;
