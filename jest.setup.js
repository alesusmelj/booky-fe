// Mock StatusBar for testing
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock vector icons for testing
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Feather: 'Feather',
}));
