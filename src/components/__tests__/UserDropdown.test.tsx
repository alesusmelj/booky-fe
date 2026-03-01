import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserDropdown } from '../UserDropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

describe('UserDropdown', () => {
    const mockSignOut = jest.fn();
    const mockNavigate = jest.fn();
    const mockOnClose = jest.fn();
    const mockUser = {
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
    };

    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ signOut: mockSignOut, user: mockUser });
        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
        jest.clearAllMocks();
    });

    it('renders user information when visible', () => {
        const { getByText } = render(
            <UserDropdown
                visible={true}
                onClose={mockOnClose}
                anchorPosition={{ x: 100, y: 100 }}
            />
        );

        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
        expect(getByText('Mi perfil')).toBeTruthy();
        expect(getByText('Cerrar sesión')).toBeTruthy();
    });

    it('calls navigate and onClose when Mi perfil is pressed', () => {
        const { getByText } = render(
            <UserDropdown
                visible={true}
                onClose={mockOnClose}
                anchorPosition={{ x: 100, y: 100 }}
            />
        );

        fireEvent.press(getByText('Mi perfil'));
        expect(mockNavigate).toHaveBeenCalledWith('profile');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls signOut and onClose when Cerrar sesión is pressed', async () => {
        const { getByText } = render(
            <UserDropdown
                visible={true}
                onClose={mockOnClose}
                anchorPosition={{ x: 100, y: 100 }}
            />
        );

        fireEvent.press(getByText('Cerrar sesión'));
        expect(mockSignOut).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay is pressed', () => {
        const { getByTestId } = render(
            <UserDropdown
                visible={true}
                onClose={mockOnClose}
                anchorPosition={{ x: 100, y: 100 }}
            />
        );

        fireEvent.press(getByTestId('dropdown-overlay'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('returns null when not visible', () => {
        const { queryByText } = render(
            <UserDropdown
                visible={false}
                onClose={mockOnClose}
                anchorPosition={{ x: 100, y: 100 }}
            />
        );

        expect(queryByText('John Doe')).toBeNull();
    });
});
