import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchFilters, FilterType } from '../SearchFilters';

describe('SearchFilters', () => {
    const mockOnFilterChange = jest.fn();

    it('renders all filter buttons', () => {
        const { getByText } = render(
            <SearchFilters activeFilters={['books']} onFilterChange={mockOnFilterChange} />
        );

        expect(getByText('Libros')).toBeTruthy();
        expect(getByText('Personas')).toBeTruthy();
        expect(getByText('Comunidades')).toBeTruthy();
    });

    it('calls onFilterChange to add a filter', () => {
        const { getByTestId } = render(
            <SearchFilters activeFilters={['books']} onFilterChange={mockOnFilterChange} />
        );

        fireEvent.press(getByTestId('filter-people'));
        expect(mockOnFilterChange).toHaveBeenCalledWith(['books', 'people']);
    });

    it('calls onFilterChange to remove a filter', () => {
        const { getByTestId } = render(
            <SearchFilters activeFilters={['books', 'communities']} onFilterChange={mockOnFilterChange} />
        );

        fireEvent.press(getByTestId('filter-books'));
        expect(mockOnFilterChange).toHaveBeenCalledWith(['communities']);
    });
});
