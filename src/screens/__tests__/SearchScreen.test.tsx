import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchScreen } from '../SearchScreen';
import { useSearch, useCommunities } from '../../hooks';
import { useNavigation } from '../../contexts/NavigationContext';

jest.mock('../../hooks', () => ({
    useSearch: jest.fn(),
    useCommunities: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('../../components', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        SearchBox: ({ value, onChangeText, placeholder }: any) => (
            <View testID="search-box">
                <Text>SearchBox Mock</Text>
            </View>
        ),
        SearchFilters: ({ activeFilters, onFilterChange }: any) => (
            <View testID="search-filters">
                <Text>SearchFilters Mock</Text>
            </View>
        ),
        UserSearchCard: ({ user, onPress }: any) => (
            <TouchableOpacity testID={`mock-user-${user.id}`} onPress={onPress}>
                <Text>{user.name}</Text>
            </TouchableOpacity>
        ),
        BookSearchCard: ({ book, onPress }: any) => (
            <TouchableOpacity testID={`mock-book-${book.id}`} onPress={onPress}>
                <Text>{book.title}</Text>
            </TouchableOpacity>
        ),
        CommunitySearchCard: ({ community, onPress, onJoin }: any) => (
            <TouchableOpacity testID={`mock-comm-${community.id}`} onPress={onPress}>
                <Text>{community.name}</Text>
            </TouchableOpacity>
        ),
        ReadersMapButton: ({ onPress }: any) => (
            <TouchableOpacity testID="mock-readers-button" onPress={onPress}>
                <Text>Map</Text>
            </TouchableOpacity>
        ),
        ReadersMapScreen: ({ visible, onClose }: any) => (
            visible ? (
                <View testID="mock-readers-map">
                    <TouchableOpacity testID="mock-close-map" onPress={onClose}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                </View>
            ) : null
        ),
    };
});

describe('SearchScreen', () => {
    const mockNavigate = jest.fn();
    const mockSetQuery = jest.fn();
    const mockSetActiveFilters = jest.fn();
    const mockSearchAll = jest.fn();
    const mockClearResults = jest.fn();
    const mockClearError = jest.fn();
    const mockJoinCommunity = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useNavigation as jest.Mock).mockReturnValue({
            navigate: mockNavigate,
        });

        (useCommunities as jest.Mock).mockReturnValue({
            joinCommunity: mockJoinCommunity,
            loading: false,
        });

        (useSearch as jest.Mock).mockReturnValue({
            users: [],
            books: [],
            communities: [],
            loading: false,
            error: null,
            query: '',
            activeFilters: ['users', 'books', 'communities'],
            setQuery: mockSetQuery,
            setActiveFilters: mockSetActiveFilters,
            searchAll: mockSearchAll,
            clearResults: mockClearResults,
            clearError: mockClearError,
        });
    });

    it('renders correctly with empty state', () => {
        const { getByTestId, queryByTestId, getByText } = render(<SearchScreen />);

        expect(getByTestId('search-box')).toBeTruthy();
        expect(getByTestId('search-filters')).toBeTruthy();
        expect(getByTestId('mock-readers-button')).toBeTruthy();

        // Empty state text should not be visible unless there's a query
        expect(queryByTestId('mock-user-1')).toBeNull();
    });

    it('renders users, books, and communities appropriately', () => {
        (useSearch as jest.Mock).mockReturnValue({
            users: [{ id: 'u1', name: 'John Doe' }],
            books: [{ id: 'b1', title: 'Great Book' }],
            communities: [{ id: 'c1', name: 'Cool Readers' }],
            loading: false,
            error: null,
            query: 'test',
            activeFilters: ['users', 'books', 'communities'],
            setQuery: mockSetQuery,
            setActiveFilters: mockSetActiveFilters,
            searchAll: mockSearchAll,
            clearResults: mockClearResults,
            clearError: mockClearError,
        });

        const { getByText, getByTestId } = render(<SearchScreen />);

        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Great Book')).toBeTruthy();
        expect(getByText('Cool Readers')).toBeTruthy();
    });

    it('navigates to user profile when user card is pressed', () => {
        (useSearch as jest.Mock).mockReturnValue({
            users: [{ id: 'u1', name: 'John Doe' }],
            books: [],
            communities: [],
            loading: false,
            error: null,
            query: 'john',
            activeFilters: ['users'],
            setQuery: mockSetQuery,
            setActiveFilters: mockSetActiveFilters,
            searchAll: mockSearchAll,
            clearResults: mockClearResults,
            clearError: mockClearError,
        });

        const { getByTestId } = render(<SearchScreen />);

        fireEvent.press(getByTestId('mock-user-u1'));
        expect(mockNavigate).toHaveBeenCalledWith('profile', { userId: 'u1' });
    });

    it('opens and closes the readers map modal', () => {
        const { getByTestId, queryByTestId } = render(<SearchScreen />);

        expect(queryByTestId('mock-readers-map')).toBeNull();

        fireEvent.press(getByTestId('mock-readers-button'));
        expect(getByTestId('mock-readers-map')).toBeTruthy();

        fireEvent.press(getByTestId('mock-close-map'));
        expect(queryByTestId('mock-readers-map')).toBeNull();
    });
});
