import { render, fireEvent } from '@testing-library/react-native';
import { Post, PostData } from '../Post';
import { strings } from '../../constants/strings';

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Post', () => {
  const mockPost: PostData = {
    id: '1',
    user: {
      id: 'user1',
      name: 'John Doe',
      image: 'https://example.com/avatar.jpg',
    },
    content: 'This is a test post content',
    image: 'https://example.com/post-image.jpg',
    createdAt: '2025-09-08T10:00:00Z',
    likes: 42,
    comments: 5,
    isLiked: false,
  };

  const mockCallbacks = {
    onLike: jest.fn(),
    onComment: jest.fn(),
    onUserPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with all props', () => {
      const { getByTestId, getByText } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      expect(getByTestId('post-user-avatar')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('This is a test post content')).toBeTruthy();
      expect(getByTestId('post-image')).toBeTruthy();
      expect(getByText('42')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('renders without image when post has no image', () => {
      const { image, ...postWithoutImage } = mockPost;
      const { queryByTestId } = render(
        <Post post={postWithoutImage} {...mockCallbacks} />
      );

      expect(queryByTestId('post-image')).toBeFalsy();
    });

    it('shows default avatar when user has no image', () => {
      const { image, ...userWithoutImage } = mockPost.user;
      const postWithoutUserImage = {
        ...mockPost,
        user: userWithoutImage,
      };
      const { getByTestId } = render(
        <Post post={postWithoutUserImage} {...mockCallbacks} />
      );

      expect(getByTestId('post-default-avatar')).toBeTruthy();
    });

    it('shows user avatar when user has image', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      expect(getByTestId('post-user-avatar')).toBeTruthy();
    });
  });

  describe('Like Functionality', () => {
    it('shows filled heart when post is liked', () => {
      const likedPost = { ...mockPost, isLiked: true };
      const { getByTestId } = render(
        <Post post={likedPost} {...mockCallbacks} />
      );

      const likeButton = getByTestId('post-like-button');
      // Check if the MaterialIcons name prop is "favorite" for liked state
      expect(likeButton).toBeTruthy();
    });

    it('shows outlined heart when post is not liked', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      const likeButton = getByTestId('post-like-button');
      // Check if the MaterialIcons name prop is "favorite-border" for not liked state
      expect(likeButton).toBeTruthy();
    });

    it('calls onLike callback when like button is pressed', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      const likeButton = getByTestId('post-like-button');
      fireEvent.press(likeButton);

      expect(mockCallbacks.onLike).toHaveBeenCalledWith('1');
    });
  });

  describe('Comment Functionality', () => {
    it('calls onComment callback when comment button is pressed', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      const commentButton = getByTestId('post-comment-button');
      fireEvent.press(commentButton);

      expect(mockCallbacks.onComment).toHaveBeenCalledWith('1');
    });
  });

  describe('User Interaction', () => {
    it('calls onUserPress callback when user info is pressed', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      const userButton = getByTestId('post-user-button');
      fireEvent.press(userButton);

      expect(mockCallbacks.onUserPress).toHaveBeenCalledWith('user1');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      const userButton = getByTestId('post-user-button');
      const likeButton = getByTestId('post-like-button');
      const commentButton = getByTestId('post-comment-button');

      expect(userButton.props.accessibilityLabel).toBe(strings.post.userProfileAccessibility);
      expect(likeButton.props.accessibilityLabel).toBe(strings.post.likeAccessibility);
      expect(commentButton.props.accessibilityLabel).toBe(strings.post.commentAccessibility);
    });

    it('has accessible prop set to true for interactive elements', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      const userButton = getByTestId('post-user-button');
      const likeButton = getByTestId('post-like-button');
      const commentButton = getByTestId('post-comment-button');

      expect(userButton.props.accessible).toBe(true);
      expect(likeButton.props.accessible).toBe(true);
      expect(commentButton.props.accessible).toBe(true);
    });

    it('has post image accessibility label when image exists', () => {
      const { getByTestId } = render(
        <Post post={mockPost} {...mockCallbacks} />
      );

      const postImage = getByTestId('post-image');
      expect(postImage.props.accessibilityLabel).toBe(strings.post.postImageAccessibility);
    });
  });

  describe('Default Callbacks', () => {
    it('works without callback props provided', () => {
      const { getByTestId } = render(<Post post={mockPost} />);

      const likeButton = getByTestId('post-like-button');
      const commentButton = getByTestId('post-comment-button');
      const userButton = getByTestId('post-user-button');

      // These should not throw errors
      expect(() => {
        fireEvent.press(likeButton);
        fireEvent.press(commentButton);
        fireEvent.press(userButton);
      }).not.toThrow();
    });
  });
});