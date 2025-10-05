import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import BookImage from './BookImage';
import { logger } from '../utils/logger';
import { BooksService } from '../services/booksService';
import { UserBookDto } from '../types/api';

interface Book {
  id: string;
  title: string;
  author: string;
  image: string;
}

interface Exchange {
  id: string;
  exchangeNumber: string;
  requester: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    name: string;
  };
  requestedBooks: Book[];
  offeredBooks: Book[];
}

interface CounterOfferModalProps {
  visible: boolean;
  exchange: Exchange | null;
  currentUserId: string;
  onClose: () => void;
  onSubmit: (exchangeId: string, ownerBookIds: string[], requesterBookIds: string[]) => Promise<void>;
}

type Step = 1 | 2 | 3;

export function CounterOfferModal({
  visible,
  exchange,
  currentUserId,
  onClose,
  onSubmit,
}: CounterOfferModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [myBooks, setMyBooks] = useState<UserBookDto[]>([]);
  const [theirBooks, setTheirBooks] = useState<UserBookDto[]>([]);
  const [selectedMyBooks, setSelectedMyBooks] = useState<string[]>([]);
  const [selectedTheirBooks, setSelectedTheirBooks] = useState<string[]>([]);

  const isOwner = exchange?.owner.id === currentUserId;
  const otherUserId = isOwner ? exchange?.requester.id : exchange?.owner.id;
  const otherUserName = isOwner ? exchange?.requester.name : exchange?.owner.name;

  useEffect(() => {
    logger.info('🔄 CounterOfferModal useEffect triggered', {
      visible,
      hasExchange: !!exchange,
      exchangeId: exchange?.id,
      isOwner,
      otherUserId,
    });

    if (visible && exchange) {
      logger.info('✅ Starting loadBooks...');
      loadBooks();
      // Reset selections for new counter offer
      setSelectedMyBooks([]);
      setSelectedTheirBooks([]);
      setCurrentStep(1);
    }
  }, [visible, exchange]);

  const loadBooks = async () => {
    if (!exchange || !otherUserId) {
      logger.warn('⚠️ Cannot load books: missing exchange or otherUserId', {
        hasExchange: !!exchange,
        otherUserId,
      });
      return;
    }

    setLoadingBooks(true);
    try {
      logger.info('📚 Loading books for counter offer', {
        currentUserId,
        otherUserId,
      });

      // Load my books available for exchange
      const myBooksData = await BooksService.getUserLibrary(currentUserId, {
        wantsToExchange: true,
      });
      logger.info('✅ My books loaded:', myBooksData.length);
      setMyBooks(myBooksData);

      // Load their books available for exchange
      const theirBooksData = await BooksService.getUserLibrary(otherUserId, {
        wantsToExchange: true,
      });
      logger.info('✅ Their books loaded:', theirBooksData.length);
      setTheirBooks(theirBooksData);

      logger.info('✅ Books loaded for counter offer', {
        myBooksCount: myBooksData.length,
        theirBooksCount: theirBooksData.length,
      });
    } catch (error) {
      logger.error('❌ Error loading books:', error);
      Alert.alert('Error', 'No se pudieron cargar los libros disponibles');
    } finally {
      setLoadingBooks(false);
    }
  };

  const toggleMyBook = (bookId: string) => {
    setSelectedMyBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const toggleTheirBook = (bookId: string) => {
    setSelectedTheirBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedTheirBooks.length === 0) {
      Alert.alert(
        'Selección Requerida',
        'Debes seleccionar al menos un libro que quieras recibir'
      );
      return;
    }

    if (currentStep === 2 && selectedMyBooks.length === 0) {
      Alert.alert(
        'Selección Requerida',
        'Debes seleccionar al menos un libro que estés dispuesto a ofrecer'
      );
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!exchange) return;

    setLoading(true);
    try {
      // The API expects owner_book_ids and requester_book_ids (book IDs from userBook.book.id)
      const ownerBookIds = isOwner ? selectedMyBooks : selectedTheirBooks;
      const requesterBookIds = isOwner ? selectedTheirBooks : selectedMyBooks;

      logger.info('📤 [CounterOfferModal] Submitting counter offer:', {
        isOwner,
        exchangeId: exchange.id,
        selectedMyBooks,
        selectedTheirBooks,
        ownerBookIds,
        requesterBookIds,
        myBooksInfo: myBooks.map(ub => ({ bookId: ub.book.id, title: ub.book.title })),
        theirBooksInfo: theirBooks.map(ub => ({ bookId: ub.book.id, title: ub.book.title })),
      });

      await onSubmit(exchange.id, ownerBookIds, requesterBookIds);
      handleClose();
    } catch (error) {
      logger.error('❌ Error submitting counter offer:', error);
      Alert.alert('Error', 'No se pudo enviar la contraoferta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMyBooks([]);
    setSelectedTheirBooks([]);
    setCurrentStep(1);
    onClose();
  };

  if (!exchange) return null;

  // Debug logging for render
  logger.info('🎨 CounterOfferModal rendering', {
    currentStep,
    loadingBooks,
    myBooksCount: myBooks.length,
    theirBooksCount: theirBooks.length,
    selectedMyBooksCount: selectedMyBooks.length,
    selectedTheirBooksCount: selectedTheirBooks.length,
  });

  const getSelectedTheirBooksData = () => {
    return theirBooks.filter(ub => selectedTheirBooks.includes(ub.book.id));
  };

  const getSelectedMyBooksData = () => {
    return myBooks.filter(ub => selectedMyBooks.includes(ub.book.id));
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
              currentStep === step && styles.stepCircleCurrent,
            ]}
          >
            {currentStep > step ? (
              <MaterialIcons name="check" size={16} color={colors.neutral.white} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= step && styles.stepNumberActive,
                ]}
              >
                {step}
              </Text>
            )}
          </View>
          {step < 3 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepTitle = () => {
    const titles = {
      1: 'Libros que Solicitas',
      2: 'Libros que Ofreces',
      3: 'Revisar Contraoferta',
    };
    const subtitles = {
      1: `Selecciona los libros de ${otherUserName} que deseas recibir`,
      2: 'Selecciona tus libros que estás dispuesto a intercambiar',
      3: 'Revisa los detalles antes de enviar',
    };

    return (
      <View style={styles.stepTitleContainer}>
        <Text style={styles.stepTitle}>{titles[currentStep]}</Text>
        <Text style={styles.stepSubtitle}>{subtitles[currentStep]}</Text>
      </View>
    );
  };

  const renderStep1 = () => {
    logger.info('📖 Rendering Step 1 - Their Books:', {
      theirBooksCount: theirBooks.length,
      selectedCount: selectedTheirBooks.length,
    });

    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContentContainer}>
        <View style={styles.booksSection}>
          {theirBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="book" size={48} color={colors.neutral.gray400} />
              <Text style={styles.emptyText}>
                No hay libros disponibles para intercambio
              </Text>
            </View>
          ) : (
            theirBooks.map(userBook => (
            <TouchableOpacity
              key={userBook.book.id}
              style={[
                styles.bookItem,
                selectedTheirBooks.includes(userBook.book.id) && styles.bookItemSelected,
              ]}
              onPress={() => toggleTheirBook(userBook.book.id)}
            >
              <BookImage
                source={userBook.book.image}
                containerStyle={styles.bookImageContainer}
                size="small"
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {userBook.book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {userBook.book.author}
                </Text>
              </View>
              <View style={styles.checkbox}>
                {selectedTheirBooks.includes(userBook.book.id) ? (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={colors.status.success}
                  />
                ) : (
                  <View style={styles.checkboxEmpty} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
        <View style={styles.selectionSummary}>
          <MaterialIcons name="info-outline" size={20} color={colors.primary.main} />
          <Text style={styles.selectionSummaryText}>
            {selectedTheirBooks.length} {selectedTheirBooks.length === 1 ? 'libro seleccionado' : 'libros seleccionados'}
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderStep2 = () => {
    logger.info('📖 Rendering Step 2 - My Books:', {
      myBooksCount: myBooks.length,
      selectedCount: selectedMyBooks.length,
    });

    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContentContainer}>
        <View style={styles.booksSection}>
          {myBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="book" size={48} color={colors.neutral.gray400} />
              <Text style={styles.emptyText}>
                No tienes libros disponibles para intercambio
              </Text>
            </View>
          ) : (
            myBooks.map(userBook => (
            <TouchableOpacity
              key={userBook.book.id}
              style={[
                styles.bookItem,
                selectedMyBooks.includes(userBook.book.id) && styles.bookItemSelected,
              ]}
              onPress={() => toggleMyBook(userBook.book.id)}
            >
              <BookImage
                source={userBook.book.image}
                containerStyle={styles.bookImageContainer}
                size="small"
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {userBook.book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {userBook.book.author}
                </Text>
              </View>
              <View style={styles.checkbox}>
                {selectedMyBooks.includes(userBook.book.id) ? (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={colors.status.success}
                  />
                ) : (
                  <View style={styles.checkboxEmpty} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
        <View style={styles.selectionSummary}>
          <MaterialIcons name="info-outline" size={20} color={colors.primary.main} />
          <Text style={styles.selectionSummaryText}>
            {selectedMyBooks.length} {selectedMyBooks.length === 1 ? 'libro seleccionado' : 'libros seleccionados'}
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderStep3 = () => {
    const selectedTheirBooksData = getSelectedTheirBooksData();
    const selectedMyBooksData = getSelectedMyBooksData();

    logger.info('📖 Rendering Step 3 - Review:', {
      selectedTheirBooksCount: selectedTheirBooksData.length,
      selectedMyBooksCount: selectedMyBooksData.length,
    });

    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContentContainer}>
        <View style={styles.reviewSection}>
          {/* Their Books */}
          <View style={styles.reviewCategory}>
            <View style={styles.reviewHeader}>
              <MaterialIcons name="book" size={20} color={colors.primary.main} />
              <Text style={styles.reviewHeaderText}>
                Recibirás de {otherUserName}
              </Text>
            </View>
            {selectedTheirBooksData.map(userBook => (
              <View key={userBook.book.id} style={styles.reviewBookItem}>
                <BookImage
                  source={userBook.book.image}
                  containerStyle={styles.reviewBookImage}
                  size="small"
                />
                <View style={styles.reviewBookInfo}>
                  <Text style={styles.reviewBookTitle} numberOfLines={2}>
                    {userBook.book.title}
                  </Text>
                  <Text style={styles.reviewBookAuthor} numberOfLines={1}>
                    {userBook.book.author}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Exchange Icon */}
          <View style={styles.exchangeIconReview}>
            <MaterialIcons name="sync" size={32} color={colors.primary.main} />
          </View>

          {/* My Books */}
          <View style={styles.reviewCategory}>
            <View style={styles.reviewHeader}>
              <MaterialIcons name="book" size={20} color={colors.status.success} />
              <Text style={styles.reviewHeaderText}>
                Darás en Intercambio
              </Text>
            </View>
            {selectedMyBooksData.map(userBook => (
              <View key={userBook.book.id} style={styles.reviewBookItem}>
                <BookImage
                  source={userBook.book.image}
                  containerStyle={styles.reviewBookImage}
                  size="small"
                />
                <View style={styles.reviewBookInfo}>
                  <Text style={styles.reviewBookTitle} numberOfLines={2}>
                    {userBook.book.title}
                  </Text>
                  <Text style={styles.reviewBookAuthor} numberOfLines={1}>
                    {userBook.book.author}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Resumen de Contraoferta</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Intercambio:</Text>
              <Text style={styles.summaryValue}>{exchange.exchangeNumber}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Con:</Text>
              <Text style={styles.summaryValue}>{otherUserName}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Libros a recibir:</Text>
              <Text style={styles.summaryValueHighlight}>{selectedTheirBooks.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Libros a dar:</Text>
              <Text style={styles.summaryValueHighlight}>{selectedMyBooks.length}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Contraoferta</Text>
              <Text style={styles.subtitle}>
                {exchange.exchangeNumber}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.neutral.gray600} />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}
          {renderStepTitle()}

          <View style={styles.contentWrapper}>
            {loadingBooks ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={styles.loadingText}>Cargando libros...</Text>
              </View>
            ) : (
              <>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </>
            )}
          </View>

          <View style={styles.footer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                disabled={loading}
              >
                <MaterialIcons name="arrow-back" size={20} color={colors.primary.main} />
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 3 ? (
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  currentStep === 1 ? styles.nextButtonFull : {},
                ]}
                onPress={handleNext}
                disabled={loadingBooks}
              >
                <Text style={styles.nextButtonText}>Siguiente</Text>
                <MaterialIcons name="arrow-forward" size={20} color={colors.neutral.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.neutral.white} />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Enviar Contraoferta</Text>
                    <MaterialIcons name="send" size={20} color={colors.neutral.white} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.status.success,
  },
  stepCircleCurrent: {
    backgroundColor: colors.primary.main,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray600,
  },
  stepNumberActive: {
    color: colors.neutral.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.neutral.gray200,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.status.success,
  },
  stepTitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  contentWrapper: {
    flex: 1,
    minHeight: 200,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.text.secondary,
  },
  booksSection: {
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
  },
  bookItemSelected: {
    borderColor: colors.status.success,
    backgroundColor: colors.primary.light,
  },
  bookImageContainer: {
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
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
  checkbox: {
    width: 24,
    height: 24,
    marginLeft: 12,
  },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  selectionSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  reviewSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  reviewCategory: {
    marginBottom: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reviewHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  reviewBookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  reviewBookImage: {
    marginRight: 12,
  },
  reviewBookInfo: {
    flex: 1,
  },
  reviewBookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  reviewBookAuthor: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  exchangeIconReview: {
    alignItems: 'center',
    marginVertical: 16,
  },
  summaryCard: {
    backgroundColor: colors.primary.light,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.neutral.gray200,
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.neutral.white,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.main,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
  },
  nextButtonFull: {
    flex: 2,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.status.success,
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral.gray300,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});
