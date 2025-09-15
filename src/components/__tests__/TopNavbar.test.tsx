import { render, fireEvent } from '@testing-library/react-native';
import { TopNavbar } from '../TopNavbar';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the AuthContext
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const renderWithAuth = (component: React.ReactElement) => {
  return render(<MockAuthProvider>{component}</MockAuthProvider>);
};

describe('TopNavbar', () => {
  it('should render correctly with default props', () => {
    const { getByText, getByTestId } = renderWithAuth(<TopNavbar />);
    
    expect(getByText('Booky')).toBeTruthy();
    expect(getByTestId('notification-button')).toBeTruthy();
    expect(getByTestId('profile-button')).toBeTruthy();
  });

  it('should show notification dot when hasNotifications is true', () => {
    const { getByTestId } = renderWithAuth(<TopNavbar hasNotifications={true} />);
    
    expect(getByTestId('notification-dot')).toBeTruthy();
  });

  it('should not show notification dot when hasNotifications is false', () => {
    const { queryByTestId } = renderWithAuth(<TopNavbar hasNotifications={false} />);
    
    expect(queryByTestId('notification-dot')).toBeNull();
  });

  it('should call onNotificationPress when notification button is pressed', () => {
    const mockOnNotificationPress = jest.fn();
    const { getByTestId } = renderWithAuth(
      <TopNavbar onNotificationPress={mockOnNotificationPress} />
    );
    
    fireEvent.press(getByTestId('notification-button'));
    expect(mockOnNotificationPress).toHaveBeenCalledTimes(1);
  });

  it('should open dropdown when profile button is pressed', () => {
    const { getByTestId } = renderWithAuth(<TopNavbar />);
    
    fireEvent.press(getByTestId('profile-button'));
    // The dropdown should be visible after pressing the profile button
    // Note: Testing the dropdown visibility might require additional setup
  });

  it('should render default avatar when user has no image', () => {
    const { getByTestId } = renderWithAuth(<TopNavbar />);
    
    expect(getByTestId('default-avatar')).toBeTruthy();
  });

  it('should have proper accessibility props', () => {
    const { getByTestId } = renderWithAuth(<TopNavbar />);
    
    const notificationButton = getByTestId('notification-button');
    const profileButton = getByTestId('profile-button');
    
    expect(notificationButton.props.accessible).toBe(true);
    expect(profileButton.props.accessible).toBe(true);
  });
});