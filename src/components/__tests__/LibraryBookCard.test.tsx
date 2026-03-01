import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LibraryBookCard } from '../LibraryBookCard';
import { strings } from '../../constants';

describe('LibraryBookCard', () => {
    const mockBook = {
        id: 'b1',
        title: 'Test Book',
        author: 'Test Author',
        image: 'https://example.com/image.jpg',
        isAvailable: true,
    };

    const mockOnToggle = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders book information correctly', () => {
        const { getByText } = render(
            <LibraryBookCard book={mockBook} onToggleAvailability={mockOnToggle} />
        );

        expect(getByText('Test Book')).toBeTruthy();
        expect(getByText('Test Author')).toBeTruthy();
        expect(getByText(strings.commerce.status.available)).toBeTruthy();
    });

    it('shows not available status when isAvailable is false', () => {
        const { getByText } = render(
            <LibraryBookCard
                book={{ ...mockBook, isAvailable: false }}
                onToggleAvailability={mockOnToggle}
            />
        );

        expect(getByText(strings.commerce.status.notAvailable)).toBeTruthy();
    });

    it('shows updating state when isUpdating is true', () => {
        const { getByText, getByTestId } = render(
            <LibraryBookCard
                book={{ ...mockBook, isUpdating: true }}
                onToggleAvailability={mockOnToggle}
            />
        );

        expect(getByText('Actualizando...')).toBeTruthy();
        const card = getByTestId('book-card-b1');
        expect(card.props.accessibilityState.disabled).toBe(true);
    });

    it('calls onToggleAvailability when pressed', () => {
        const { getByTestId } = render(
            <LibraryBookCard book={mockBook} onToggleAvailability={mockOnToggle} />
        );

        fireEvent.press(getByTestId('book-card-b1'));
        expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
});
