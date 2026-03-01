import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBox } from '../SearchBox';

describe('SearchBox', () => {
    const mockOnChangeText = jest.fn();

    it('renders correctly with initial value', () => {
        const { getByDisplayValue, getByPlaceholderText } = render(
            <SearchBox value="test query" onChangeText={mockOnChangeText} placeholder="Search anything..." />
        );

        expect(getByDisplayValue('test query')).toBeTruthy();
        expect(getByPlaceholderText('Search anything...')).toBeTruthy();
    });

    it('calls onChangeText when typing', () => {
        const { getByTestId } = render(
            <SearchBox value="" onChangeText={mockOnChangeText} />
        );

        fireEvent.changeText(getByTestId('search-input'), 'new query');
        expect(mockOnChangeText).toHaveBeenCalledWith('new query');
    });
});
