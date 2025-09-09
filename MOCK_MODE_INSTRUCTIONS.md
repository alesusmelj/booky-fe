# 📱 Mock Authentication Mode for Mobile Testing

To enable/disable mock authentication for mobile testing without backend connectivity:

## 🔧 How to Enable/Disable

### AuthContext (Main Switch)
**File:** `src/contexts/AuthContext.tsx`

```typescript
// Enable mock mode for mobile testing (set to true to bypass backend)
const ENABLE_MOCK_AUTH = true;  // ← Change this to false for production
```

## 🧪 Mock Mode Features

When mock mode is **ENABLED** (`true`):

- ✅ **Any email/password combination will work** for login
- ✅ **No visual indicator** - works seamlessly like normal login
- ✅ **Mock user data** with Spanish name and Buenos Aires location
- ✅ **1 second delay** simulates API call
- ✅ **No backend connection** required
- ✅ **All app features** work normally after login

### Mock User Details:
- **Name:** María González
- **Email:** test@booky.com
- **Username:** usuario_prueba
- **Location:** Buenos Aires, Argentina
- **Description:** "Amante de la literatura clásica y contemporánea"

## 🚀 Quick Setup for Mobile Testing

1. Set both flags to `true` (already done)
2. Build/run the mobile app: `npm start`
3. Enter ANY email and password on login screen
4. Tap login button → Success! 🎉
5. Navigate to Commerce tab to test the new features

## 🔒 For Production Deployment

1. Set flag to `false`:
   - `ENABLE_MOCK_AUTH = false` in AuthContext
2. Test with real backend connection
3. Deploy normally

## ⚠️ Important Notes

- Mock mode is **only for development/testing**
- **No visual indication** that mock mode is active - appears like normal app
- All authentication flows (login/signup/logout) work in mock mode
- No data is actually saved to a backend in mock mode
- Perfect for testing UI/UX on mobile devices without backend access

Happy testing! 🎯