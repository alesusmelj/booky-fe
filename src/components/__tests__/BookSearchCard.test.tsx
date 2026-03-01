import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookSearchCard } from '../BookSearchCard';
import { BookDto } from '../../types/api';

describe('BookSearchCard', () => {
    const defaultBook: BookDto = {
        id: 'book1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        categories: ['Classic', 'Fiction'],
        rate: 4.5,
        pages: 200,
        isbn: '1234567890',
    };

    it('renders correctly with given book data', () => {
        const { getByText } = render(<BookSearchCard book={defaultBook} />);

        expect(getByText('The Great Gatsby')).toBeTruthy();
        expect(getByText('F. Scott Fitzgerald')).toBeTruthy();
        expect(getByText('Classic, Fiction')).toBeTruthy();
        expect(getByText('4.5')).toBeTruthy();
    });

    it('handles books without categories gracefully', () => {
        const bookNoCats = { ...defaultBook, categories: [] };
        const { getByText } = render(<BookSearchCard book={bookNoCats} />);

        expect(getByText('Sin categoría')).toBeTruthy();
    });

    it('limits categories to at most 2', () => {
        const bookManyCats = { ...defaultBook, categories: ['One', 'Two', 'Three', 'Four'] };
        const { getByText } = render(<BookSearchCard book={bookManyCats} />);

        expect(getByText('One, Two')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(<BookSearchCard book={defaultBook} onPress={onPressMock} />);

        fireEvent.press(getByTestId('book-card-book1'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });
});
