import { render, fireEvent } from '@testing-library/react-native';
import { SearchFilters, FilterType } from '../SearchFilters';

describe('SearchFilters', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders all filter options', () => {
    const { getByTestId } = render(
      <SearchFilters activeFilters={['books']} onFilterChange={mockOnFilterChange} />
    );

    expect(getByTestId('filter-books')).toBeTruthy();
    expect(getByTestId('filter-people')).toBeTruthy();
    expect(getByTestId('filter-communities')).toBeTruthy();
  });

  it('calls onFilterChange when a filter is pressed to add it', () => {
    const { getByTestId } = render(
      <SearchFilters activeFilters={[]} onFilterChange={mockOnFilterChange} />
    );

    const booksFilter = getByTestId('filter-books');
    fireEvent.press(booksFilter);

    expect(mockOnFilterChange).toHaveBeenCalledWith(['books']);
  });

  it('calls onFilterChange when a filter is pressed to remove it', () => {
    const { getByTestId } = render(
      <SearchFilters activeFilters={['books', 'people']} onFilterChange={mockOnFilterChange} />
    );

    const booksFilter = getByTestId('filter-books');
    fireEvent.press(booksFilter);

    expect(mockOnFilterChange).toHaveBeenCalledWith(['people']);
  });

  it('applies active styling to the selected filters', () => {
    const { getByTestId } = render(
      <SearchFilters activeFilters={['books']} onFilterChange={mockOnFilterChange} />
    );

    const booksFilter = getByTestId('filter-books');
    
    // The active filter should have the primary color background
    expect(booksFilter.props.style).toEqual(
      expect.objectContaining({ backgroundColor: '#6366F1' })
    );
  });

  it('has proper accessibility attributes for all filters', () => {
    const { getByTestId } = render(
      <SearchFilters activeFilters={['books']} onFilterChange={mockOnFilterChange} />
    );

    const filters: FilterType[] = ['books', 'people', 'communities'];
    
    filters.forEach(filter => {
      const filterButton = getByTestId(`filter-${filter}`);
      expect(filterButton.props.accessible).toBe(true);
      expect(filterButton.props.accessibilityLabel).toBeTruthy();
    });
  });
});