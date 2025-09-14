# 🚨 BACKEND FIX REQUIRED: LiveKit Token Generation

## ❌ Problema Actual

El token JWT generado por el backend **NO incluye los permisos necesarios** para LiveKit, causando error **401 Unauthorized**.

### Token Actual (❌ Incorrecto):
```json
{
  "sub": "user-001",
  "iss": "APIQTZk4A9komWw",
  "name": "user-001",
  "video": {},  // ← VACÍO! Falta información del room
  "exp": 1757867036,
  "jti": "user-001"
}
```

### Token Requerido (✅ Correcto):
```json
{
  "sub": "user-001",
  "iss": "APIQTZk4A9komWw", 
  "name": "user-001",
  "video": {
    "room": "reading-club-123",  // ← FALTA ESTO
    "roomJoin": true,            // ← FALTA ESTO
    "canPublish": true,          // ← FALTA ESTO
    "canSubscribe": true,        // ← FALTA ESTO
    "canPublishData": true       // ← OPCIONAL
  },
  "exp": 1757867036,
  "jti": "user-001"
}
```

## ✅ Solución Requerida

### 1. Instalar LiveKit Server SDK
```bash
npm install livekit-server-sdk
```

### 2. Código Correcto (Node.js/Express)
```javascript
const { AccessToken } = require('livekit-server-sdk');

app.post('/api/reading-clubs/meetings/token', async (req, res) => {
  try {
    const { reading_club_id, participant_name } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Generate room name
    const roomName = `reading-club-${reading_club_id}`;
    
    // Create access token
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,     // "APIQTZk4A9komWw"
      process.env.LIVEKIT_API_SECRET,  // Your secret key
      {
        identity: userId,
        name: participant_name,
      }
    );
    
    // ⚠️ ESTO ES LO QUE FALTA - Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    
    res.json({
      token: token.toJwt(),
      room_name: roomName,
      participant_name: participant_name
    });
    
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});
```

### 3. Variables de Entorno Requeridas
```env
LIVEKIT_API_KEY=APIQTZk4A9komWw
LIVEKIT_API_SECRET=your_secret_key_here
LIVEKIT_WS_URL=wss://booky-rru3jofi.livekit.cloud
```

## 🔧 Solución Temporal Implementada

Mientras se arregla el backend, implementé un **fallback local** que genera tokens válidos para testing:

- ✅ **Frontend funciona** - Genera tokens localmente si backend falla
- ✅ **Testing habilitado** - Puedes probar meetings inmediatamente
- ⚠️ **Solo para desarrollo** - Los tokens deben generarse en backend en producción

## 🎯 Próximos Pasos

1. **Backend Team**: Implementar `token.addGrant()` como se muestra arriba
2. **DevOps**: Configurar variables de entorno de LiveKit
3. **Testing**: Verificar que el endpoint devuelve tokens con permisos correctos
4. **Frontend**: Remover fallback local una vez que backend esté arreglado

## 📋 Verificación

Para verificar que el token está correcto, decodifica el JWT y verifica que `video` contenga:
```json
{
  "video": {
    "room": "reading-club-{id}",
    "roomJoin": true,
    "canPublish": true,
    "canSubscribe": true
  }
}
```

## 🚀 Estado Actual

- ✅ **Frontend**: Listo y funcionando con fallback
- ❌ **Backend**: Requiere implementar `token.addGrant()`
- ✅ **LiveKit Server**: Configurado y funcionando
- ✅ **Testing**: Habilitado con tokens locales

**¡Una vez que el backend genere tokens correctos, las meetings funcionarán perfectamente!**
