# LiveKit Integration Setup Guide

This guide explains how to complete the LiveKit integration for video calls in reading club meetings.

## Overview

The LiveKit integration has been implemented with the following components:

1. **LiveKitService** (`src/services/liveKitService.ts`) - Handles API calls for LiveKit tokens and meeting management
2. **VideoCallRoom** (`src/components/VideoCallRoom.tsx`) - React Native component for video calls
3. **Integration** - Updated `CommunityDetailScreen` and `ReadingClubsScreen` to use video calls

## Installation Steps

### 1. Install LiveKit Dependencies

Run the following commands to install the required packages:

```bash
npm install @livekit/react-native @livekit/react-native-webrtc
```

### 2. iOS Setup (if targeting iOS)

Add the following to your `ios/Podfile`:

```ruby
pod 'RNFS', :path => '../node_modules/react-native-fs'
```

Then run:

```bash
cd ios && pod install
```

### 3. Android Setup (if targeting Android)

Add the following permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### 4. Update VideoCallRoom Component

Once the packages are installed, uncomment and update the imports in `src/components/VideoCallRoom.tsx`:

```typescript
import { Room, Track } from 'livekit-client';
import {
  useRoom,
  useParticipants,
  useTracks,
  VideoView,
  AudioSession,
} from '@livekit/react-native';
```

### 5. Backend API Endpoints

The following API endpoints need to be implemented on your backend:

#### Get LiveKit Token
```
POST /reading-clubs/meeting/token
Body: {
  "readingClubId": "string",
  "participantName": "string"
}
Response: {
  "token": "string",
  "roomName": "string",
  "participantName": "string"
}
```

#### Start Meeting (Moderator only)
```
POST /reading-clubs/{clubId}/meeting/start
Response: {
  "success": boolean
}
```

#### End Meeting (Moderator only)
```
POST /reading-clubs/{clubId}/meeting/end
Response: {
  "success": boolean
}
```

#### Get Meeting Status
```
GET /reading-clubs/{clubId}/meeting/status
Response: {
  "isActive": boolean,
  "participantCount": number
}
```

## Usage

### Joining a Meeting

1. Users can click the "Join Meeting" button on reading club cards
2. The app will request a LiveKit token from the backend
3. The VideoCallRoom component will open in a full-screen modal
4. Users can toggle audio/video and leave the meeting

### Features Implemented

- ✅ Video call room UI with controls
- ✅ Audio/video toggle buttons
- ✅ Participant management
- ✅ Leave meeting functionality
- ✅ Error handling and loading states
- ✅ Integration with reading club screens

### Features Pending LiveKit Installation

- ⏳ Actual video/audio streaming
- ⏳ Real participant list
- ⏳ Screen sharing (can be added later)
- ⏳ Chat functionality (can be added later)

## Testing

After installation, you can test the integration by:

1. Navigate to a community with reading clubs
2. Click "Join Meeting" on any reading club
3. The video call interface should open
4. Test audio/video controls and leave functionality

## Troubleshooting

### Common Issues

1. **Package installation fails**: Make sure you're using a compatible React Native version
2. **iOS build fails**: Run `cd ios && pod install` after installing packages
3. **Android permissions**: Ensure all required permissions are added to AndroidManifest.xml
4. **Token errors**: Verify backend API endpoints are implemented correctly

### Support

For LiveKit-specific issues, refer to:
- [LiveKit React Native Documentation](https://docs.livekit.io/client-sdk-js/react-native/)
- [LiveKit GitHub Repository](https://github.com/livekit/client-sdk-js)

## Next Steps

1. Install the required packages
2. Implement backend API endpoints
3. Test the video call functionality
4. Add additional features like screen sharing or chat if needed
