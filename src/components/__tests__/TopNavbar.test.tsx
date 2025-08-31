import { render, fireEvent } from '@testing-library/react-native';
import { TopNavbar } from '../TopNavbar';

describe('TopNavbar', () => {
  it('should render correctly with default props', () => {
    const { getByText, getByTestId } = render(<TopNavbar />);
    
    expect(getByText('Booky')).toBeTruthy();
    expect(getByTestId('notification-button')).toBeTruthy();
    expect(getByTestId('profile-button')).toBeTruthy();
  });

  it('should show notification dot when hasNotifications is true', () => {
    const { getByTestId } = render(<TopNavbar hasNotifications={true} />);
    
    expect(getByTestId('notification-dot')).toBeTruthy();
  });

  it('should not show notification dot when hasNotifications is false', () => {
    const { queryByTestId } = render(<TopNavbar hasNotifications={false} />);
    
    expect(queryByTestId('notification-dot')).toBeNull();
  });

  it('should call onNotificationPress when notification button is pressed', () => {
    const mockOnNotificationPress = jest.fn();
    const { getByTestId } = render(
      <TopNavbar onNotificationPress={mockOnNotificationPress} />
    );
    
    fireEvent.press(getByTestId('notification-button'));
    expect(mockOnNotificationPress).toHaveBeenCalledTimes(1);
  });

  it('should call onProfilePress when profile button is pressed', () => {
    const mockOnProfilePress = jest.fn();
    const { getByTestId } = render(
      <TopNavbar onProfilePress={mockOnProfilePress} />
    );
    
    fireEvent.press(getByTestId('profile-button'));
    expect(mockOnProfilePress).toHaveBeenCalledTimes(1);
  });

  it('should render user avatar when userAvatar prop is provided', () => {
    const avatarUrl = 'https://example.com/avatar.jpg';
    const { getByTestId } = render(<TopNavbar userAvatar={avatarUrl} />);
    
    const avatarImage = getByTestId('user-avatar');
    expect(avatarImage.props.source.uri).toBe(avatarUrl);
  });

  it('should render default avatar when userAvatar prop is not provided', () => {
    const { getByTestId } = render(<TopNavbar />);
    
    expect(getByTestId('default-avatar')).toBeTruthy();
  });

  it('should have proper accessibility props', () => {
    const { getByTestId } = render(<TopNavbar />);
    
    const notificationButton = getByTestId('notification-button');
    const profileButton = getByTestId('profile-button');
    
    expect(notificationButton.props.accessible).toBe(true);
    expect(profileButton.props.accessible).toBe(true);
  });
});