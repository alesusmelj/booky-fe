import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { colors } from '../constants';
import { TimePicker } from './TimePicker';
import { Calendar } from './Calendar';
import { useBooks } from '../hooks';

interface Book {
  id: string;
  title: string;
  author: string;
  image?: string;
  isbn?: string;
  pages?: number;
  overview?: string;
  synopsis?: string;
  categories?: string[];
}

interface CreateReadingClubModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateClub: (clubData: {
    name: string;
    description: string;
    selectedBook: Book;
    nextMeeting: string;
  }) => void;
}


export const CreateReadingClubModal: React.FC<CreateReadingClubModalProps> = ({
  visible,
  onClose,
  onCreateClub
}) => {
  const [currentStep, setCurrentStep] = useState<'details' | 'book' | 'schedule'>('details');
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number }>({ hour: 19, minute: 0 });
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  // Use the books hook for real search
  const { books, loading: booksLoading, error: booksError, searchBooks, clearBooks } = useBooks();

  // Handle book search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (bookSearchQuery.trim()) {
        searchBooks(bookSearchQuery);
      } else {
        clearBooks();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [bookSearchQuery, searchBooks, clearBooks]);

  const resetForm = () => {
    setCurrentStep('details');
    setClubName('');
    setClubDescription('');
    setSelectedBook(null);
    setSelectedDate(undefined);
    setSelectedTime({ hour: 19, minute: 0 });
    setBookSearchQuery('');
    clearBooks();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateClub = () => {
    if (clubName && clubDescription && selectedBook && selectedDate) {
      // Create a new Date object combining the selected date and time
      const meetingDateTime = new Date(selectedDate);
      meetingDateTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);

      // Format to ISO string with microseconds (similar to the requested format)
      const formattedDateTime = meetingDateTime.toISOString().replace('Z', '') + '000';

      onCreateClub({
        name: clubName,
        description: clubDescription,
        selectedBook,
        nextMeeting: formattedDateTime
      });
      resetForm();
    }
  };

  const canProceedFromDetails = clubName.trim() && clubDescription.trim();
  const canProceedFromBook = selectedBook !== null;
  const canCreateClub = canProceedFromDetails && canProceedFromBook && selectedDate;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'details' && styles.activeStep,
          canProceedFromDetails && styles.completedStep
        ]}>
          <Text style={[
            styles.stepNumber,
            (currentStep === 'details' || canProceedFromDetails) && styles.activeStepText
          ]}>1</Text>
        </View>
        <Text style={styles.stepLabel}>Detalles</Text>
      </View>

      <View style={[styles.stepLine, canProceedFromDetails && styles.completedStepLine]} />

      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'book' && styles.activeStep,
          canProceedFromBook && styles.completedStep
        ]}>
          <Text style={[
            styles.stepNumber,
            (currentStep === 'book' || canProceedFromBook) && styles.activeStepText
          ]}>2</Text>
        </View>
        <Text style={styles.stepLabel}>Libro</Text>
      </View>

      <View style={[styles.stepLine, canProceedFromBook && styles.completedStepLine]} />

      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'schedule' && styles.activeStep,
          selectedDate && styles.completedStep
        ]}>
          <Text style={[
            styles.stepNumber,
            (currentStep === 'schedule' || selectedDate) && styles.activeStepText
          ]}>3</Text>
        </View>
        <Text style={styles.stepLabel}>Horario</Text>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información del Club</Text>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Nombre del Club</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Ej: Club de Fantasía Épica"
          placeholderTextColor={colors.neutral.gray500}
          value={clubName}
          onChangeText={setClubName}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Descripción</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          placeholder="Describe de qué trata este club y qué tipo de libros van a leer..."
          placeholderTextColor={colors.neutral.gray500}
          multiline
          numberOfLines={4}
          value={clubDescription}
          onChangeText={setClubDescription}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderBookStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Selecciona el Primer Libro</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar libros por título o autor..."
          value={bookSearchQuery}
          onChangeText={setBookSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {/* Loading State */}
      {booksLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary.main} />
          <Text style={styles.loadingText}>Buscando libros...</Text>
        </View>
      )}

      {/* Error State */}
      {booksError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{booksError}</Text>
        </View>
      )}

      {/* Empty State */}
      {!booksLoading && !booksError && bookSearchQuery && books.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron libros</Text>
          <Text style={styles.emptySubtext}>Intenta con otros términos de búsqueda</Text>
        </View>
      )}

      {/* Search Prompt */}
      {!bookSearchQuery && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>Escribe para buscar libros</Text>
        </View>
      )}

      {/* Books List */}
      {books.length > 0 && (
        <ScrollView style={styles.booksContainer} showsVerticalScrollIndicator={false}>
          {books.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={[
                styles.bookCard,
                selectedBook?.id === book.id && styles.selectedBookCard
              ]}
              onPress={() => setSelectedBook(book)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: book.image || 'https://via.placeholder.com/80x120?text=No+Image' }}
                style={styles.bookCover}
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor}>
                  por {book.author}
                </Text>
                {book.pages && (
                  <Text style={styles.bookChapters}>
                    {book.pages} páginas
                  </Text>
                )}
                {book.categories && book.categories.length > 0 && (
                  <Text style={styles.bookCategories} numberOfLines={1}>
                    {book.categories.join(', ')}
                  </Text>
                )}
              </View>
              {selectedBook?.id === book.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedCheckmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Programar Primera Reunión</Text>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Fecha de la Primera Reunión</Text>
        <Text style={styles.formHelper}>
          Selecciona cuándo será la primera reunión del club
        </Text>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          minDate={new Date()}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Hora de la Reunión</Text>
        <TimePicker
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          format24Hour={true}
          minuteInterval={15}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Club de Lectura</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.contentContainerInner}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 'details' && renderDetailsStep()}
            {currentStep === 'book' && renderBookStep()}
            {currentStep === 'schedule' && renderScheduleStep()}
          </ScrollView>

          <View style={styles.actionButtons}>
            {currentStep === 'details' ? (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !canProceedFromDetails && styles.disabledButton
                  ]}
                  onPress={() => setCurrentStep('book')}
                  disabled={!canProceedFromDetails}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.nextButtonText,
                    !canProceedFromDetails && styles.disabledButtonText
                  ]}>
                    Siguiente
                  </Text>
                </TouchableOpacity>
              </>
            ) : currentStep === 'book' ? (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep('details')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !canProceedFromBook && styles.disabledButton
                  ]}
                  onPress={() => setCurrentStep('schedule')}
                  disabled={!canProceedFromBook}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.nextButtonText,
                    !canProceedFromBook && styles.disabledButtonText
                  ]}>
                    Siguiente
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep('book')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    !canCreateClub && styles.disabledButton
                  ]}
                  onPress={handleCreateClub}
                  disabled={!canCreateClub}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.createButtonText,
                    !canCreateClub && styles.disabledButtonText
                  ]}>
                    Crear Club
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    flex: 1,
    marginVertical: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.neutral.gray500,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: colors.primary.indigo600,
  },
  completedStep: {
    backgroundColor: colors.status.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray600,
  },
  activeStepText: {
    color: colors.neutral.white,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.neutral.gray500,
    fontWeight: '500',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.neutral.gray200,
    marginHorizontal: 8,
  },
  completedStepLine: {
    backgroundColor: colors.status.success,
  },
  contentContainer: {
    flex: 1,
  },
  contentContainerInner: {
    flexGrow: 1,
  },
  stepContent: {
    padding: 20,
    minHeight: 200,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 20,
    textAlign: 'center',
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray700,
    marginBottom: 8,
  },
  formHelper: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginBottom: 12,
    lineHeight: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
    backgroundColor: colors.neutral.white,
    minHeight: 44,
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  booksContainer: {
    maxHeight: 300,
  },
  bookCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedBookCard: {
    borderColor: colors.primary.indigo600,
    backgroundColor: colors.primary.indigo50,
  },
  bookCover: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginBottom: 2,
  },
  bookChapters: {
    fontSize: 12,
    color: colors.neutral.gray500,
  },
  bookCategories: {
    fontSize: 12,
    color: colors.primary.indigo600,
    fontStyle: 'italic',
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.neutral.gray900,
    backgroundColor: colors.neutral.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: colors.status.error + '10',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray600,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.neutral.gray500,
  },
  promptContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 16,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.indigo600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray600,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.indigo600,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary.indigo600,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary.indigo600,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  disabledButton: {
    backgroundColor: colors.neutral.gray300,
  },
  disabledButtonText: {
    color: colors.neutral.gray500,
  },
});
