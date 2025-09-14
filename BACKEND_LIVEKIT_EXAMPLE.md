# Backend LiveKit Implementation Example

## Installation

```bash
npm install livekit-server-sdk
```

## Environment Variables

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_WS_URL=wss://your-livekit-server.com
```

## Implementation Example (Node.js/Express)

```javascript
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

// Initialize LiveKit client
const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_WS_URL,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

// 1. Generate LiveKit Token
app.post('/reading-clubs/meeting/token', async (req, res) => {
  try {
    const { readingClubId, participantName } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Verify user is member of the reading club
    const membership = await checkReadingClubMembership(userId, readingClubId);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this reading club' });
    }
    
    // Generate room name
    const roomName = `reading-club-${readingClubId}`;
    
    // Create access token
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: userId,
        name: participantName,
      }
    );
    
    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    
    res.json({
      token: token.toJwt(),
      roomName,
      participantName
    });
    
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// 2. Start Meeting (Moderator only)
app.post('/reading-clubs/:clubId/meeting/start', async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;
    
    // Verify user is moderator
    const club = await ReadingClub.findById(clubId);
    if (club.moderator_id !== userId) {
      return res.status(403).json({ error: 'Only moderators can start meetings' });
    }
    
    const roomName = `reading-club-${clubId}`;
    
    // Create or get existing room
    try {
      await roomClient.createRoom({
        name: roomName,
        emptyTimeout: 300, // 5 minutes
        maxParticipants: 50,
      });
    } catch (error) {
      // Room might already exist, that's okay
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    // Update database
    await ReadingClub.findByIdAndUpdate(clubId, {
      meeting_active: true,
      meeting_started_at: new Date(),
    });
    
    // Optional: Send notifications to members
    await notifyClubMembers(clubId, 'Meeting started!');
    
    res.json({
      success: true,
      roomName,
      startedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error starting meeting:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
});

// 3. End Meeting (Moderator only)
app.post('/reading-clubs/:clubId/meeting/end', async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;
    
    // Verify user is moderator
    const club = await ReadingClub.findById(clubId);
    if (club.moderator_id !== userId) {
      return res.status(403).json({ error: 'Only moderators can end meetings' });
    }
    
    const roomName = `reading-club-${clubId}`;
    
    // Delete room (disconnects all participants)
    try {
      await roomClient.deleteRoom(roomName);
    } catch (error) {
      // Room might not exist, that's okay
      console.warn('Room deletion warning:', error.message);
    }
    
    // Update database
    const endTime = new Date();
    const startTime = club.meeting_started_at;
    const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    
    await ReadingClub.findByIdAndUpdate(clubId, {
      meeting_active: false,
      meeting_ended_at: endTime,
      last_meeting_duration: duration,
    });
    
    res.json({
      success: true,
      endedAt: endTime.toISOString(),
      duration
    });
    
  } catch (error) {
    console.error('Error ending meeting:', error);
    res.status(500).json({ error: 'Failed to end meeting' });
  }
});

// 4. Get Meeting Status
app.get('/reading-clubs/:clubId/meeting/status', async (req, res) => {
  try {
    const { clubId } = req.params;
    const roomName = `reading-club-${clubId}`;
    
    let isActive = false;
    let participantCount = 0;
    let startedAt = null;
    
    try {
      // Get room info from LiveKit
      const rooms = await roomClient.listRooms([roomName]);
      
      if (rooms.length > 0) {
        const room = rooms[0];
        isActive = room.numParticipants > 0;
        participantCount = room.numParticipants;
      }
    } catch (error) {
      // Room doesn't exist or other error
      console.warn('Room status check warning:', error.message);
    }
    
    // Get info from database
    const club = await ReadingClub.findById(clubId);
    if (club && club.meeting_active) {
      startedAt = club.meeting_started_at;
    }
    
    res.json({
      isActive,
      participantCount,
      startedAt: startedAt ? startedAt.toISOString() : null,
      roomName
    });
    
  } catch (error) {
    console.error('Error checking meeting status:', error);
    res.status(500).json({ error: 'Failed to check meeting status' });
  }
});

// Helper functions
async function checkReadingClubMembership(userId, clubId) {
  // Implement your membership check logic
  const membership = await ReadingClubMember.findOne({
    user_id: userId,
    reading_club_id: clubId
  });
  return membership !== null;
}

async function notifyClubMembers(clubId, message) {
  // Implement your notification logic
  // Could be push notifications, emails, etc.
  console.log(`Notifying club ${clubId}: ${message}`);
}
```

## Database Schema Updates

You might need to add these fields to your reading clubs table:

```sql
ALTER TABLE reading_clubs ADD COLUMN meeting_active BOOLEAN DEFAULT FALSE;
ALTER TABLE reading_clubs ADD COLUMN meeting_started_at TIMESTAMP NULL;
ALTER TABLE reading_clubs ADD COLUMN meeting_ended_at TIMESTAMP NULL;
ALTER TABLE reading_clubs ADD COLUMN last_meeting_duration INTEGER DEFAULT 0;
```

## Security Considerations

1. **Authentication**: All endpoints should require valid JWT tokens
2. **Authorization**: Verify user permissions for each reading club
3. **Rate Limiting**: Prevent abuse of token generation
4. **Token Expiration**: Set appropriate token expiration times
5. **Room Cleanup**: Implement cleanup for abandoned rooms

## Testing

```javascript
// Test token generation
const response = await fetch('/reading-clubs/meeting/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    readingClubId: 'club-123',
    participantName: 'Test User'
  })
});

const data = await response.json();
console.log('Token:', data.token);
```

