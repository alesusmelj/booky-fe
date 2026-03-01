import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LibraryScreen } from '../LibraryScreen';
import { useAuth } from '../../contexts/AuthContext';
import { useBooks, useBarcodeHandler } from '../../hooks';

// Mock contexts hooks
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../hooks', () => ({
    useBooks: jest.fn(),
    useBarcodeHandler: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    }
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>
}));

// Mock custom components to simplify render tree
jest.mock('../../components/BookCard', () => ({
    UserLibraryBookCard: ({ book, onStatusChange }: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID={`book-card-${book.id}`}>
                <Text>{book.book.title}</Text>
                <TouchableOpacity
                    testID={`change-status-btn-${book.id}`}
                    onPress={() => onStatusChange('READ')}
                >
                    <Text>Marcar Leído</Text>
                </TouchableOpacity>
            </View>
        );
    }
}));

jest.mock('../../components/BarcodeScannerWrapper', () => ({
    BarcodeScannerWrapper: ({ onBarcodeScanned, onClose }: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="barcode-scanner-mock">
                <Text>Scanner</Text>
                <TouchableOpacity
                    testID="close-scanner-btn"
                    onPress={onClose}
                >
                    <Text>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="scan-mock-btn"
                    onPress={() => onBarcodeScanned('1234567890')}
                >
                    <Text>Scan mock</Text>
                </TouchableOpacity>
            </View>
        );
    }
}));

describe('LibraryScreen', () => {

    const mockUser = { id: 'user1' };
    const mockGetUserLibrary = jest.fn();
    const mockAddBookToLibrary = jest.fn();
    const mockUpdateBookStatus = jest.fn();
    const mockToggleBookFavorite = jest.fn();
    const mockUpdateExchangePreference = jest.fn();
    const mockGetBookByIsbn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

        (useBarcodeHandler as jest.Mock).mockReturnValue({
            handleBarcodeScanned: jest.fn((isbn) => isbn), // Pass through Mock
        });

        (useBooks as jest.Mock).mockReturnValue({
            userBooks: [],
            loading: false,
            error: null,
            getUserLibrary: mockGetUserLibrary,
            addBookToLibrary: mockAddBookToLibrary,
            updateBookStatus: mockUpdateBookStatus,
            toggleBookFavorite: mockToggleBookFavorite,
            updateExchangePreference: mockUpdateExchangePreference,
            getBookByIsbn: mockGetBookByIsbn,
        });
    });

    const generateMockBooks = () => ([
        {
            id: 'b1',
            status: 'READING',
            favorite: true,
            wants_to_exchange: false,
            book: { id: 'o1', title: 'Libro 1', author: 'Autor 1' }
        },
        {
            id: 'b2',
            status: 'READ',
            favorite: false,
            wants_to_exchange: true,
            book: { id: 'o2', title: 'Libro 2', author: 'Autor 2' }
        },
        {
            id: 'b3',
            status: 'WISHLIST',
            favorite: false,
            wants_to_exchange: false,
            book: { id: 'o3', title: 'Libro 3', author: 'Autor 3' }
        }
    ]);

    it('renders loading state when loading userBooks', () => {
        (useBooks as jest.Mock).mockReturnValue({
            userBooks: [],
            loading: true,
            getUserLibrary: mockGetUserLibrary,
        });

        const { getByText } = render(<LibraryScreen />);

        expect(getByText('Cargando biblioteca...')).toBeTruthy();
    });

    it('renders empty state when there are no books', () => {
        const { getByText } = render(<LibraryScreen />);

        expect(getByText('No se encontraron libros')).toBeTruthy();
        expect(getByText('Agrega algunos libros a tu biblioteca para comenzar.')).toBeTruthy();
        expect(getByText('Agrega tu primer libro')).toBeTruthy();
    });

    it('renders list of books initially and calls getUserLibrary on mount', () => {
        (useBooks as jest.Mock).mockReturnValue({
            userBooks: generateMockBooks(),
            loading: false,
            getUserLibrary: mockGetUserLibrary,
        });

        const { getByText, queryByText } = render(<LibraryScreen />);

        expect(mockGetUserLibrary).toHaveBeenCalledWith('user1');

        expect(getByText('Libro 1')).toBeTruthy();
        expect(getByText('Libro 2')).toBeTruthy();
        expect(getByText('Libro 3')).toBeTruthy();
    }); // Note: All books means length 3

    it('filters books when changing tabs', async () => {
        (useBooks as jest.Mock).mockReturnValue({
            userBooks: generateMockBooks(),
            loading: false,
            getUserLibrary: mockGetUserLibrary,
        });

        const { getByText, queryByText } = render(<LibraryScreen />);

        // Click on 'Leyendo' tab
        fireEvent.press(getByText(/📖 Leyendo \(/));

        // Only Libro 1 should be visible
        expect(getByText('Libro 1')).toBeTruthy();
        expect(queryByText('Libro 2')).toBeNull();
        expect(queryByText('Libro 3')).toBeNull();

        // Click on 'Favoritos' tab
        fireEvent.press(getByText(/❤️ Favoritos \(/));

        expect(getByText('Libro 1')).toBeTruthy();
        expect(queryByText('Libro 2')).toBeNull();

        // Click on 'Leídos' tab
        fireEvent.press(getByText(/✅ Leídos \(/));

        expect(queryByText('Libro 1')).toBeNull();
        expect(getByText('Libro 2')).toBeTruthy();
    });

    it('allows opening the Add Book modal', () => {
        const { getByText } = render(<LibraryScreen />);

        const addButton = getByText('+ Agregar Libro');
        fireEvent.press(addButton);

        expect(getByText('Agregar Nuevo Libro')).toBeTruthy();
        expect(getByText('📷 Escanear ISBN del libro')).toBeTruthy();
    });

    it('updates book status on press', async () => {
        (useBooks as jest.Mock).mockReturnValue({
            userBooks: generateMockBooks(),
            loading: false,
            getUserLibrary: mockGetUserLibrary,
            updateBookStatus: mockUpdateBookStatus,
        });

        const { getByTestId, debug } = render(<LibraryScreen />);

        const changeStatusBtn = getByTestId('change-status-btn-b1');
        fireEvent.press(changeStatusBtn);

        expect(mockUpdateBookStatus).toHaveBeenCalledWith('b1', { status: 'READ' });
    });

});
