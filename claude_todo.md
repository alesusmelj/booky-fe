# Claude TODO - Booky Project

This file tracks all TODO items that were not developed instantly during feature implementation. Each item should be addressed in future development cycles.

## Current TODOs

### CreatePost Component (formerly PostBox)
- **Location**: `src/components/CreatePost.tsx:50`
- **Task**: Implement image picker functionality
- **Description**: Need to integrate expo-image-picker to allow users to select and upload images with their posts
- **Priority**: High
- **Estimated Effort**: 2-3 hours
- **Dependencies**: expo-image-picker package, image upload API endpoint

### Home Screen - Create Post
- **Location**: `src/screens/HomeScreen.tsx:9`
- **Task**: Implement API call to create post
- **Description**: Connect the handleCreatePost function to the actual posts API endpoint to save posts to the backend
- **Priority**: High
- **Estimated Effort**: 1-2 hours
- **Dependencies**: Posts API endpoint, proper error handling

### Home Screen - Post Interactions
- **Location**: `src/screens/HomeScreen.tsx:13-21`
- **Task**: Implement like, comment, and user profile navigation
- **Description**: Connect the post interaction handlers to actual API endpoints and navigation
- **Priority**: Medium
- **Estimated Effort**: 3-4 hours
- **Dependencies**: Like/comment API endpoints, user profile navigation

### Home Screen - Dynamic Posts Feed
- **Location**: `src/screens/HomeScreen.tsx:28`
- **Task**: Replace sample posts with API data
- **Description**: Implement API call to fetch user's feed posts and replace sample data
- **Priority**: High
- **Estimated Effort**: 2-3 hours
- **Dependencies**: Posts feed API endpoint, proper loading states

### Search Screen - Book Details Navigation
- **Location**: `src/screens/SearchScreen.tsx:108`
- **Task**: Navigate to book details
- **Description**: Implement navigation to book details screen when a book card is pressed
- **Priority**: Medium
- **Estimated Effort**: 1-2 hours
- **Dependencies**: Book details screen component, navigation setup

### Search Screen - Favorite Toggle Functionality
- **Location**: `src/screens/SearchScreen.tsx:112`
- **Task**: Toggle favorite status
- **Description**: Implement API call to add/remove books from user favorites
- **Priority**: Medium
- **Estimated Effort**: 1-2 hours
- **Dependencies**: Favorites API endpoint, user authentication

### Search Screen - Person Profile Navigation
- **Location**: `src/screens/SearchScreen.tsx:116`
- **Task**: Navigate to person profile
- **Description**: Implement navigation to user profile screen when a person card is pressed
- **Priority**: Medium
- **Estimated Effort**: 1-2 hours
- **Dependencies**: User profile screen component, navigation setup

### Search Screen - Community Navigation
- **Location**: `src/screens/SearchScreen.tsx:120`
- **Task**: Navigate to community
- **Description**: Implement navigation to community detail screen when a community card is pressed
- **Priority**: Medium
- **Estimated Effort**: 1-2 hours
- **Dependencies**: Community detail screen component, navigation setup

### Search Screen - Readers Map Navigation
- **Location**: `src/screens/SearchScreen.tsx:124`
- **Task**: Navigate to readers map
- **Description**: Implement navigation to readers map screen showing nearby readers
- **Priority**: High
- **Estimated Effort**: 4-6 hours
- **Dependencies**: Readers map screen component, map integration (MapView), location permissions

### Search Screen - Replace Mock Data with API
- **Location**: `src/screens/SearchScreen.tsx:26-95`
- **Task**: Replace mock data with real API calls
- **Description**: Integrate with search API endpoints for books, people, and communities data
- **Priority**: High
- **Estimated Effort**: 3-4 hours
- **Dependencies**: Search API endpoints, proper loading states, error handling

### Search Screen - Implement Search Functionality
- **Location**: `src/screens/SearchScreen.tsx:104`
- **Task**: Implement live search functionality
- **Description**: Connect search text input to API calls and filter results based on user input
- **Priority**: High
- **Estimated Effort**: 2-3 hours
- **Dependencies**: Search API endpoints, debouncing for performance

## Completed TODOs

_No completed TODOs yet_

## Notes for Claude

- Always search for "TODO" comments in the codebase when working on features
- Add new TODOs to this file immediately when they are created
- Move completed items to the "Completed TODOs" section with completion date
- Include priority, effort estimation, and dependencies for better planning
- Keep descriptions clear and actionable for future development sessions