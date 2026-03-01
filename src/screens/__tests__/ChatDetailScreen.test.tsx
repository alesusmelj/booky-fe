import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatDetailScreen } from '../ChatDetailScreen';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useMessages } from '../../hooks';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: ({ name, ...props }: any) => {
        const { Text } = require('react-native');
        return <Text testID={`icon-${name}`} {...props}>{name}</Text>;
    },
}));

// Mock contexts and hooks
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('../../hooks', () => ({
    useMessages: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('react-native-safe-area-context', () => {
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
        SafeAreaConsumer: jest.fn().mockImplementation(({ children }) => children(inset)),
        useSafeAreaInsets: jest.fn().mockReturnValue(inset),
    };
});

jest.mock('../../components/ImageViewer', () => ({
    ImageViewer: () => 'ImageViewer',
}));

describe('ChatDetailScreen', () => {
    const mockNavigate = jest.fn();
    const mockGoBack = jest.fn();
    const mockSendMessage = jest.fn().mockResolvedValue(true);
    const mockMarkAsRead = jest.fn();

    const mockCurrentUser = { id: 'u1', name: 'Current User' };
    const mockOtherUser = { id: 'u2', name: 'Other', lastname: 'User', username: 'otheruser', image: 'https://example.com/img.jpg' };

    const mockRoute = {
        params: {
            chatId: 'chat1',
            otherUser: mockOtherUser,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useAuth as jest.Mock).mockReturnValue({ user: mockCurrentUser });
        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate, goBack: mockGoBack });

        (useMessages as jest.Mock).mockReturnValue({
            messages: [],
            loading: false,
            error: null,
            sending: false,
            sendMessage: mockSendMessage,
            markAsRead: mockMarkAsRead,
        });
    });

    it('renders empty state when there are no messages', () => {
        const { getByText } = render(<ChatDetailScreen route={mockRoute} />);

        expect(getByText('Inicia la conversación')).toBeTruthy();
        expect(getByText(`Envía un mensaje a ${mockOtherUser.name}`)).toBeTruthy();
    });

    it('displays loading state initially', () => {
        (useMessages as jest.Mock).mockReturnValue({
            messages: [],
            loading: true,
            error: null,
            sending: false,
            sendMessage: mockSendMessage,
            markAsRead: mockMarkAsRead,
        });

        const { getByText } = render(<ChatDetailScreen route={mockRoute} />);
        expect(getByText('Cargando mensajes...')).toBeTruthy();
    });

    it('renders messages and marks them as read', () => {
        (useMessages as jest.Mock).mockReturnValue({
            messages: [
                {
                    id: 'm1',
                    chat_id: 'chat1',
                    sender_id: 'u2',
                    content: 'Hello there',
                    date_sent: new Date().toISOString(),
                    read: false,
                    sender: { id: 'u2', name: 'Other User' },
                },
                {
                    id: 'm2',
                    chat_id: 'chat1',
                    sender_id: 'u1',
                    content: 'Hi!',
                    date_sent: new Date().toISOString(),
                    read: true,
                    sender: { id: 'u1', name: 'Current User' },
                }
            ],
            loading: false,
            error: null,
            sending: false,
            sendMessage: mockSendMessage,
            markAsRead: mockMarkAsRead,
        });

        const { getByText } = render(<ChatDetailScreen route={mockRoute} />);

        expect(getByText('Hello there')).toBeTruthy();
        expect(getByText('Hi!')).toBeTruthy();

        // Should mark as read when messages > 0
        expect(mockMarkAsRead).toHaveBeenCalled();
    });

    it('allows sending a text message', async () => {
        const { getByPlaceholderText, getByTestId } = render(<ChatDetailScreen route={mockRoute} />);

        const input = getByPlaceholderText('Escribe un mensaje...');
        fireEvent.changeText(input, 'Test message');

        // Press the send icon (which triggers the parent TouchableOpacity)
        fireEvent.press(getByTestId('icon-send'));

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith('Test message', null);
        });
    });

    it('allows attaching and removing an image', async () => {
        const { getByTestId, queryByTestId } = render(<ChatDetailScreen route={mockRoute} />);

        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://image.jpg' }],
        });

        fireEvent.press(getByTestId('icon-image'));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });

        // Press the send icon
        fireEvent.press(getByTestId('icon-send'));

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith('', 'file://image.jpg');
        });
    });
});
