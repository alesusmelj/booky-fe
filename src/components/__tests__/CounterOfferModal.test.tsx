import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CounterOfferModal } from '../CounterOfferModal';
import { BooksService } from '../../services/booksService';

jest.mock('../../services/booksService', () => ({
    BooksService: {
        getUserLibrary: jest.fn(),
    },
}));

describe('CounterOfferModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn().mockResolvedValue(true);

    const mockExchange = {
        id: 'ex1',
        exchangeNumber: 'EX-123',
        requester: { id: 'u1', name: 'Requester' },
        owner: { id: 'u2', name: 'Owner' },
        requestedBooks: [],
        offeredBooks: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads books and allows multi-step counter offer creation', async () => {
        // Mock get user library
        // currentUserId is u2 (Owner) 
        // -> other UserId is u1 (Requester)
        // Load my books (u2)
        (BooksService.getUserLibrary as jest.Mock).mockImplementation((userId) => {
            if (userId === 'u2') {
                return Promise.resolve([
                    { book: { id: 'b1', title: 'My Book Title', author: 'Me' } }
                ]);
            }
            if (userId === 'u1') {
                return Promise.resolve([
                    { book: { id: 'b2', title: 'Their Book Title', author: 'Them' } }
                ]);
            }
            return Promise.resolve([]);
        });

        const { getByText, findByText } = render(
            <CounterOfferModal
                visible={true}
                exchange={mockExchange}
                currentUserId="u2"
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        // Step 1: Their Books (Requester's books)
        const theirBook = await findByText('Their Book Title');
        fireEvent.press(theirBook);

        fireEvent.press(getByText('Siguiente'));

        // Step 2: My Books (Owner's books)
        const myBook = await findByText('My Book Title');
        fireEvent.press(myBook);

        fireEvent.press(getByText('Siguiente'));

        // Step 3: Review
        expect(getByText('Resumen de Contraoferta')).toBeTruthy();

        // Submit
        fireEvent.press(getByText('Enviar Contraoferta'));

        await waitFor(() => {
            // isOwner: true -> ownerBookIds = selectedMyBooks (b1), requesterBookIds = selectedTheirBooks (b2)
            expect(mockOnSubmit).toHaveBeenCalledWith('ex1', ['b2'], ['b1']);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('displays alert if trying to next without selection', async () => {
        const { getByText, queryByText } = render(
            <CounterOfferModal
                visible={true}
                exchange={mockExchange}
                currentUserId="u2"
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        await waitFor(() => expect(queryByText('Cargando libros...')).toBeNull());

        // Let's mock Alert.alert
        const { Alert } = require('react-native');
        jest.spyOn(Alert, 'alert');

        fireEvent.press(getByText('Siguiente'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Selección Requerida',
            'Debes seleccionar al menos un libro que quieras recibir'
        );
    });
});
