import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CommentsModal } from '../CommentsModal';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import { Alert } from 'react-native';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../hooks/useComments', () => ({
    useComments: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
    return {
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
});

describe('CommentsModal', () => {
    const mockUser = { id: 'u1', name: 'Current User' };
    const mockFetchComments = jest.fn();
    const mockCreateComment = jest.fn().mockResolvedValue(true);
    const mockDeleteComment = jest.fn().mockResolvedValue(true);
    const mockOnClose = jest.fn();
    const mockOnCommentsCountChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
        (useComments as jest.Mock).mockReturnValue({
            comments: [],
            loading: false,
            creating: false,
            fetchComments: mockFetchComments,
            createComment: mockCreateComment,
            deleteComment: mockDeleteComment,
        });
        jest.spyOn(Alert, 'alert');
    });

    it('renders empty state when no comments and not loading', () => {
        const { getByText } = render(<CommentsModal visible={true} postId="p1" onClose={mockOnClose} />);

        expect(getByText('No hay comentarios aún')).toBeTruthy();
        expect(mockFetchComments).toHaveBeenCalled();
    });

    it('renders comments and allows sending a new comment', async () => {
        (useComments as jest.Mock).mockReturnValue({
            comments: [
                { id: 'c1', user_id: 'u2', user: { name: 'John', lastname: 'Doe' }, body: 'First comment', date_created: new Date().toISOString() }
            ],
            loading: false,
            creating: false,
            fetchComments: mockFetchComments,
            createComment: mockCreateComment,
            deleteComment: mockDeleteComment,
        });

        const { getByText, getByPlaceholderText, UNSAFE_getAllByType } = render(
            <CommentsModal visible={true} postId="p1" onClose={mockOnClose} onCommentsCountChange={mockOnCommentsCountChange} />
        );

        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('First comment')).toBeTruthy();
        expect(mockOnCommentsCountChange).toHaveBeenCalledWith(1);

        const input = getByPlaceholderText('Escribe un comentario...');
        fireEvent.changeText(input, 'My new comment');

        // Find the send button (second to last TouchableOpacity, wait there are 2 touchables: close and send, but wait, flatlist items might have touchables)
        // Since comment c1 is from u2 (not u1), there's no delete button.
        // Touchables: Close button, Send button.
        const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
        const sendBtn = touchables[touchables.length - 1];

        fireEvent.press(sendBtn);

        await waitFor(() => {
            expect(mockCreateComment).toHaveBeenCalledWith('My new comment');
        });
    });

    it('shows delete button for own comments and handles deletion via alert', async () => {
        (useComments as jest.Mock).mockReturnValue({
            comments: [
                { id: 'c1', user_id: 'u1', user: { name: 'Current User', lastname: '' }, body: 'Own comment', date_created: new Date().toISOString() }
            ],
            loading: false,
            creating: false,
            fetchComments: mockFetchComments,
            createComment: mockCreateComment,
            deleteComment: mockDeleteComment,
        });

        const { UNSAFE_getAllByType } = render(<CommentsModal visible={true} postId="p1" onClose={mockOnClose} />);

        // Touchables: Close, Delete, Send. Delete should be the second one.
        const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
        const deleteBtn = touchables[1]; // The delete button inside the renderComment

        fireEvent.press(deleteBtn);

        expect(Alert.alert).toHaveBeenCalled();
        const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];

        // Find destructive button and press it
        const destructiveBtn = alertArgs[2].find((b: any) => b.style === 'destructive');
        destructiveBtn.onPress();

        expect(mockDeleteComment).toHaveBeenCalledWith('c1');
    });
});
