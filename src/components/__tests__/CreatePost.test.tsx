import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CreatePost } from '../CreatePost';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' },
}));

describe('CreatePost', () => {
    const mockUser = { id: 'u1', name: 'User 1', image: 'avatar.jpg' };
    const mockOnPost = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    });

    it('renders correctly', () => {
        const { getByTestId, getByPlaceholderText } = render(<CreatePost />);

        expect(getByTestId('user-avatar')).toBeTruthy();
        expect(getByPlaceholderText('¿Qué estás leyendo?')).toBeTruthy();
        expect(getByTestId('add-image-button')).toBeTruthy();

        const publishBtn = getByTestId('publish-button');
        expect(publishBtn).toBeTruthy();
        expect(publishBtn.props.accessibilityState?.disabled).toBe(true);
    });

    it('enables publish button when text is entered', () => {
        const { getByTestId, getByPlaceholderText } = render(<CreatePost />);

        const input = getByPlaceholderText('¿Qué estás leyendo?');
        fireEvent.changeText(input, 'This is a test post');

        const publishBtn = getByTestId('publish-button');
        expect(publishBtn.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('calls onPost and clears form on submit', () => {
        const { getByTestId, getByPlaceholderText } = render(<CreatePost onPost={mockOnPost} />);

        const input = getByPlaceholderText('¿Qué estás leyendo?');
        fireEvent.changeText(input, 'Test Post');

        fireEvent.press(getByTestId('publish-button'));

        expect(mockOnPost).toHaveBeenCalledWith('Test Post', []);
        expect(input.props.value).toBe('');
    });

    it('handles image selection and removal', async () => {
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://selected-image.jpg' }]
        });

        const { getByTestId, getByText, queryByText } = render(<CreatePost onPost={mockOnPost} />);

        // Add Image
        fireEvent.press(getByTestId('add-image-button'));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });

        // Publish button should be enabled after image selection
        const publishBtn = getByTestId('publish-button');
        expect(publishBtn.props.accessibilityState?.disabled).toBeFalsy();

        // Find remove image button (the "✕" text inside the TouchableOpacity)
        const removeBtnText = getByText('✕');
        expect(removeBtnText).toBeTruthy();

        // Remove image
        fireEvent.press(removeBtnText);

        expect(queryByText('✕')).toBeNull();
        expect(publishBtn.props.accessibilityState?.disabled).toBe(true); // Should be disabled again since text is empty
    });

    it('shows character count when enabled', () => {
        const { getByText, getByPlaceholderText } = render(<CreatePost showCharacterCount={true} maxLength={100} />);

        expect(getByText('0/100')).toBeTruthy();

        const input = getByPlaceholderText('¿Qué estás leyendo?');
        fireEvent.changeText(input, 'Hello');

        expect(getByText('5/100')).toBeTruthy();
    });
});
