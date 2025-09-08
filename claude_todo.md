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
- **Location**: `src/screens/HomeScreen.tsx:24-49`
- **Task**: Replace sample posts with API data
- **Description**: Implement API call to fetch user's feed posts and replace sample data
- **Priority**: High
- **Estimated Effort**: 2-3 hours
- **Dependencies**: Posts feed API endpoint, proper loading states

## Completed TODOs

_No completed TODOs yet_

## Notes for Claude

- Always search for "TODO" comments in the codebase when working on features
- Add new TODOs to this file immediately when they are created
- Move completed items to the "Completed TODOs" section with completion date
- Include priority, effort estimation, and dependencies for better planning
- Keep descriptions clear and actionable for future development sessions