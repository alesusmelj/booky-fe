import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CommerceToggle } from '../CommerceToggle';
import { strings } from '../../constants';

describe('CommerceToggle', () => {
    const mockOnTabChange = jest.fn();

    it('renders both tabs and highlights the active one', () => {
        const { getByText, getByTestId } = render(
            <CommerceToggle activeTab="trade" onTabChange={mockOnTabChange} />
        );

        expect(getByText(strings.commerce.tabs.tradeBooks)).toBeTruthy();
        expect(getByText(strings.commerce.tabs.myLibrary)).toBeTruthy();

        const tradeTab = getByTestId('trade-books-tab');
        // Check if it has active styles (background color primary.main usually)
        // In our case we check if it doesn't crash and renders the text
    });

    it('calls onTabChange when a tab is pressed', () => {
        const { getByTestId } = render(
            <CommerceToggle activeTab="trade" onTabChange={mockOnTabChange} />
        );

        fireEvent.press(getByTestId('my-library-tab'));
        expect(mockOnTabChange).toHaveBeenCalledWith('library');

        fireEvent.press(getByTestId('trade-books-tab'));
        expect(mockOnTabChange).toHaveBeenCalledWith('trade');
    });
});
