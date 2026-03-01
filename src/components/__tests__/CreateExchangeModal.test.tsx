import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateExchangeModal from '../CreateExchangeModal';
import { bookApi, userApi, exchangeApi } from '../../services/api';
import { useAlert } from '../../contexts/AlertContext';

jest.mock('../../services/api', () => ({
    bookApi: {
        searchBooks: jest.fn(),
        getUserLibrary: jest.fn(),
    },
    userApi: {
        searchUsersByBooks: jest.fn(),
    },
    exchangeApi: {
        createExchange: jest.fn(),
    },
}));

jest.mock('../../contexts/AlertContext', () => ({
    useAlert: jest.fn(),
}));

describe('CreateExchangeModal', () => {
    const mockShowAlert = jest.fn();
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();

    const mockCurrentUserId = 'u1';

    beforeEach(() => {
        jest.clearAllMocks();
        (useAlert as jest.Mock).mockReturnValue({ showAlert: mockShowAlert });
    });

    it('renders step 1 to search books initially', () => {
        const { getByText, getByPlaceholderText } = render(
            <CreateExchangeModal isVisible={true} onClose={mockOnClose} currentUserId={mockCurrentUserId} />
        );

        expect(getByText('Crear Intercambio - Paso 1/4')).toBeTruthy();
        expect(getByPlaceholderText('Buscar por título, autor o ISBN...')).toBeTruthy();
        expect(getByText('Siguiente')).toBeTruthy();
    });

    it('skips to step 3 when preSelectedBook and preSelectedUser are provided', async () => {
        const preBook = { id: 'b1', title: 'Test Book' };
        const preUser = { id: 'u2', name: 'Other User' };

        // Mock get user library for step 3
        (bookApi.getUserLibrary as jest.Mock).mockResolvedValue([
            { id: 'ub1', book: { id: 'b2', title: 'My Book' } }
        ]);

        const { getByText, findByText } = render(
            <CreateExchangeModal
                isVisible={true}
                onClose={mockOnClose}
                currentUserId={mockCurrentUserId}
                preSelectedBook={preBook as any}
                preSelectedUser={preUser as any}
            />
        );

        // Should be on Step 3
        expect(getByText('Crear Intercambio - Paso 3/4')).toBeTruthy();

        await waitFor(() => {
            expect(bookApi.getUserLibrary).toHaveBeenCalledWith(mockCurrentUserId, { wantsToExchange: true });
        });

        const myBookText = await findByText('My Book');
        expect(myBookText).toBeTruthy();
    });

    it('handles multi-step exchange creation', async () => {
        const { getByText, getByPlaceholderText, findByText } = render(
            <CreateExchangeModal isVisible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} currentUserId={mockCurrentUserId} />
        );

        // --- Step 1 ---
        (bookApi.searchBooks as jest.Mock).mockResolvedValue([
            { id: 'b1', title: 'Wanted Book', author: 'Author' }
        ]);

        const input = getByPlaceholderText('Buscar por título, autor o ISBN...');
        fireEvent.changeText(input, 'Wanted');

        // Mock responses before interaction
        (userApi.searchUsersByBooks as jest.Mock).mockResolvedValue([
            { id: 'u2', name: 'John', lastname: 'Doe', username: 'john' }
        ]);
        (bookApi.getUserLibrary as jest.Mock).mockResolvedValue([
            { id: 'ub1', book: { id: 'b2', title: 'My Offer Book', author: 'Me' } }
        ]);

        const searchedBook = await findByText('Wanted Book');
        fireEvent.press(searchedBook);

        fireEvent.press(getByText('Siguiente'));

        // --- Step 2 ---
        const userRow = await findByText('John Doe');
        fireEvent.press(userRow);

        fireEvent.press(getByText('Siguiente'));

        // --- Step 3 ---
        const myBook = await findByText('My Offer Book');
        fireEvent.press(myBook);

        fireEvent.press(getByText('Revisar'));

        // --- Step 4 ---
        expect(await findByText('Crear Intercambio - Paso 4/4')).toBeTruthy();

        (exchangeApi.createExchange as jest.Mock).mockResolvedValue({ id: 'ex1' });

        fireEvent.press(getByText('Enviar Propuestas'));

        await waitFor(() => {
            expect(exchangeApi.createExchange).toHaveBeenCalledWith({
                owner_id: 'u2',
                requester_id: 'u1',
                owner_book_ids: ['b1'],
                requester_book_ids: ['b2'],
            });
            expect(mockOnSuccess).toHaveBeenCalledWith({ id: 'ex1' });
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
