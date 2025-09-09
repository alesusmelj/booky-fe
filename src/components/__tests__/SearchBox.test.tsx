import { render, fireEvent } from '@testing-library/react-native';
import { SearchBox } from '../SearchBox';

describe('SearchBox', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    mockOnChangeText.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId, getByDisplayValue } = render(
      <SearchBox value="" onChangeText={mockOnChangeText} />
    );

    expect(getByTestId('search-input')).toBeTruthy();
    expect(getByDisplayValue('')).toBeTruthy();
  });

  it('displays the provided value', () => {
    const testValue = 'Test search';
    const { getByDisplayValue } = render(
      <SearchBox value={testValue} onChangeText={mockOnChangeText} />
    );

    expect(getByDisplayValue(testValue)).toBeTruthy();
  });

  it('calls onChangeText when text is entered', () => {
    const { getByTestId } = render(
      <SearchBox value="" onChangeText={mockOnChangeText} />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'New search text');

    expect(mockOnChangeText).toHaveBeenCalledWith('New search text');
  });

  it('uses custom placeholder when provided', () => {
    const customPlaceholder = 'Custom placeholder';
    const { getByPlaceholderText } = render(
      <SearchBox value="" onChangeText={mockOnChangeText} placeholder={customPlaceholder} />
    );

    expect(getByPlaceholderText(customPlaceholder)).toBeTruthy();
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId } = render(
      <SearchBox value="" onChangeText={mockOnChangeText} />
    );

    const input = getByTestId('search-input');
    expect(input.props.accessible).toBe(true);
    expect(input.props.accessibilityLabel).toBeTruthy();
  });
});