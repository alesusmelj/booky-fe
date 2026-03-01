// Mock StatusBar for testing
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock StatusBar for testing
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock vector icons for testing
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Feather: 'Feather',
}));

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));

jest.mock('@livekit/react-native', () => ({
  useRoom: jest.fn(),
  useParticipants: jest.fn(),
  useTracks: jest.fn(),
  AudioSession: {
    startAudioSession: jest.fn(),
    stopAudioSession: jest.fn(),
  },
  VideoView: 'VideoView',
}));