import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookCard, BookData } from '../SearchBookCard';

describe('BookCard', () => {
    const mockBook: BookData = {
        id: 'b1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Classic',
        rating: 4,
        status: 'available',
        coverUrl: 'https://example.com/gatsby.jpg',
        isFavorite: false,
    };

    it('renders book data correctly', () => {
        const { getByText } = render(<BookCard book={mockBook} />);

        expect(getByText('The Great Gatsby')).toBeTruthy();
        expect(getByText('F. Scott Fitzgerald')).toBeTruthy();
        expect(getByText('Classic')).toBeTruthy();
        expect(getByText('Disponible')).toBeTruthy();
    });

    it('renders correct status text', () => {
        const { getByText, rerender } = render(<BookCard book={{ ...mockBook, status: 'reading' }} />);
        expect(getByText('Leyendo')).toBeTruthy();

        rerender(<BookCard book={{ ...mockBook, status: 'read' }} />);
        expect(getByText('Leído')).toBeTruthy();

        rerender(<BookCard book={{ ...mockBook, status: 'wishlist' }} />);
        expect(getByText('Lista de deseos')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(<BookCard book={mockBook} onPress={mockOnPress} />);

        fireEvent.press(getByTestId('book-card-b1'));
        expect(mockOnPress).toHaveBeenCalled();
    });

    it('handles favorite press', () => {
        const mockOnFavoritePress = jest.fn();
        const { getByTestId, rerender, getByText } = render(
            <BookCard book={mockBook} onFavoritePress={mockOnFavoritePress} />
        );

        fireEvent.press(getByTestId('favorite-b1'));
        expect(mockOnFavoritePress).toHaveBeenCalled();

        // Check icon change with rerender
        rerender(<BookCard book={{ ...mockBook, isFavorite: true }} onFavoritePress={mockOnFavoritePress} />);
        expect(getByText('❤️')).toBeTruthy();
    });

    it('renders stars based on rating', () => {
        const { getAllByText } = render(<BookCard book={{ ...mockBook, rating: 3 }} />);
        // Usually it renders 5 stars, some are colored.
        // The implementation adds 5 star characters.
        const stars = getAllByText('★');
        expect(stars.length).toBe(5);
    });
});
