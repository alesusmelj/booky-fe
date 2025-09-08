# Claude TODO - Booky Project

This file tracks all TODO items that were not developed instantly during feature implementation. Each item should be addressed in future development cycles.

## Current TODOs

### PostBox Component
- **Location**: `src/components/PostBox.tsx:50`
- **Task**: Implement image picker functionality
- **Description**: Need to integrate expo-image-picker to allow users to select and upload images with their posts
- **Priority**: High
- **Estimated Effort**: 2-3 hours
- **Dependencies**: expo-image-picker package, image upload API endpoint

### Home Screen
- **Location**: `src/screens/HomeScreen.tsx:8`
- **Task**: Implement API call to create post
- **Description**: Connect the handleCreatePost function to the actual posts API endpoint to save posts to the backend
- **Priority**: High
- **Estimated Effort**: 1-2 hours
- **Dependencies**: Posts API endpoint, proper error handling

## Completed TODOs

_No completed TODOs yet_

## Notes for Claude

- Always search for "TODO" comments in the codebase when working on features
- Add new TODOs to this file immediately when they are created
- Move completed items to the "Completed TODOs" section with completion date
- Include priority, effort estimation, and dependencies for better planning
- Keep descriptions clear and actionable for future development sessions