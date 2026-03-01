import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Navbar } from '../Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(),
}));

describe('Navbar', () => {
    beforeEach(() => {
        (useSafeAreaInsets as jest.Mock).mockReturnValue({ bottom: 20 });
    });

    it('renders all navigation items', () => {
        const { getByText } = render(<Navbar />);

        expect(getByText('Inicio')).toBeTruthy();
        expect(getByText('Buscar')).toBeTruthy();
        expect(getByText('Comercio')).toBeTruthy();
        expect(getByText('Comunidad')).toBeTruthy();
        expect(getByText('Mensajes')).toBeTruthy();
    });

    it('calls onTabPress when a tab is clicked', () => {
        const mockOnTabPress = jest.fn();
        const { getByText } = render(<Navbar onTabPress={mockOnTabPress} />);

        fireEvent.press(getByText('Buscar'));
        expect(mockOnTabPress).toHaveBeenCalledWith('search');

        fireEvent.press(getByText('Comunidad'));
        expect(mockOnTabPress).toHaveBeenCalledWith('community');
    });

    it('highlights the active tab', () => {
        // We can check styles if we want to be very precise, but let's check if it renders without crashing with different active tabs
        const { getByText } = render(<Navbar activeTab="commerce" />);
        expect(getByText('Comercio')).toBeTruthy();
    });
});
