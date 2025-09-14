# LiveKit Service para Backend

## Instalación de Dependencias

```bash
npm install livekit-server-sdk
```

## Variables de Entorno

Basado en tu configuración actual de LiveKit Cloud:

```env
# .env
LIVEKIT_API_KEY=APIQTZk4A9komWw
LIVEKIT_API_SECRET=L1TojB8qfGbD26QIawCSop0tRAxQrtTs627URLD2KUO
LIVEKIT_WS_URL=wss://booky-rru3jofi.livekit.cloud
```

## Service Implementation

### 1. LiveKit Service Class

```javascript
// services/liveKitService.js
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

class LiveKitService {
  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY;
    this.apiSecret = process.env.LIVEKIT_API_SECRET;
    this.wsUrl = process.env.LIVEKIT_WS_URL;
    
    // Initialize room client for room management
    this.roomClient = new RoomServiceClient(
      this.wsUrl,
      this.apiKey,
      this.apiSecret
    );
  }

  /**
   * Create a LiveKit access token for a participant
   * @param {string} roomName - Name of the room
   * @param {string} participantName - Display name of the participant
   * @param {string} participantId - Unique ID of the participant (usually user ID)
   * @param {Object} permissions - Optional permissions object
   * @returns {string} JWT token
   */
  createToken(roomName, participantName, participantId, permissions = {}) {
    try {
      // Create access token
      const token = new AccessToken(
        this.apiKey,
        this.apiSecret,
        {
          identity: participantId.toString(), // Must be string
          name: participantName,
          // Optional: set token expiration (default is 6 hours)
          ttl: '6h'
        }
      );

      // Default permissions
      const defaultPermissions = {
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
        // Moderator permissions (set based on user role)
        roomAdmin: permissions.isModerator || false,
        roomRecord: permissions.canRecord || false,
        ...permissions
      };

      // Add room grant with permissions
      token.addGrant({
        room: roomName,
        ...defaultPermissions
      });

      return token.toJwt();
    } catch (error) {
      console.error('Error creating LiveKit token:', error);
      throw new Error('Failed to create access token');
    }
  }

  /**
   * Create or get a room
   * @param {string} roomName - Name of the room
   * @param {Object} options - Room configuration options
   * @returns {Promise<Object>} Room information
   */
  async createRoom(roomName, options = {}) {
    try {
      const roomOptions = {
        name: roomName,
        emptyTimeout: options.emptyTimeout || 300, // 5 minutes
        maxParticipants: options.maxParticipants || 50,
        metadata: JSON.stringify(options.metadata || {}),
        ...options
      };

      const room = await this.roomClient.createRoom(roomOptions);
      return room;
    } catch (error) {
      // Room might already exist
      if (error.message.includes('already exists')) {
        return await this.getRoom(roomName);
      }
      console.error('Error creating room:', error);
      throw new Error('Failed to create room');
    }
  }

  /**
   * Get room information
   * @param {string} roomName - Name of the room
   * @returns {Promise<Object>} Room information
   */
  async getRoom(roomName) {
    try {
      const rooms = await this.roomClient.listRooms([roomName]);
      return rooms.length > 0 ? rooms[0] : null;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  /**
   * Delete a room (ends meeting for all participants)
   * @param {string} roomName - Name of the room
   * @returns {Promise<boolean>} Success status
   */
  async deleteRoom(roomName) {
    try {
      await this.roomClient.deleteRoom(roomName);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  }

  /**
   * Get list of participants in a room
   * @param {string} roomName - Name of the room
   * @returns {Promise<Array>} List of participants
   */
  async getParticipants(roomName) {
    try {
      const participants = await this.roomClient.listParticipants(roomName);
      return participants;
    } catch (error) {
      console.error('Error getting participants:', error);
      return [];
    }
  }

  /**
   * Remove a participant from a room
   * @param {string} roomName - Name of the room
   * @param {string} participantId - ID of the participant to remove
   * @returns {Promise<boolean>} Success status
   */
  async removeParticipant(roomName, participantId) {
    try {
      await this.roomClient.removeParticipant(roomName, participantId);
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      return false;
    }
  }

  /**
   * Check if a room is active (has participants)
   * @param {string} roomName - Name of the room
   * @returns {Promise<Object>} Room status
   */
  async getRoomStatus(roomName) {
    try {
      const room = await this.getRoom(roomName);
      
      if (!room) {
        return {
          exists: false,
          isActive: false,
          participantCount: 0
        };
      }

      return {
        exists: true,
        isActive: room.numParticipants > 0,
        participantCount: room.numParticipants,
        creationTime: room.creationTime,
        metadata: room.metadata ? JSON.parse(room.metadata) : {}
      };
    } catch (error) {
      console.error('Error getting room status:', error);
      return {
        exists: false,
        isActive: false,
        participantCount: 0
      };
    }
  }
}

module.exports = new LiveKitService();
```

### 2. Usage Examples

```javascript
// controllers/meetingController.js
const liveKitService = require('../services/liveKitService');
const ReadingClub = require('../models/ReadingClub');

// Generate token for joining a meeting
exports.generateToken = async (req, res) => {
  try {
    const { readingClubId, participantName } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Verify user is member of the reading club
    const club = await ReadingClub.findById(readingClubId).populate('members');
    if (!club) {
      return res.status(404).json({ error: 'Reading club not found' });
    }
    
    const isMember = club.members.some(member => member.user_id === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this reading club' });
    }
    
    // Check if user is moderator
    const isModerator = club.moderator_id === userId;
    
    // Generate room name
    const roomName = `reading-club-${readingClubId}`;
    
    // Create token with appropriate permissions
    const token = liveKitService.createToken(
      roomName,
      participantName,
      userId,
      {
        isModerator,
        canRecord: isModerator,
        roomAdmin: isModerator
      }
    );
    
    res.json({
      token,
      roomName,
      participantName,
      isModerator
    });
    
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

// Start a meeting (moderator only)
exports.startMeeting = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;
    
    // Verify user is moderator
    const club = await ReadingClub.findById(clubId);
    if (!club || club.moderator_id !== userId) {
      return res.status(403).json({ error: 'Only moderators can start meetings' });
    }
    
    const roomName = `reading-club-${clubId}`;
    
    // Create room with metadata
    const roomMetadata = {
      clubId,
      clubName: club.name,
      moderatorId: userId,
      startedAt: new Date().toISOString()
    };
    
    await liveKitService.createRoom(roomName, {
      metadata: roomMetadata,
      emptyTimeout: 600, // 10 minutes
      maxParticipants: 50
    });
    
    // Update database
    await ReadingClub.findByIdAndUpdate(clubId, {
      meeting_active: true,
      meeting_started_at: new Date()
    });
    
    res.json({
      success: true,
      roomName,
      startedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error starting meeting:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
};

// End meeting (moderator only)
exports.endMeeting = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;
    
    // Verify user is moderator
    const club = await ReadingClub.findById(clubId);
    if (!club || club.moderator_id !== userId) {
      return res.status(403).json({ error: 'Only moderators can end meetings' });
    }
    
    const roomName = `reading-club-${clubId}`;
    
    // Delete room (disconnects all participants)
    const deleted = await liveKitService.deleteRoom(roomName);
    
    // Update database
    const endTime = new Date();
    const startTime = club.meeting_started_at;
    const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    
    await ReadingClub.findByIdAndUpdate(clubId, {
      meeting_active: false,
      meeting_ended_at: endTime,
      last_meeting_duration: duration
    });
    
    res.json({
      success: deleted,
      endedAt: endTime.toISOString(),
      duration
    });
    
  } catch (error) {
    console.error('Error ending meeting:', error);
    res.status(500).json({ error: 'Failed to end meeting' });
  }
};

// Get meeting status
exports.getMeetingStatus = async (req, res) => {
  try {
    const { clubId } = req.params;
    const roomName = `reading-club-${clubId}`;
    
    // Get room status from LiveKit
    const status = await liveKitService.getRoomStatus(roomName);
    
    // Get database info
    const club = await ReadingClub.findById(clubId);
    
    res.json({
      isActive: status.isActive,
      participantCount: status.participantCount,
      startedAt: club?.meeting_started_at?.toISOString() || null,
      roomName: status.exists ? roomName : null
    });
    
  } catch (error) {
    console.error('Error getting meeting status:', error);
    res.status(500).json({ error: 'Failed to get meeting status' });
  }
};
```

### 3. Routes

```javascript
// routes/meetings.js
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Generate token for joining a meeting
router.post('/token', meetingController.generateToken);

// Start meeting (moderator only)
router.post('/:clubId/start', meetingController.startMeeting);

// End meeting (moderator only)
router.post('/:clubId/end', meetingController.endMeeting);

// Get meeting status
router.get('/:clubId/status', meetingController.getMeetingStatus);

module.exports = router;
```

### 4. Integration in main app

```javascript
// app.js
const meetingRoutes = require('./routes/meetings');

// Mount routes
app.use('/api/reading-clubs/meeting', meetingRoutes);
```

## Características Clave

1. **Seguridad**: Verificación de permisos y autenticación
2. **Flexibilidad**: Permisos configurables según el rol del usuario
3. **Gestión de Salas**: Creación, eliminación y monitoreo de salas
4. **Manejo de Errores**: Gestión robusta de errores
5. **Metadatos**: Información adicional en las salas
6. **Moderación**: Funciones especiales para moderadores

## Testing

```javascript
// Test the service
const liveKitService = require('./services/liveKitService');

// Create a token
const token = liveKitService.createToken(
  'test-room',
  'Test User',
  'user-123',
  { isModerator: true }
);

console.log('Generated token:', token);
```

Este service te proporciona todas las funcionalidades necesarias para manejar las videollamadas de LiveKit en tu backend. ¿Te gustaría que ajuste algo específico o necesitas ayuda con la integración?

