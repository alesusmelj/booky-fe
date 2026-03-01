import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { useFeed } from '../../hooks/useFeed';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAlert } from '../../contexts/AlertContext';

jest.mock('../../hooks/useFeed', () => ({
    useFeed: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('../../contexts/AlertContext', () => ({
    useAlert: jest.fn(),
}));

jest.mock('../../components', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        CreatePost: ({ onPost }: any) => (
            <View testID="mock-create-post">
                <TouchableOpacity testID="submit-post-btn" onPress={() => onPost('New post context', [])}>
                    <Text>Create Post</Text>
                </TouchableOpacity>
            </View>
        ),
        Post: ({ post, onLike, onDelete }: any) => (
            <View testID={`mock-post-${post.id}`}>
                <Text>{post.body}</Text>
                <TouchableOpacity testID={`like-post-${post.id}`} onPress={() => onLike(post.id)}>
                    <Text>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity testID={`delete-post-${post.id}`} onPress={() => onDelete(post.id)}>
                    <Text>Delete</Text>
                </TouchableOpacity>
            </View>
        ),
    };
});

describe('HomeScreen', () => {
    const mockNavigate = jest.fn();
    const mockShowAlert = jest.fn();

    const mockRefreshFeed = jest.fn();
    const mockLoadMorePosts = jest.fn();
    const mockCreatePost = jest.fn();
    const mockDeletePost = jest.fn();
    const mockToggleLike = jest.fn();
    const mockClearError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useNavigation as jest.Mock).mockReturnValue({
            navigate: mockNavigate,
        });

        (useAlert as jest.Mock).mockReturnValue({
            showAlert: mockShowAlert,
        });

        (useFeed as jest.Mock).mockReturnValue({
            posts: [],
            loading: false,
            refreshing: false,
            loadingMore: false,
            error: null,
            hasMore: false,
            refreshFeed: mockRefreshFeed,
            loadMorePosts: mockLoadMorePosts,
            createPost: mockCreatePost,
            deletePost: mockDeletePost,
            toggleLike: mockToggleLike,
            clearError: mockClearError,
        });
    });

    it('renders loading state', () => {
        (useFeed as jest.Mock).mockReturnValue({
            posts: [],
            loading: true,
        });

        const { getByText } = render(<HomeScreen />);
        expect(getByText('Cargando tu feed...')).toBeTruthy();
    });

    it('renders error state', () => {
        (useFeed as jest.Mock).mockReturnValue({
            posts: [],
            loading: false,
            error: 'Failed to load feed',
        });

        const { getByText } = render(<HomeScreen />);
        expect(getByText('Failed to load feed')).toBeTruthy();
        expect(getByText('Desliza hacia abajo para intentar de nuevo')).toBeTruthy();
    });

    it('renders empty feed state', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('No hay posts en tu feed aún')).toBeTruthy();
    });

    it('renders posts when available', () => {
        (useFeed as jest.Mock).mockReturnValue({
            posts: [{ id: 'p1', body: 'First post content' }],
            loading: false,
            error: null,
        });

        const { getByText, getByTestId } = render(<HomeScreen />);
        expect(getByTestId('mock-create-post')).toBeTruthy();
        expect(getByText('First post content')).toBeTruthy();
    });

    it('allows creating a post', async () => {
        mockCreatePost.mockResolvedValue(true);
        const { getByTestId } = render(<HomeScreen />);

        fireEvent.press(getByTestId('submit-post-btn'));

        await waitFor(() => {
            expect(mockCreatePost).toHaveBeenCalledWith({ body: 'New post context' }, null);
        });
    });

    it('shows alert if creating a post fails', async () => {
        mockCreatePost.mockResolvedValue(false);
        const { getByTestId } = render(<HomeScreen />);

        fireEvent.press(getByTestId('submit-post-btn'));

        await waitFor(() => {
            expect(mockShowAlert).toHaveBeenCalledWith({
                title: 'Error',
                message: 'No se pudo crear el post. Intenta de nuevo.',
            });
        });
    });

    it('allows liking a post', async () => {
        (useFeed as jest.Mock).mockReturnValue({
            posts: [{ id: 'p1', body: 'First post content' }],
            loading: false,
            error: null,
            toggleLike: mockToggleLike,
        });

        const { getByTestId } = render(<HomeScreen />);

        fireEvent.press(getByTestId('like-post-p1'));

        await waitFor(() => {
            expect(mockToggleLike).toHaveBeenCalledWith('p1');
        });
    });
});
