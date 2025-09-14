import { useState, useCallback } from 'react';
import { BooksService } from '../services';

interface BooksState {
  books: any[];
  loading: boolean;
  error: string | null;
}

export const useBooks = () => {
  const [state, setState] = useState<BooksState>({
    books: [],
    loading: false,
    error: null,
  });

  const searchBooks = useCallback(async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, books: [], error: null }));
      return [];
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await BooksService.searchBooks(query);
      const books = response.data || [];
      
      setState(prev => ({ ...prev, books, loading: false }));
      return books;
    } catch (error) {
      console.error('Error searching books:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search books';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        loading: false,
        books: []
      }));
      return [];
    }
  }, []);

  const getBookByIsbn = useCallback(async (isbn: string): Promise<any | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await BooksService.getBookByIsbn(isbn);
      
      setState(prev => ({ ...prev, loading: false }));
      return response.data;
    } catch (error) {
      console.error('Error getting book by ISBN:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get book';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        loading: false
      }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearBooks = useCallback(() => {
    setState(prev => ({ ...prev, books: [], error: null }));
  }, []);

  return {
    books: state.books,
    loading: state.loading,
    error: state.error,
    searchBooks,
    getBookByIsbn,
    clearError,
    clearBooks,
  };
};
