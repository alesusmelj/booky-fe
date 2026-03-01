import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatsScreen } from '../ChatsScreen';
import { useChats } from '../../hooks';
import { useNavigation } from '../../contexts/NavigationContext';

// Mock dependencias
jest.mock('../../hooks', () => ({
    useChats: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    }
}));

// Mock iconos
jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    return {
        MaterialIcons: ({ testID, ...props }: any) => <View testID={testID || "mock-material-icon"} {...props} />
    };
});

describe('ChatsScreen', () => {
    const mockNavigate = jest.fn();
    const mockRefresh = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigation as jest.Mock).mockReturnValue({
            navigate: mockNavigate,
        });
    });

    it('renders loading state correctly', () => {
        (useChats as jest.Mock).mockReturnValue({
            chats: [],
            loading: true,
            error: null,
            refreshing: false,
            refresh: mockRefresh,
        });

        const { getByText, getByType } = render(<ChatsScreen />);

        expect(getByText('Cargando chats...')).toBeTruthy();
    });

    it('renders error state correctly and can retry', () => {
        const errorMessage = 'Error de conexión';
        (useChats as jest.Mock).mockReturnValue({
            chats: [],
            loading: false,
            error: errorMessage,
            refreshing: false,
            refresh: mockRefresh,
        });

        const { getByText } = render(<ChatsScreen />);

        expect(getByText('Error al cargar chats')).toBeTruthy();
        expect(getByText(errorMessage)).toBeTruthy();

        const retryButton = getByText('Reintentar');
        fireEvent.press(retryButton);
        expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('renders empty state when there are no chats', () => {
        (useChats as jest.Mock).mockReturnValue({
            chats: [],
            loading: false,
            error: null,
            refreshing: false,
            refresh: mockRefresh,
        });

        const { getByText } = render(<ChatsScreen />);

        expect(getByText('No hay chats')).toBeTruthy();
        expect(getByText(/Inicia una conversación/i)).toBeTruthy();
    });

    it('renders list of chats correctly', () => {
        const mockChats = [
            {
                id: '1',
                other_user: { id: 'u1', name: 'Juan', lastname: 'Pérez', image: null },
                last_message: { content: 'Hola ¿cómo estás?' },
                last_message_date: new Date().toISOString(),
                unread_count: 2,
                date_created: new Date().toISOString(),
            },
            {
                id: '2',
                other_user: { id: 'u2', name: 'Ana', lastname: 'Gómez', image: 'https://example.com/ana.png' },
                last_message: { content: '¡Gracias!' },
                last_message_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                unread_count: 0,
                date_created: new Date().toISOString(),
            }
        ];

        (useChats as jest.Mock).mockReturnValue({
            chats: mockChats,
            loading: false,
            error: null,
            refreshing: false,
            refresh: mockRefresh,
        });

        const { getByText } = render(<ChatsScreen />);

        expect(getByText('Juan Pérez')).toBeTruthy();
        expect(getByText('Hola ¿cómo estás?')).toBeTruthy();
        expect(getByText('2')).toBeTruthy(); // unread count

        expect(getByText('Ana Gómez')).toBeTruthy();
        expect(getByText('¡Gracias!')).toBeTruthy();
    });

    it('navigates to ChatDetail when a chat is pressed', () => {
        const mockChat = {
            id: 'chat123',
            other_user: { id: 'u1', name: 'Juan', lastname: 'Pérez' },
            last_message: { content: 'Hola' },
            last_message_date: new Date().toISOString(),
            unread_count: 0,
            date_created: new Date().toISOString(),
        };

        (useChats as jest.Mock).mockReturnValue({
            chats: [mockChat],
            loading: false,
            error: null,
            refreshing: false,
            refresh: mockRefresh,
        });

        const { getByText } = render(<ChatsScreen />);

        fireEvent.press(getByText('Juan Pérez'));

        expect(mockNavigate).toHaveBeenCalledWith('ChatDetail', {
            chatId: mockChat.id,
            otherUser: mockChat.other_user
        });
    });
});
