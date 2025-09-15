import { useState, useCallback } from 'react';
import { BooksService, BookDto, UserBookDto, AddBookToLibraryDto, UpdateStatusDto, UpdateExchangePreferenceDto } from '../services/booksService';
import { logger } from '../utils/logger';

export const useBooks = () => {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [userBooks, setUserBooks] = useState<UserBookDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🔍 Searching books:', query);

      const result = await BooksService.searchBooks(query);
      setBooks(result);
      
      logger.info('✅ Books search completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search books';
      setError(errorMessage);
      logger.error('❌ Books search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookByIsbn = useCallback(async (isbn: string): Promise<BookDto | null> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('📖 Getting book by ISBN:', isbn);

      const result = await BooksService.getBookByIsbn(isbn);
      
      logger.info('✅ Book retrieved by ISBN');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get book by ISBN';
      setError(errorMessage);
      logger.error('❌ Get book by ISBN failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLibrary = useCallback(async (
    userId: string,
    filters?: {
      favorites?: boolean;
      status?: 'WISHLIST' | 'READING' | 'TO_READ' | 'read';
      wantsToExchange?: boolean;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('📚 Getting user library:', { userId, filters });

      const result = await BooksService.getUserLibrary(userId, filters);
      setUserBooks(result);
      
      logger.info('✅ User library retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user library';
      setError(errorMessage);
      logger.error('❌ Get user library failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookToLibrary = useCallback(async (bookData: AddBookToLibraryDto): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('📚 Adding book to library:', bookData);

      const result = await BooksService.addBookToLibrary(bookData);
      
      // Add to local state
      setUserBooks(prev => [...prev, result]);
      
      logger.info('✅ Book added to library');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add book to library';
      setError(errorMessage);
      logger.error('❌ Add book to library failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookStatus = useCallback(async (bookId: string, statusData: UpdateStatusDto): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('📚 Updating book status:', { bookId, statusData });

      const result = await BooksService.updateBookStatus(bookId, statusData);
      
      // Update local state
      setUserBooks(prev => prev.map(book => 
        book.id === bookId ? result : book
      ));
      
      logger.info('✅ Book status updated');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update book status';
      setError(errorMessage);
      logger.error('❌ Update book status failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBookFavorite = useCallback(async (bookId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('⭐ Toggling book favorite:', bookId);

      const result = await BooksService.toggleBookFavorite(bookId);
      
      // Update local state
      setUserBooks(prev => prev.map(book => 
        book.id === bookId ? result : book
      ));
      
      logger.info('✅ Book favorite toggled');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle book favorite';
      setError(errorMessage);
      logger.error('❌ Toggle book favorite failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExchangePreference = useCallback(async (
    bookId: string, 
    preferenceData: UpdateExchangePreferenceDto
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🔄 Updating exchange preference:', { bookId, preferenceData });

      const result = await BooksService.updateExchangePreference(bookId, preferenceData);
      
      // Update local state
      setUserBooks(prev => prev.map(book => 
        book.id === bookId ? result : book
      ));
      
      logger.info('✅ Exchange preference updated');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update exchange preference';
      setError(errorMessage);
      logger.error('❌ Update exchange preference failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBooksForExchange = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('🔄 Getting books for exchange');

      const result = await BooksService.getBooksForExchange();
      setUserBooks(result);
      
      logger.info('✅ Exchange books retrieved');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get books for exchange';
      setError(errorMessage);
      logger.error('❌ Get books for exchange failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearBooks = useCallback(() => {
    setBooks([]);
  }, []);

  const refresh = useCallback(async (userId: string) => {
    await getUserLibrary(userId);
  }, [getUserLibrary]);

  return {
    books,
    userBooks,
    loading,
    error,
    searchBooks,
    getBookByIsbn,
    getUserLibrary,
    addBookToLibrary,
    updateBookStatus,
    toggleBookFavorite,
    updateExchangePreference,
    getBooksForExchange,
    clearBooks,
    refresh,
  };
};

export default useBooks;