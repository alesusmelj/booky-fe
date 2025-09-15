# Booky - Social Network for Readers

A React Native mobile application built with Expo, TypeScript, and modern development tools.

## Features

- 📚 Social network for book lovers
- 👥 Community discussions and reading clubs
- 🎥 **Video calls for reading club meetings** (LiveKit integration)
- 📖 Book discovery and recommendations
- 💬 Posts and comments
- 🔄 Book trading and commerce

## Development Setup

### Using Dev Containers (Recommended)

This project is configured to work with Dev Containers, providing a consistent development environment without requiring local installations.

1. **Prerequisites**
   - [VS Code](https://code.visualstudio.com/)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Getting Started**
   ```bash
   # Clone the repository
   git clone https://github.com/alesusmelj/booky-fe.git
   cd booky-fe

   # Open in VS Code
   code .

   # VS Code will prompt to "Reopen in Container" - click Yes
   # Or use Command Palette (Cmd/Ctrl + Shift + P): "Dev Containers: Reopen in Container"
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development**
   ```bash
   # Start Expo development server
   npm start

   # Or start for a specific platform / network mode
   npm run android       # Android device/emulator
   npm run ios           # iOS simulator (macOS required)
   npm run web           # Web browser
   npm run start:tunnel  # With tunnel (for remote/AWS development)
   npm run start:lan     # With LAN access
   npm run start:clear   # Clear cache and start
   ```

## Platform Support

- Android: Supported
- iOS: Supported
- Web: Supported

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS simulator (macOS required)
- `npm run web` - Start web version
- `npm run start:tunnel` - Start with tunnel (for remote/AWS development)
- `npm run start:lan` - Start with LAN access
- `npm run start:clear` - Clear cache and start
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run clean` - Clean Expo cache and restart

## Project Structure

```
src/
  components/     # Reusable UI components
  screens/        # Screen components
  hooks/          # Custom React hooks
  services/       # API services and external integrations
  utils/          # Utility functions
  types/          # TypeScript type definitions
  __tests__/      # Test files and setup
```

## Code Quality

This project uses:
- **TypeScript** (strict mode) for type safety
- **ESLint** with React Native rules for code linting
- **Prettier** for consistent code formatting
- **Husky** for pre-commit hooks
- **Jest** for testing

## Development Tools

The Dev Container includes:
- Node.js 18+ with npm
- Java 17 (for Android development)
- Expo CLI and development tools
- VS Code extensions for React Native development
- Tunnel support via Expo's ngrok integration for remote development

## Remote Development

For remote development (AWS, Coder, etc.), use tunnel mode to bypass network restrictions:
```bash
npm run start:tunnel
```
This uses a secure tunnel so mobile devices can connect to your development server regardless of network configuration.

## Video Calling Setup (LiveKit)

The app includes video calling functionality for reading club meetings using LiveKit.

### Quick Setup
```bash
# Run the installation script
./scripts/install-livekit.sh
```

### Manual Setup
```bash
# Install LiveKit packages
npm install @livekit/react-native @livekit/react-native-webrtc

# For iOS (if applicable)
cd ios && pod install
```

For detailed setup instructions, backend API requirements, and troubleshooting, see [LIVEKIT_SETUP.md](./LIVEKIT_SETUP.md).

## Contributing

1. Make sure all tests pass: `npm test`
2. Run linting: `npm run lint`
3. Check TypeScript: `npm run type-check`
4. Format code: `npm run format`

Pre-commit hooks will automatically run these checks before each commit.
