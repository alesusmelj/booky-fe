import { useState, useCallback } from 'react';
import { userApi } from '../services/api';
import { BooksService } from '../services/booksService';
import { CommunitiesService } from '../services/communitiesService';
import { UserDto, BookDto, CommunityDto } from '../types/api';
import { logger } from '../utils/logger';

export type SearchFilter = 'users' | 'books' | 'communities';

interface SearchState {
    users: UserDto[];
    books: BookDto[];
    communities: CommunityDto[];
    loading: boolean;
    error: string | null;
}

export const useSearch = () => {
    const [state, setState] = useState<SearchState>({
        users: [],
        books: [],
        communities: [],
        loading: false,
        error: null,
    });

    const [query, setQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<SearchFilter[]>(['users', 'books', 'communities']);

    const searchAll = useCallback(async (searchQuery: string, filters: SearchFilter[] = activeFilters) => {
        if (!searchQuery.trim()) {
            setState(prev => ({
                ...prev,
                users: [],
                books: [],
                communities: [],
                error: null,
            }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('🔍 Starting search with query:', searchQuery, 'filters:', filters);

            const promises: Promise<any>[] = [];
            const results: { users?: UserDto[]; books?: BookDto[]; communities?: CommunityDto[] } = {};

            // Search users
            if (filters.includes('users')) {
                promises.push(
                    userApi.searchUsers(searchQuery)
                        .then(users => {
                            results.users = users;
                            logger.info('👥 Users search completed:', users.length, 'results');
                        })
                        .catch(error => {
                            logger.error('❌ Users search failed:', error);
                            results.users = [];
                        })
                );
            }

            // Search books
            if (filters.includes('books')) {
                promises.push(
                    BooksService.searchBooks(searchQuery)
                        .then(books => {
                            results.books = books;
                            logger.info('📚 Books search completed:', books.length, 'results');
                        })
                        .catch(error => {
                            logger.error('❌ Books search failed:', error);
                            results.books = [];
                        })
                );
            }

            // Search communities
            if (filters.includes('communities')) {
                promises.push(
                    CommunitiesService.searchCommunities(searchQuery)
                        .then(communities => {
                            results.communities = communities;
                            logger.info('🏘️ Communities search completed:', communities.length, 'results');
                        })
                        .catch(error => {
                            logger.error('❌ Communities search failed:', error);
                            results.communities = [];
                        })
                );
            }

            await Promise.all(promises);

            setState(prev => ({
                ...prev,
                users: results.users || prev.users,
                books: results.books || prev.books,
                communities: results.communities || prev.communities,
                loading: false,
            }));

            logger.info('✅ Search completed successfully');
        } catch (error) {
            logger.error('❌ Search failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Search failed';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
        }
    }, [activeFilters]);

    const searchUsers = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setState(prev => ({ ...prev, users: [], error: null }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('👥 Searching users:', searchQuery);

            const users = await userApi.searchUsers(searchQuery);

            setState(prev => ({
                ...prev,
                users,
                loading: false,
            }));

            logger.info('✅ Users search completed:', users.length, 'results');
        } catch (error) {
            logger.error('❌ Users search failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to search users';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
        }
    }, []);

    const searchBooks = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setState(prev => ({ ...prev, books: [], error: null }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('📚 Searching books:', searchQuery);

            const books = await BooksService.searchBooks(searchQuery);

            setState(prev => ({
                ...prev,
                books,
                loading: false,
            }));

            logger.info('✅ Books search completed:', books.length, 'results');
        } catch (error) {
            logger.error('❌ Books search failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to search books';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
        }
    }, []);

    const searchCommunities = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setState(prev => ({ ...prev, communities: [], error: null }));
            return;
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            logger.info('🏘️ Searching communities:', searchQuery);

            const communities = await CommunitiesService.searchCommunities(searchQuery);

            setState(prev => ({
                ...prev,
                communities,
                loading: false,
            }));

            logger.info('✅ Communities search completed:', communities.length, 'results');
        } catch (error) {
            logger.error('❌ Communities search failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to search communities';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
        }
    }, []);

    const clearResults = useCallback(() => {
        setState({
            users: [],
            books: [],
            communities: [],
            loading: false,
            error: null,
        });
        setQuery('');
    }, []);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        // State
        users: state.users,
        books: state.books,
        communities: state.communities,
        loading: state.loading,
        error: state.error,
        query,
        activeFilters,

        // Actions
        setQuery,
        setActiveFilters,
        searchAll,
        searchUsers,
        searchBooks,
        searchCommunities,
        clearResults,
        clearError,
    };
};
