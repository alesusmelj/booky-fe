import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CreateRatingModal } from '../CreateRatingModal';
import { useRating } from '../../hooks/useRating';
import { Alert } from 'react-native';

jest.mock('../../hooks/useRating', () => ({
    useRating: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('CreateRatingModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();
    const mockCreateRating = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRating as jest.Mock).mockReturnValue({
            createRating: mockCreateRating,
            loading: false,
        });
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(
            <CreateRatingModal
                isVisible={true}
                onClose={mockOnClose}
                exchangeId="ex1"
                otherUserName="John Doe"
                onSuccess={mockOnSuccess}
            />
        );

        expect(getByText('Calificar Intercambio')).toBeTruthy();
        expect(getByText('¿Cómo fue tu experiencia con John Doe?')).toBeTruthy();
        expect(getByPlaceholderText('Comparte tu experiencia del intercambio...')).toBeTruthy();
        expect(getByText('Enviar Reseña')).toBeTruthy();
    });

    it('has disabled submit button initially', async () => {
        const { getByText } = render(
            <CreateRatingModal
                isVisible={true}
                onClose={mockOnClose}
                exchangeId="ex1"
                otherUserName="John Doe"
            />
        );

        fireEvent.press(getByText('Enviar Reseña'));
        // The button should be disabled so it shouldn't trigger createRating
        expect(mockCreateRating).not.toHaveBeenCalled();
    });

    it('submits rating successfully', async () => {
        mockCreateRating.mockResolvedValue(true);

        const { getByText, getByPlaceholderText, UNSAFE_getAllByType } = render(
            <CreateRatingModal
                isVisible={true}
                onClose={mockOnClose}
                exchangeId="ex1"
                otherUserName="John Doe"
                onSuccess={mockOnSuccess}
            />
        );

        // Press a star (hard to select directly by text, we select the TouchableOpacity grouping MaterialIcons)
        const { TouchableOpacity } = require('react-native');
        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        // We assume the first 5 touchables are the stars based on the DOM order 
        // Or we can find by another way. Let's just type the comment and see if we can find the 4th star.
        // It's safer to mock MaterialIcons or add a testID.
        // But since we can't edit the component easily, we use index.
        // Actually, the close button is the first touchable. Then the 5 stars.
        // Let's just find the text "Enviar Reseña" and note that hitting the touchable at index 2 or so gives a star.
        // Better yet, mock the hook, and just press one of the star buttons.
        fireEvent.press(touchables[4]); // Press the 4th star (index might be close button = 0, stars = 1 to 5)

        fireEvent.changeText(getByPlaceholderText('Comparte tu experiencia del intercambio...'), 'Great!');

        fireEvent.press(getByText('Enviar Reseña'));

        await waitFor(() => {
            expect(mockCreateRating).toHaveBeenCalledWith('ex1', {
                rating: 4,
                comment: 'Great!',
            });
        });

        // Simulating the user pressing OK on the success alert is tricky because Alert.alert doesn't block.
        // But we can check if it was called.
        expect(Alert.alert).toHaveBeenCalledWith(
            'Éxito',
            'Tu reseña ha sido enviada correctamente',
            expect.any(Array)
        );
    });

    it('handles closing the modal', () => {
        const { getByText } = render(
            <CreateRatingModal
                isVisible={true}
                onClose={mockOnClose}
                exchangeId="ex1"
                otherUserName="John Doe"
            />
        );

        fireEvent.press(getByText('Cancelar'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
