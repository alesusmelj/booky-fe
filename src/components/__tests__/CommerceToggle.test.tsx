import { render, fireEvent } from '@testing-library/react-native';
import { CommerceToggle } from '../CommerceToggle';

describe('CommerceToggle', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with trade tab active by default', () => {
    const { getByTestId, getByText } = render(
      <CommerceToggle activeTab="trade" onTabChange={mockOnTabChange} />
    );

    expect(getByTestId('trade-books-tab')).toBeTruthy();
    expect(getByTestId('my-library-tab')).toBeTruthy();
    expect(getByText('Intercambiar Libros')).toBeTruthy();
    expect(getByText('Mi Biblioteca')).toBeTruthy();
  });

  it('renders correctly with library tab active', () => {
    const { getByTestId } = render(
      <CommerceToggle activeTab="library" onTabChange={mockOnTabChange} />
    );

    expect(getByTestId('trade-books-tab')).toBeTruthy();
    expect(getByTestId('my-library-tab')).toBeTruthy();
  });

  it('calls onTabChange when trade books tab is pressed', () => {
    const { getByTestId } = render(
      <CommerceToggle activeTab="library" onTabChange={mockOnTabChange} />
    );

    fireEvent.press(getByTestId('trade-books-tab'));
    expect(mockOnTabChange).toHaveBeenCalledWith('trade');
  });

  it('calls onTabChange when my library tab is pressed', () => {
    const { getByTestId } = render(
      <CommerceToggle activeTab="trade" onTabChange={mockOnTabChange} />
    );

    fireEvent.press(getByTestId('my-library-tab'));
    expect(mockOnTabChange).toHaveBeenCalledWith('library');
  });

  it('has proper accessibility labels', () => {
    const { getByTestId } = render(
      <CommerceToggle activeTab="trade" onTabChange={mockOnTabChange} />
    );

    const tradeTab = getByTestId('trade-books-tab');
    const libraryTab = getByTestId('my-library-tab');

    expect(tradeTab.props.accessibilityLabel).toBe('Intercambiar Libros');
    expect(libraryTab.props.accessibilityLabel).toBe('Mi Biblioteca');
    expect(tradeTab.props.accessible).toBe(true);
    expect(libraryTab.props.accessible).toBe(true);
  });
});