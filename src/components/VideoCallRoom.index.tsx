import { Platform } from 'react-native';

// Platform-specific imports
let VideoCallRoom: any;

if (Platform.OS === 'web') {
  // Use web-compatible version
  VideoCallRoom = require('./VideoCallRoom.web').VideoCallRoom;
} else {
  // Use native version for iOS/Android
  VideoCallRoom = require('./VideoCallRoom.native').VideoCallRoom;
}

export { VideoCallRoom };
