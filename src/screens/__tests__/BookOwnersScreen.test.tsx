import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BookOwnersScreen } from '../BookOwnersScreen';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { UsersService } from '../../services/usersService';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('../../services/usersService', () => ({
    UsersService: {
        searchUsersByBooks: jest.fn(),
    },
}));

jest.mock('../../components', () => ({
    CreateExchangeModal: (props: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        if (!props.isVisible) return null;
        return (
            <View testID="mock-exchange-modal">
                <Text>CreateExchangeModal</Text>
                <TouchableOpacity onPress={props.onClose} testID="mock-close-modal">
                    <Text>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={props.onSuccess} testID="mock-success-modal">
                    <Text>Success</Text>
                </TouchableOpacity>
            </View>
        );
    },
}));

describe('BookOwnersScreen', () => {
    const mockNavigate = jest.fn();
    const mockUser = { id: 'u1', name: 'Test User' };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
        (UsersService.searchUsersByBooks as jest.Mock).mockResolvedValue([]);
    });

    it('renders loading initially', () => {
        // We delay the promise to ensure loading renders
        let resolvePromise: any;
        const promise = new Promise((resolve) => { resolvePromise = resolve; });
        (UsersService.searchUsersByBooks as jest.Mock).mockReturnValue(promise);

        const { getByText } = render(<BookOwnersScreen bookId="b1" bookTitle="Mock Book" />);
        expect(getByText('Cargando usuarios...')).toBeTruthy();

        resolvePromise([]); // flush
    });

    it('renders empty state when no users are found', async () => {
        const { getByText, findByText } = render(<BookOwnersScreen bookId="b1" bookTitle="Mock Book" />);

        expect(await findByText('No hay usuarios con este libro disponible para intercambio')).toBeTruthy();
    });

    it('renders users when found', async () => {
        const mockUsers = [
            { id: 'u2', name: 'John', lastname: 'Doe', username: 'johndoe', image: 'avatar.jpg', address: { city: 'City', state: 'State', country: 'Country' } },
            { id: 'u3', name: 'Jane', lastname: 'Smith', username: 'janesmith', address: { city: 'City 2' } }
        ];

        (UsersService.searchUsersByBooks as jest.Mock).mockResolvedValue(mockUsers);

        const { findByText, getByText } = render(<BookOwnersScreen bookId="b1" />);

        expect(await findByText('2 usuarios encontrados')).toBeTruthy();
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('@johndoe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
        expect(getByText('City, State, Country')).toBeTruthy();
    });

    it('navigates to user profile on press', async () => {
        const mockUsers = [
            { id: 'u2', name: 'John', lastname: 'Doe', username: 'johndoe' }
        ];

        (UsersService.searchUsersByBooks as jest.Mock).mockResolvedValue(mockUsers);

        const { findByText } = render(<BookOwnersScreen bookId="b1" />);

        const userRow = await findByText('John Doe');
        fireEvent.press(userRow);

        expect(mockNavigate).toHaveBeenCalledWith('profile', { userId: 'u2' });
    });

    it('opens exchange modal and handles success/close', async () => {
        const mockUsers = [
            { id: 'u2', name: 'John', lastname: 'Doe', username: 'johndoe' }
        ];

        (UsersService.searchUsersByBooks as jest.Mock).mockResolvedValue(mockUsers);

        const { findByText, getByTestId, queryByTestId } = render(<BookOwnersScreen bookId="b1" />);

        const exchangeBtn = await findByText('Intercambio');
        fireEvent.press(exchangeBtn);

        // Modal should be visible
        expect(getByTestId('mock-exchange-modal')).toBeTruthy();

        // Close modal
        fireEvent.press(getByTestId('mock-close-modal'));
        expect(queryByTestId('mock-exchange-modal')).toBeNull();

        // Open again
        fireEvent.press(exchangeBtn);
        expect(getByTestId('mock-exchange-modal')).toBeTruthy();

        // Success
        fireEvent.press(getByTestId('mock-success-modal'));
        expect(queryByTestId('mock-exchange-modal')).toBeNull();
    });

    it('renders error state on API failure', async () => {
        (UsersService.searchUsersByBooks as jest.Mock).mockRejectedValue(new Error('API failed'));

        const { findByText } = render(<BookOwnersScreen bookId="b1" />);

        expect(await findByText('No se pudieron cargar los usuarios con este libro')).toBeTruthy();
    });
});
