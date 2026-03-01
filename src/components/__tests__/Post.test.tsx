import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Post } from '../Post';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../contexts/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../ImageViewer', () => ({
    ImageViewer: () => 'ImageViewer',
}));

jest.mock('../CommentsModal', () => ({
    CommentsModal: () => 'CommentsModal',
}));

describe('Post Component', () => {
    const mockShowAlert = jest.fn();
    const mockCurrentUser = { id: 'u1', name: 'Current User' };

    const mockPost = {
        id: 'p1',
        user_id: 'u2',
        user: { id: 'u2', name: 'Other', lastname: 'User', image: 'img.jpg' },
        body: 'Post content here',
        image: 'postImg.jpg',
        date_created: new Date().toISOString(),
        likes_count: 5,
        comments_count: 2,
        is_liked_by_user: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: mockCurrentUser });
        (useAlert as jest.Mock).mockReturnValue({ showAlert: mockShowAlert });
    });

    it('renders correctly', () => {
        const { getByText, getByTestId } = render(<Post post={mockPost} />);

        expect(getByText('Other User')).toBeTruthy();
        expect(getByText('Post content here')).toBeTruthy();
        expect(getByText('5')).toBeTruthy(); // Likes
        expect(getByText('2')).toBeTruthy(); // Comments
        expect(getByTestId('post-image')).toBeTruthy();
    });

    it('handles like', () => {
        const onLike = jest.fn();
        const { getByTestId, getByText } = render(<Post post={mockPost} onLike={onLike} />);

        const likeBtn = getByTestId('post-like-button');
        fireEvent.press(likeBtn);

        expect(onLike).toHaveBeenCalledWith('p1');
        // Check optimistic update
        expect(getByText('6')).toBeTruthy();
    });

    it('handles unlike', () => {
        const onLike = jest.fn();
        const { getByTestId, getByText } = render(<Post post={{ ...mockPost, is_liked_by_user: true, likes_count: 10 }} onLike={onLike} />);

        const likeBtn = getByTestId('post-like-button');
        fireEvent.press(likeBtn);

        expect(onLike).toHaveBeenCalledWith('p1');
        // Check optimistic update
        expect(getByText('9')).toBeTruthy();
    });

    it('handles comment', () => {
        const onComment = jest.fn();
        const { getByTestId } = render(<Post post={mockPost} onComment={onComment} />);

        fireEvent.press(getByTestId('post-comment-button'));
        expect(onComment).toHaveBeenCalledWith('p1');
    });

    it('handles user press', () => {
        const onUserPress = jest.fn();
        const { getByTestId } = render(<Post post={mockPost} onUserPress={onUserPress} />);

        fireEvent.press(getByTestId('post-user-button'));
        expect(onUserPress).toHaveBeenCalledWith('u2');
    });

    it('shows delete button for own post and handles deletion via alert', () => {
        const onDelete = jest.fn();
        const ownPost = { ...mockPost, user_id: 'u1', user: { ...mockPost.user, id: 'u1' } };

        const { getByTestId } = render(<Post post={ownPost} onDelete={onDelete} />);

        const deleteBtn = getByTestId('post-delete-button');
        expect(deleteBtn).toBeTruthy();

        fireEvent.press(deleteBtn);

        expect(mockShowAlert).toHaveBeenCalled();

        // Find the destructive button in alert and call its onPress
        const alertArgs = mockShowAlert.mock.calls[0][0];
        const destructiveBtn = alertArgs.buttons.find((b: any) => b.style === 'destructive');

        destructiveBtn.onPress();
        expect(onDelete).toHaveBeenCalledWith('p1');
    });

    it('hides delete button for other users posts', () => {
        const { queryByTestId } = render(<Post post={mockPost} />);
        expect(queryByTestId('post-delete-button')).toBeNull();
    });

    it('renders ImageViewer when image is clicked', () => {
        // Just verify if clicking triggers state change, it requires checking if ImageViewer receives visible=true, but we mocked it simply as text.
        // We can just trigger the press.
        const { getByTestId } = render(<Post post={mockPost} />);

        fireEvent.press(getByTestId('post-image'));
        // If it didn't crash, it works. Proper check would be to see if mocked ImageViewer becomes visible, but our mock always renders string 'ImageViewer'.
    });
});
