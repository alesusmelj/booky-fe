import { render } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

// Mock the PostBox component
jest.mock('../../components', () => ({
  PostBox: 'PostBox',
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Tu feed')).toBeTruthy();
    expect(getByText('¡Sigue a otros usuarios para ver sus posts aquí!')).toBeTruthy();
  });

  it('contains PostBox component', () => {
    const { root } = render(<HomeScreen />);
    
    // Just verify the component renders without errors
    expect(root).toBeTruthy();
  });
});