import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MyLibraryView } from '../MyLibraryView';
import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../hooks/useBooks';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../hooks/useBooks', () => ({
    useBooks: jest.fn(),
}));

describe('MyLibraryView', () => {
    const mockGetUserLibrary = jest.fn();
    const mockUpdateExchangePreference = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1' } });
        (useBooks as jest.Mock).mockReturnValue({
            userBooks: [],
            loading: false,
            error: null,
            getUserLibrary: mockGetUserLibrary,
            updateExchangePreference: mockUpdateExchangePreference,
        });
    });

    it('fetches library on mount', () => {
        render(<MyLibraryView />);
        expect(mockGetUserLibrary).toHaveBeenCalledWith('u1');
    });

    it('renders loading state', () => {
        (useBooks as jest.Mock).mockReturnValue({
            userBooks: [],
            loading: true,
            error: null,
            getUserLibrary: mockGetUserLibrary,
        });

        const { getByText } = render(<MyLibraryView />);
        expect(getByText('Cargando tu biblioteca...')).toBeTruthy();
    });

    it('renders error state', () => {
        (useBooks as jest.Mock).mockReturnValue({
            userBooks: [],
            loading: false,
            error: 'Some error',
            getUserLibrary: mockGetUserLibrary,
        });

        const { getByText } = render(<MyLibraryView />);
        expect(getByText('Error al cargar los libros')).toBeTruthy();
    });

    it('renders empty state', () => {
        const { getByText } = render(<MyLibraryView />);
        expect(getByText('No tienes libros en tu biblioteca')).toBeTruthy();
    });

    it('renders books and allows filtering', () => {
        const mockBooks = [
            { id: 'ub1', book: { id: 'b1', title: 'The Hobbit', author: 'Tolkien' }, wants_to_exchange: true },
            { id: 'ub2', book: { id: 'b2', title: '1984', author: 'Orwell' }, wants_to_exchange: false },
        ];

        (useBooks as jest.Mock).mockReturnValue({
            userBooks: mockBooks,
            loading: false,
            error: null,
            getUserLibrary: mockGetUserLibrary,
        });

        const { getByText, queryByText, getByTestId } = render(<MyLibraryView />);

        expect(getByText('The Hobbit')).toBeTruthy();
        expect(getByText('1984')).toBeTruthy();

        // Filter
        fireEvent.changeText(getByTestId('search-books-input'), '1984');

        expect(queryByText('The Hobbit')).toBeNull();
        expect(getByText('1984')).toBeTruthy();
    });

    it('calls updateExchangePreference on toggle toggle availability', async () => {
        const mockBooks = [
            { id: 'ub1', book: { id: 'b1', title: 'The Hobbit', author: 'Tolkien' }, wants_to_exchange: true },
        ];

        (useBooks as jest.Mock).mockReturnValue({
            userBooks: mockBooks,
            loading: false,
            error: null,
            getUserLibrary: mockGetUserLibrary,
            updateExchangePreference: mockUpdateExchangePreference,
        });

        const { getByText, getByTestId } = render(<MyLibraryView />);

        const toggleBtn = getByTestId('book-card-b1');

        fireEvent.press(toggleBtn);

        expect(mockUpdateExchangePreference).toHaveBeenCalledWith('b1', { wants_to_exchange: false });

        await waitFor(() => {
            expect(mockGetUserLibrary).toHaveBeenCalledWith('u1');
        });
    });
});
