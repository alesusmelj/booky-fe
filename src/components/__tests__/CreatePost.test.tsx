import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CreatePost } from '../CreatePost';
import { useAuth } from '../../contexts/AuthContext';
import { strings } from '../../constants/strings';
import { UserDto } from '../../types/api';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('CreatePost', () => {
  const mockUser: UserDto = {
    id: '1',
    username: 'johndoe',
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    image: 'https://example.com/avatar.jpg',
    date_created: '2025-01-01T00:00:00Z',
  };

  const defaultAuthState = {
    user: mockUser,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    clearError: jest.fn(),
    refreshUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(defaultAuthState);
  });

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const { getByTestId, getByPlaceholderText } = render(<CreatePost />);
      
      expect(getByTestId('user-avatar')).toBeTruthy();
      expect(getByPlaceholderText(strings.createPost.placeholder)).toBeTruthy();
      expect(getByTestId('add-image-button')).toBeTruthy();
      expect(getByTestId('publish-button')).toBeTruthy();
    });

    it('shows user avatar when user has profileImage', () => {
      const { getByTestId } = render(<CreatePost />);
      
      expect(getByTestId('user-avatar')).toBeTruthy();
    });

    it('shows default avatar when user has no image', () => {
      const { image, ...userWithoutImage } = mockUser;
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: userWithoutImage,
      });

      const { getByTestId } = render(<CreatePost />);
      
      expect(getByTestId('default-avatar')).toBeTruthy();
    });

    it('shows default avatar when user is null', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: null,
      });

      const { getByTestId } = render(<CreatePost />);
      
      expect(getByTestId('default-avatar')).toBeTruthy();
    });

    it('shows character count when showCharacterCount is true', () => {
      const { getByText } = render(<CreatePost maxLength={100} showCharacterCount={true} />);
      
      expect(getByText('0/100')).toBeTruthy();
    });

    it('does not show character count when showCharacterCount is false', () => {
      const { queryByText } = render(<CreatePost />);
      
      expect(queryByText(/\d+\/\d+/)).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = render(<CreatePost />);
      
      const textInput = getByTestId('post-text-input');
      const imageButton = getByTestId('add-image-button');
      const publishButton = getByTestId('publish-button');

      expect(textInput.props.accessibilityLabel).toBe(strings.createPost.textInputAccessibility);
      expect(imageButton.props.accessibilityLabel).toBe(strings.createPost.addImageAccessibility);
      expect(publishButton.props.accessibilityLabel).toBe(strings.createPost.publishAccessibility);
    });

    it('has accessible prop set to true for interactive elements', () => {
      const { getByTestId } = render(<CreatePost />);
      
      const textInput = getByTestId('post-text-input');
      const imageButton = getByTestId('add-image-button');
      const publishButton = getByTestId('publish-button');

      expect(textInput.props.accessible).toBe(true);
      expect(imageButton.props.accessible).toBe(true);
      expect(publishButton.props.accessible).toBe(true);
    });
  });

  describe('Text Input Functionality', () => {
    it('updates text content when user types', () => {
      const { getByTestId } = render(<CreatePost />);
      const textInput = getByTestId('post-text-input');
      
      fireEvent.changeText(textInput, 'Test post content');
      
      expect(textInput.props.value).toBe('Test post content');
    });

    it('updates character count when user types', () => {
      const { getByTestId, getByText } = render(<CreatePost maxLength={100} showCharacterCount={true} />);
      const textInput = getByTestId('post-text-input');
      
      fireEvent.changeText(textInput, 'Hello world');
      
      expect(getByText('11/100')).toBeTruthy();
    });

    it('respects maxLength prop', () => {
      const { getByTestId } = render(<CreatePost maxLength={10} />);
      const textInput = getByTestId('post-text-input');
      
      expect(textInput.props.maxLength).toBe(10);
    });

    it('is disabled when disabled prop is true', () => {
      const { getByTestId } = render(<CreatePost disabled={true} />);
      const textInput = getByTestId('post-text-input');
      
      expect(textInput.props.editable).toBe(false);
    });
  });

  describe('Publish Button State', () => {
    it('is disabled when text is empty and no images', () => {
      const { getByTestId } = render(<CreatePost />);
      const publishButton = getByTestId('publish-button');
      
      expect(publishButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('is enabled when text has content', () => {
      const { getByTestId } = render(<CreatePost />);
      const textInput = getByTestId('post-text-input');
      const publishButton = getByTestId('publish-button');
      
      fireEvent.changeText(textInput, 'Test content');
      
      expect(publishButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('is disabled when text is only whitespace', () => {
      const { getByTestId } = render(<CreatePost />);
      const textInput = getByTestId('post-text-input');
      const publishButton = getByTestId('publish-button');
      
      fireEvent.changeText(textInput, '   ');
      
      expect(publishButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('is disabled when disabled prop is true', () => {
      const { getByTestId } = render(<CreatePost disabled={true} />);
      const publishButton = getByTestId('publish-button');
      
      expect(publishButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Post Creation', () => {
    it('calls onPost callback when publish button is pressed with content', () => {
      const mockOnPost = jest.fn();
      const { getByTestId } = render(<CreatePost onPost={mockOnPost} />);
      const textInput = getByTestId('post-text-input');
      const publishButton = getByTestId('publish-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(publishButton);
      
      expect(mockOnPost).toHaveBeenCalledWith('Test post', []);
    });

    it('clears text after successful post', () => {
      const mockOnPost = jest.fn();
      const { getByTestId } = render(<CreatePost onPost={mockOnPost} />);
      const textInput = getByTestId('post-text-input');
      const publishButton = getByTestId('publish-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(publishButton);
      
      expect(textInput.props.value).toBe('');
    });

    it('trims whitespace from post content', () => {
      const mockOnPost = jest.fn();
      const { getByTestId } = render(<CreatePost onPost={mockOnPost} />);
      const textInput = getByTestId('post-text-input');
      const publishButton = getByTestId('publish-button');
      
      fireEvent.changeText(textInput, '  Test post  ');
      fireEvent.press(publishButton);
      
      expect(mockOnPost).toHaveBeenCalledWith('Test post', []);
    });

    it('does not call onPost when button is disabled', () => {
      const mockOnPost = jest.fn();
      const { getByTestId } = render(<CreatePost onPost={mockOnPost} />);
      const publishButton = getByTestId('publish-button');
      
      fireEvent.press(publishButton);
      
      expect(mockOnPost).not.toHaveBeenCalled();
    });
  });

  describe('Image Functionality', () => {
    it('shows alert when image button is pressed', () => {
      const { getByTestId } = render(<CreatePost />);
      const imageButton = getByTestId('add-image-button');
      
      fireEvent.press(imageButton);
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Funcionalidad próximamente',
        'La subida de imágenes estará disponible pronto.'
      );
    });

    it('image button is disabled when disabled prop is true', () => {
      const { getByTestId } = render(<CreatePost disabled={true} />);
      const imageButton = getByTestId('add-image-button');
      
      expect(imageButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('shows alert when post creation fails', () => {
      const mockOnPost = jest.fn(() => {
        throw new Error('Post creation failed');
      });
      
      const { getByTestId } = render(<CreatePost onPost={mockOnPost} />);
      const textInput = getByTestId('post-text-input');
      const publishButton = getByTestId('publish-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(publishButton);
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'No se pudo crear el post. Intenta de nuevo.'
      );
    });
  });
});