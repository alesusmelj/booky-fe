import { render, fireEvent } from '@testing-library/react-native';
import { LibraryBookCard } from '../LibraryBookCard';

const mockBook = {
  id: 1,
  title: 'El Quijote',
  author: 'Miguel de Cervantes',
  image: '/test-image.jpg',
  isAvailable: false,
};

const mockAvailableBook = {
  ...mockBook,
  isAvailable: true,
};

describe('LibraryBookCard', () => {
  const mockOnToggleAvailability = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with unavailable book', () => {
    const { getByText, getByTestId } = render(
      <LibraryBookCard book={mockBook} onToggleAvailability={mockOnToggleAvailability} />
    );

    expect(getByText('El Quijote')).toBeTruthy();
    expect(getByText('Miguel de Cervantes')).toBeTruthy();
    expect(getByText('Toca para marcar como disponible')).toBeTruthy();
    expect(getByTestId('book-card-1')).toBeTruthy();
  });

  it('renders correctly with available book', () => {
    const { getByText, queryByText } = render(
      <LibraryBookCard book={mockAvailableBook} onToggleAvailability={mockOnToggleAvailability} />
    );

    expect(getByText('El Quijote')).toBeTruthy();
    expect(getByText('Miguel de Cervantes')).toBeTruthy();
    expect(getByText('Disponible para intercambio')).toBeTruthy();
    expect(getByText('Disponible')).toBeTruthy(); // Badge text
    expect(queryByText('Toca para marcar como disponible')).toBeFalsy();
  });

  it('calls onToggleAvailability when pressed', () => {
    const { getByTestId } = render(
      <LibraryBookCard book={mockBook} onToggleAvailability={mockOnToggleAvailability} />
    );

    fireEvent.press(getByTestId('book-card-1'));
    expect(mockOnToggleAvailability).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility labels', () => {
    const { getByTestId } = render(
      <LibraryBookCard book={mockBook} onToggleAvailability={mockOnToggleAvailability} />
    );

    const bookCard = getByTestId('book-card-1');
    expect(bookCard.props.accessibilityLabel).toBe('El Quijote de Miguel de Cervantes. Toca para marcar como disponible');
    expect(bookCard.props.accessible).toBe(true);
  });

  it('shows available badge only when book is available', () => {
    const { queryByText, rerender } = render(
      <LibraryBookCard book={mockBook} onToggleAvailability={mockOnToggleAvailability} />
    );

    expect(queryByText('Disponible')).toBeFalsy(); // Badge should not be present

    rerender(
      <LibraryBookCard book={mockAvailableBook} onToggleAvailability={mockOnToggleAvailability} />
    );

    expect(queryByText('Disponible')).toBeTruthy(); // Badge should be present
  });
});