# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Booky** is a Computer Engineering capstone project - a social network mobile application for book readers in Argentina (2025). The app facilitates access to physical books through exchanges/loans while expanding social connections among readers.

### Core Features
- **Book Management**: Personal library with book classification (read, reading, wishlist)
- **Book Exchange**: Physical book trading between users with location-based matching
- **Communities**: Thematic communities with posts and social interactions
- **Reading Clubs**: Virtual reading clubs with VR-enhanced meeting rooms
- **Gamification**: Achievement system with badges and user levels
- **Reputation System**: User ratings for reliable book exchanges
- **Social Features**: User following, profiles, feeds, and user discovery

### Target Platform
- Primary: iOS and Android mobile apps (React Native/Expo)
- Secondary: Web support for broader accessibility
- Geographic Focus: Argentina (Spanish language, local user base)

### Technical Vision
- **Current Phase**: Core social and exchange features
- **Future Enhancements**: VR reading rooms, ML-powered recommendations, virtual currency system
- **Integration Goals**: Libraries/bookstores for premium accounts, video calls for communities

This context shapes development decisions around user experience, social features, and mobile-first design patterns.

## Essential Commands

### Development
```bash
# Start development server
npm start                    # Standard dev server
npm run start:tunnel        # With tunnel (for remote/AWS development)
npm run start:clear         # Clear Metro cache and start
npm run android             # Launch on Android
npm run ios                 # Launch on iOS
npm run web                 # Launch in browser

# Testing
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report

# Code Quality (required before commits)
npm run lint               # Full ESLint check
npm run lint:errors-only   # Only errors (used in pre-commit)
npm run type-check         # TypeScript validation
npm run format             # Format with Prettier
```

### Single Test Execution
```bash
# Run specific test file
npm test -- --testPathPattern=ComponentName
npm test -- src/components/__tests__/Navbar.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

### Dependency Management
```bash
# Fix Expo SDK compatibility issues
npx expo install --fix

# Resolve React version conflicts (common issue)
npm install react@19.0.0 react-dom@19.0.0
npx expo install --fix
```

## Code Architecture

### API Layer Architecture
The project uses a centralized API service pattern:

- **`src/services/api.ts`**: Main API client with typed endpoints organized by domain (auth, book, post, etc.)
- **`src/types/api.ts`**: Comprehensive TypeScript definitions matching OpenAPI specification
- **Token Management**: Global token state with automatic header injection
- **Error Handling**: Custom `ApiError` class with status codes and structured error data

### Authentication Flow
- **`src/hooks/useAuth.ts`**: Central auth state management hook
- **`src/services/storage.ts`**: Persistent storage for user data and tokens using AsyncStorage
- **Auto-initialization**: Token restoration on app startup
- **State Structure**: `{user, token, isAuthenticated, isLoading, error}` + actions

### Storage Pattern
Uses a service-based storage abstraction:
- **Generic storage utilities** with error handling
- **Specialized storage services** (`authStorage`, `userStorage`)
- **Token lifecycle management** with automatic API client sync

### Component Structure
- **Components**: `src/components/` - Reusable UI components with TypeScript interfaces
- **Export Pattern**: Components exported through `src/components/index.ts`
- **Styling**: Uses `StyleSheet.create()` for performance, follows React Native patterns
- **Icons**: Uses `@expo/vector-icons` (MaterialIcons, Feather families)

### Logging Architecture
- **`src/utils/logger.ts`**: Professional logging utility replacing console statements
- **Development Mode**: Logs only appear when `__DEV__` is true
- **Production Ready**: Structured for integration with logging services (Sentry, LogRocket)
- **Log Levels**: error, warn, info, debug with consistent formatting

## Testing Configuration

### Jest Setup
- **Preset**: `@testing-library/react-native`
- **Expo Module Support**: Configured transform patterns for Expo packages
- **Mocks**: Essential mocks in `jest.setup.js` for `expo-status-bar` and `@expo/vector-icons`
- **Coverage**: Covers all `src/**/*.{ts,tsx}` except test files

### Pre-commit Quality Gates
Husky enforces three checks before every commit:
1. **Lint**: Full ESLint validation (warnings and errors)
2. **Type Check**: TypeScript compilation validation
3. **Tests**: Complete test suite execution

## Development Environment

### Tech Stack
- **Framework**: Expo 53 with React Native 0.79
- **Language**: TypeScript (strict mode)
- **State**: React hooks with custom auth hook
- **Storage**: AsyncStorage with service layer
- **Testing**: Jest + React Native Testing Library
- **Code Quality**: ESLint + Prettier + Husky

### Dev Container Support
Project includes full dev container configuration with:
- Node.js 18+, Java 17 for Android development
- Expo CLI and development tools pre-installed
- Tunnel support for remote development environments

### Remote Development
For AWS/cloud development, use tunnel mode to bypass network restrictions:
```bash
npm run start:tunnel
```

## Key Patterns

### Error Handling
- Use `ApiError` class for API-related errors with status codes
- Use `logger` utility instead of console statements (never use console.*)
- Structured error handling in async operations

### Type Safety
- All API responses and requests are fully typed
- Custom hooks return typed interfaces (e.g., `AuthState & AuthActions`)
- Component props use TypeScript interfaces

### State Management
- Authentication: Centralized in `useAuth` hook
- Local state: Standard React hooks
- Persistent data: AsyncStorage through service layer

### File Organization
- Domain-based API organization (auth, book, user, etc.)
- Centralized type definitions
- Service layer for external integrations
- Utility functions for cross-cutting concerns

## Development Workflow

### Component Development Process
1. Read design requirements (e.g., design images)
2. Examine project structure and existing patterns
3. Check tech stack and dependencies in package.json
4. Create component following existing conventions
5. Export from `components/index.ts`
6. Update App.tsx or parent component for usage
7. Run quality checks: `npm run lint && npm run type-check && npm test`

### Professional Logging
**Never use console statements.** Use the structured logger:
```typescript
import { logger } from '../utils/logger';

logger.error('Failed to initialize auth:', error);
logger.info('User refresh not implemented yet');
logger.warn('Deprecated API endpoint used');
```

### Component Best Practices
- Use `@expo/vector-icons` (MaterialIcons, Feather families)
- Use `StyleSheet.create()` for performance
- Follow cross-platform React Native patterns
- Include proper shadows/elevation for depth
- Keep components reusable with typed props

### Common Troubleshooting

**React Version Mismatch:**
```bash
npm install react@19.0.0 react-dom@19.0.0
npx expo install --fix
```

**Jest/Expo Module Issues:**
- Ensure proper mocks in `jest.setup.js`
- Check transformIgnorePatterns for new Expo modules

**Husky Pre-commit Fails:**
```bash
# Debug each step:
npm run lint           # Should pass (warnings OK, no errors)
npm run type-check     # Should pass (no TS errors)
npm test               # Should pass (all tests)
```

**ESLint Rule Issues:**
```javascript
// For examples/demo files:
/* eslint-disable no-unused-vars */

// For logger utility only:
/* eslint-disable no-console */
```