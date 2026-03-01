import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReadersMapButton } from '../ReadersMapButton';
import { strings } from '../../constants';

describe('ReadersMapButton', () => {
    it('renders with the correct text', () => {
        const { getByText } = render(<ReadersMapButton />);
        expect(getByText(strings.search.readersMap)).toBeTruthy();
    });

    it('calls onPress when clicked', () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(<ReadersMapButton onPress={mockOnPress} />);

        fireEvent.press(getByTestId('readers-map-button'));
        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
});
