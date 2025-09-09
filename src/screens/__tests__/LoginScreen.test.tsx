import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LoginScreen } from '../LoginScreen';
import { useAuth } from '../../contexts/AuthContext';
import { strings } from '../../constants';

// Mock useAuth hook
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  clearError: jest.fn(),
  refreshUser: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthState);
  });

  it('renders correctly with all elements', () => {
    const { getByTestId, getByText } = render(<LoginScreen />);

    // Check header elements
    expect(getByText(strings.app.name)).toBeTruthy();
    expect(getByText(strings.auth.appTagline)).toBeTruthy();

    // Check form elements
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('remember-me-checkbox')).toBeTruthy();
    expect(getByTestId('forgot-password-link')).toBeTruthy();
    expect(getByTestId('sign-in-button')).toBeTruthy();
    expect(getByTestId('create-account-link')).toBeTruthy();

    // Check text content
    expect(getByText(strings.auth.signIn)).toBeTruthy();
    expect(getByText(strings.auth.rememberMe)).toBeTruthy();
    expect(getByText(strings.auth.forgotPassword)).toBeTruthy();
    expect(getByText(strings.auth.notRegistered)).toBeTruthy();
    expect(getByText(strings.auth.createAccount)).toBeTruthy();
  });

  it('handles email input correctly', () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');

    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('handles password input correctly', () => {
    const { getByTestId } = render(<LoginScreen />);
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('handles remember me toggle', () => {
    const { getByTestId } = render(<LoginScreen />);
    const rememberMeCheckbox = getByTestId('remember-me-checkbox');

    fireEvent.press(rememberMeCheckbox);

    // Check that checkbox state changes (visual indication)
    expect(rememberMeCheckbox.props.accessibilityState.checked).toBe(true);
  });

  it('shows validation errors for empty fields', async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    const signInButton = getByTestId('sign-in-button');

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText(strings.errors.invalidEmail)).toBeTruthy();
      expect(getByText(strings.errors.passwordRequired)).toBeTruthy();
    });

    expect(mockAuthState.signIn).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');
    const signInButton = getByTestId('sign-in-button');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText(strings.errors.invalidEmail)).toBeTruthy();
    });

    expect(mockAuthState.signIn).not.toHaveBeenCalled();
  });

  it('calls signIn with valid credentials', async () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockAuthState.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('clears errors when user starts typing', () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');
    const signInButton = getByTestId('sign-in-button');

    // First trigger validation error
    fireEvent.press(signInButton);
    
    // Then start typing to clear the error
    fireEvent.changeText(emailInput, 'test@example.com');

    expect(mockAuthState.clearError).toHaveBeenCalled();
  });

  it('shows loading state when signing in', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthState,
      isLoading: true,
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    expect(getByText('Cargando...')).toBeTruthy();
    // Check that button has disabled backgroundColor
    const signInButton = getByTestId('sign-in-button');
    expect(signInButton.props.style.backgroundColor).toBe('#D1D5DB'); // disabled color
  });

  it('shows auth error when present', () => {
    const errorMessage = 'Authentication failed';
    mockUseAuth.mockReturnValue({
      ...mockAuthState,
      error: errorMessage,
    });

    const { getByTestId } = render(<LoginScreen />);

    expect(getByTestId('auth-error')).toBeTruthy();
  });

  it('handles sign in failure with alert', async () => {
    const signInMock = jest.fn().mockRejectedValue(new Error('Sign in failed'));
    mockUseAuth.mockReturnValue({
      ...mockAuthState,
      signIn: signInMock,
    });

    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', strings.errors.loginFailed);
    });
  });

  it('handles forgot password press', () => {
    const { getByTestId } = render(<LoginScreen />);
    const forgotPasswordLink = getByTestId('forgot-password-link');

    fireEvent.press(forgotPasswordLink);

    expect(Alert.alert).toHaveBeenCalledWith(
      strings.auth.forgotPassword,
      strings.placeholders.comingSoon,
      [{ text: 'OK' }]
    );
  });

  it('calls onCreateAccountPress when create account link is pressed', () => {
    const onCreateAccountPress = jest.fn();
    const { getByTestId } = render(
      <LoginScreen onCreateAccountPress={onCreateAccountPress} />
    );
    const createAccountLink = getByTestId('create-account-link');

    fireEvent.press(createAccountLink);

    expect(onCreateAccountPress).toHaveBeenCalled();
  });

  it('has proper accessibility labels', () => {
    const { getByTestId } = render(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const rememberMeCheckbox = getByTestId('remember-me-checkbox');
    const signInButton = getByTestId('sign-in-button');

    expect(emailInput.props.accessible).toBe(true);
    expect(emailInput.props.accessibilityLabel).toBe(strings.auth.email);

    expect(passwordInput.props.accessible).toBe(true);
    expect(passwordInput.props.accessibilityLabel).toBe(strings.auth.password);

    expect(rememberMeCheckbox.props.accessible).toBe(true);
    expect(rememberMeCheckbox.props.accessibilityLabel).toBe(strings.auth.rememberMe);
    expect(rememberMeCheckbox.props.accessibilityRole).toBe('checkbox');

    expect(signInButton.props.accessible).toBe(true);
    expect(signInButton.props.accessibilityLabel).toBe(strings.auth.signIn);
  });

  it('trims whitespace from email input', async () => {
    const { getByTestId, queryByText } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    fireEvent.changeText(emailInput, '  test@example.com  ');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    // Should not show validation errors since email is valid after trimming
    expect(queryByText(strings.errors.invalidEmail)).toBeNull();
    expect(queryByText(strings.errors.passwordRequired)).toBeNull();

    await waitFor(() => {
      expect(mockAuthState.signIn).toHaveBeenCalledWith({
        email: 'test@example.com', // Should be trimmed
        password: 'password123',
      });
    });
  });

  it('validates trimmed email correctly', async () => {
    const { getByTestId, queryByText } = render(<LoginScreen />);
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signInButton = getByTestId('sign-in-button');

    // Test that whitespace-only email shows validation error
    fireEvent.changeText(emailInput, '   ');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(queryByText(strings.errors.invalidEmail)).toBeTruthy();
    });

    expect(mockAuthState.signIn).not.toHaveBeenCalled();
  });
});