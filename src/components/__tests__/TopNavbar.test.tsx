import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TopNavbar } from '../TopNavbar';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock dependencies
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(),
}));

jest.mock('../UserDropdown', () => ({
    UserDropdown: ({ visible }: any) => {
        const { View } = require('react-native');
        return visible ? <View testID="user-dropdown" /> : null;
    }
}));

// Mock View.measure
const { View } = require('react-native');
View.prototype.measure = jest.fn((cb) => cb(0, 0, 40, 40, 100, 100));

describe('TopNavbar', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1', name: 'John' } });
        (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 20 });
    });

    it('renders brand name by default', () => {
        const { getByText } = render(<TopNavbar />);
        expect(getByText('Booky')).toBeTruthy();
    });

    it('renders back button when showBackButton is true', () => {
        const mockOnBackPress = jest.fn();
        const { getByText } = render(<TopNavbar showBackButton={true} onBackPress={mockOnBackPress} />);

        const backBtn = getByText('Volver');
        expect(backBtn).toBeTruthy();

        fireEvent.press(backBtn);
        expect(mockOnBackPress).toHaveBeenCalled();
    });

    it('renders user avatar when image is available', () => {
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1', name: 'John', image: 'https://example.com/img.jpg' } });
        const { getByTestId } = render(<TopNavbar />);
        expect(getByTestId('user-avatar')).toBeTruthy();
    });

    it('renders default avatar when no image', () => {
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1', name: 'John' } });
        const { getByTestId } = render(<TopNavbar />);
        expect(getByTestId('default-avatar')).toBeTruthy();
    });

    it('opens dropdown when profile button is pressed', () => {
        const { getByTestId } = render(<TopNavbar />);

        // Mock measure because it's used in handleProfilePress
        // We might need to mock measure on the view
        const profileBtn = getByTestId('profile-button');
        profileBtn.measure = jest.fn((cb) => cb(0, 0, 40, 40, 100, 100));

        fireEvent.press(profileBtn);
        expect(getByTestId('user-dropdown')).toBeTruthy();
    });
});
