import { authStorage } from './storage';
import { API_BASE_URL } from '../config/api';

const getAuthToken = async (): Promise<string | null> => {
  return await authStorage.getToken();
};

const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T }> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export class BooksService {
  /**
   * Search books by query
   */
  static async searchBooks(query: string): Promise<{ data: any[] }> {
    const searchParams = new URLSearchParams({ q: query });
    return await apiRequest(`/books/search?${searchParams.toString()}`);
  }

  /**
   * Get book by ISBN
   */
  static async getBookByIsbn(isbn: string): Promise<{ data: any }> {
    return await apiRequest(`/books/isbn/${isbn}`);
  }

  /**
   * Get user library
   */
  static async getUserLibrary(userId: string, params?: {
    favorites?: boolean;
    status?: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ';
    wantsToExchange?: boolean;
  }): Promise<{ data: any[] }> {
    const searchParams = new URLSearchParams();
    
    if (params?.favorites !== undefined) {
      searchParams.append('favorites', params.favorites.toString());
    }
    if (params?.status) {
      searchParams.append('status', params.status);
    }
    if (params?.wantsToExchange !== undefined) {
      searchParams.append('wantsToExchange', params.wantsToExchange.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/books/library/${userId}${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint);
  }

  /**
   * Add book to user library
   */
  static async addBookToLibrary(bookData: {
    isbn: string;
    status: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ';
  }): Promise<{ data: any }> {
    return await apiRequest('/books/library', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  /**
   * Update book status
   */
  static async updateBookStatus(bookId: string, status: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ'): Promise<{ data: any }> {
    return await apiRequest(`/books/${bookId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Toggle book favorite
   */
  static async toggleBookFavorite(bookId: string): Promise<{ data: any }> {
    return await apiRequest(`/books/${bookId}/favorite`, {
      method: 'PUT',
    });
  }

  /**
   * Update exchange preference
   */
  static async updateExchangePreference(bookId: string, wantsToExchange: boolean): Promise<{ data: any }> {
    return await apiRequest(`/books/${bookId}/exchange`, {
      method: 'PUT',
      body: JSON.stringify({ wants_to_exchange: wantsToExchange }),
    });
  }

  /**
   * Get books for exchange
   */
  static async getBooksForExchange(): Promise<{ data: any[] }> {
    return await apiRequest('/books/exchange');
  }
}
