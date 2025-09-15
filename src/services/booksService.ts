import { apiRequest } from './api';
import { logger } from '../utils/logger';

export interface BookDto {
  id: string;
  isbn: string;
  title: string;
  overview?: string;
  synopsis?: string;
  pages?: number;
  edition?: string;
  publisher?: string;
  author: string;
  image?: string;
  rate?: number;
  categories?: string[];
}

export interface UserBookDto {
  id: string;
  user_id: string;
  status: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ';
  favorite: boolean;
  wants_to_exchange: boolean;
  book: BookDto;
}

export interface AddBookToLibraryDto {
  isbn: string;
  status: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ';
}

export interface UpdateStatusDto {
  status: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ';
}

export interface UpdateExchangePreferenceDto {
  wants_to_exchange: boolean;
}

export class BooksService {
  /**
   * Search books by query
   */
  static async searchBooks(query: string): Promise<BookDto[]> {
    try {
      logger.info('📚 Searching books with query:', query);
      
      const response = await apiRequest(`/books/search?q=${encodeURIComponent(query)}`);
      
      logger.info('✅ Books search completed successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error searching books:', error);
      throw error;
    }
  }

  /**
   * Get book by ISBN
   */
  static async getBookByIsbn(isbn: string): Promise<BookDto> {
    try {
      logger.info('📖 Getting book by ISBN:', isbn);
      
      const response = await apiRequest(`/books/isbn/${isbn}`);
      
      logger.info('✅ Book retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting book by ISBN:', error);
      throw error;
    }
  }

  /**
   * Get user library
   */
  static async getUserLibrary(
    userId: string,
    filters?: {
      favorites?: boolean;
      status?: 'WISHLIST' | 'READING' | 'TO_READ' | 'read';
      wantsToExchange?: boolean;
    }
  ): Promise<UserBookDto[]> {
    try {
      logger.info('📚 Getting user library for user:', userId);
      
      let url = `/books/library/${userId}`;
      const params = new URLSearchParams();
      
      if (filters?.favorites !== undefined) {
        params.append('favorites', filters.favorites.toString());
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.wantsToExchange !== undefined) {
        params.append('wantsToExchange', filters.wantsToExchange.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiRequest(url);
      
      logger.info('✅ User library retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting user library:', error);
      throw error;
    }
  }

  /**
   * Add book to user library
   */
  static async addBookToLibrary(bookData: AddBookToLibraryDto): Promise<UserBookDto> {
    try {
      logger.info('📚 Adding book to library:', bookData);
      
      const response = await apiRequest('/books/library', {
        method: 'POST',
        body: JSON.stringify(bookData),
      });
      
      logger.info('✅ Book added to library successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error adding book to library:', error);
      throw error;
    }
  }

  /**
   * Update book status
   */
  static async updateBookStatus(bookId: string, statusData: UpdateStatusDto): Promise<UserBookDto> {
    try {
      logger.info('📚 Updating book status:', { bookId, statusData });
      
      const response = await apiRequest(`/books/${bookId}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData),
      });
      
      logger.info('✅ Book status updated successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error updating book status:', error);
      throw error;
    }
  }

  /**
   * Toggle book favorite
   */
  static async toggleBookFavorite(bookId: string): Promise<UserBookDto> {
    try {
      logger.info('⭐ Toggling book favorite:', bookId);
      
      const response = await apiRequest(`/books/${bookId}/favorite`, {
        method: 'PUT',
      });
      
      logger.info('✅ Book favorite toggled successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error toggling book favorite:', error);
      throw error;
    }
  }

  /**
   * Update exchange preference
   */
  static async updateExchangePreference(
    bookId: string, 
    preferenceData: UpdateExchangePreferenceDto
  ): Promise<UserBookDto> {
    try {
      logger.info('🔄 Updating exchange preference:', { bookId, preferenceData });
      
      const response = await apiRequest(`/books/${bookId}/exchange`, {
        method: 'PUT',
        body: JSON.stringify(preferenceData),
      });
      
      logger.info('✅ Exchange preference updated successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error updating exchange preference:', error);
      throw error;
    }
  }

  /**
   * Get books for exchange
   */
  static async getBooksForExchange(): Promise<UserBookDto[]> {
    try {
      logger.info('🔄 Getting books for exchange');
      
      const response = await apiRequest('/books/exchange');
      
      logger.info('✅ Exchange books retrieved successfully');
      return response.data || response;
    } catch (error) {
      logger.error('❌ Error getting books for exchange:', error);
      throw error;
    }
  }
}

export default BooksService;