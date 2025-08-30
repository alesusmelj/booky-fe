# Booky API Service

This directory contains the frontend API service layer for the Booky application, providing a clean and type-safe interface to the backend REST API.

## Architecture

### Files Overview

- **`api.ts`** - Main API service with all endpoint implementations
- **`storage.ts`** - AsyncStorage utilities for persisting data locally
- **`index.ts`** - Exports for easy importing
- **`examples.ts`** - Usage examples and patterns
- **`../types/api.ts`** - Complete TypeScript definitions
- **`../hooks/useAuth.ts`** - Authentication hook with state management

### Key Features

- ✅ **Complete OpenAPI Coverage** - All endpoints from the OpenAPI spec are implemented
- ✅ **Type Safety** - Full TypeScript support with generated types
- ✅ **Error Handling** - Comprehensive error handling with custom `ApiError` class
- ✅ **Authentication** - Automatic token management and injection
- ✅ **File Uploads** - Support for multipart/form-data requests
- ✅ **Local Storage** - Persistent storage for auth tokens and user data
- ✅ **React Native Compatible** - Works with Expo and React Native
- ✅ **Environment Aware** - Automatic dev/production API URL switching

## Quick Start

### 1. Authentication

```typescript
import { api, useAuth } from '../services';

// Using the auth hook in a component
const { signIn, signUp, signOut, user, isAuthenticated } = useAuth();

// Sign in
await signIn({ email: 'user@example.com', password: 'password' });

// Sign up
await signUp({
  username: 'johndoe',
  name: 'John',
  lastname: 'Doe', 
  email: 'john@example.com',
  password: 'securepassword'
});
```

### 2. Book Management

```typescript
import { api, BookStatus } from '../services';

// Search books
const books = await api.book.searchBooks('Harry Potter');

// Add to library
const userBook = await api.book.addBookToLibrary({
  isbn: '9780439708180',
  status: BookStatus.TO_READ
});

// Update status
await api.book.updateBookStatus(userBook.id, {
  status: BookStatus.READING
});

// Get user library
const library = await api.book.getUserLibrary('user-id', {
  status: BookStatus.READING,
  favorites: true
});
```

### 3. Social Features

```typescript
// Create post
const post = await api.post.createPost({
  body: 'Just finished an amazing book!',
  community_id: 'community-123'
});

// Add comment
await api.comment.createComment({
  body: 'Great review!',
  post_id: post.id
});

// Follow user
await api.user.followUser({ target_user_id: 'user-456' });
```

### 4. Book Exchange

```typescript
import { ExchangeStatus } from '../services';

// Create exchange
const exchange = await api.exchange.createExchange({
  owner_id: 'owner-id',
  requester_id: 'requester-id', 
  owner_book_ids: ['book-1'],
  requester_book_ids: ['book-2']
});

// Update status
await api.exchange.updateExchangeStatus(
  exchange.id,
  'owner-id',
  { status: ExchangeStatus.ACCEPTED }
);
```

## API Organization

The API is organized into logical domains:

### Authentication (`api.auth`)
- `signIn()` - User login
- `signUp()` - User registration

### User Management (`api.user`)
- `getUser()` - Get user by ID
- `updateUser()` - Update user profile
- `searchUsers()` - Search users by username
- `followUser()` / `unfollowUser()` - Social following
- `getFollowers()` / `getFollowing()` - Get social connections

### Book Management (`api.book`)
- `searchBooks()` - Search books by query
- `getBookByIsbn()` - Get book details by ISBN
- `getUserLibrary()` - Get user's book library
- `addBookToLibrary()` - Add book to library
- `updateBookStatus()` - Update reading status
- `toggleBookFavorite()` - Toggle favorite status

### Book Exchange (`api.exchange`)
- `createExchange()` - Create exchange request
- `getUserExchanges()` - Get user's exchanges
- `updateExchangeStatus()` - Accept/reject exchanges
- `createCounterOffer()` - Make counter offers

### Posts & Comments (`api.post`, `api.comment`)
- `getPosts()` - Get posts with filters
- `createPost()` - Create new post
- `createComment()` - Add comment to post
- `getCommentsByPostId()` - Get post comments

### Communities (`api.community`)
- `getAllCommunities()` - List all communities
- `createCommunity()` - Create new community
- `joinCommunity()` / `leaveCommunity()` - Community membership

### Reading Clubs (`api.readingClub`)
- `getAllReadingClubs()` - List reading clubs
- `createReadingClub()` - Create new reading club
- `joinReadingClub()` / `leaveReadingClub()` - Club membership

### Gamification (`api.gamification`)
- `getUserProfile()` - Get gamification profile
- `getUserAchievements()` - Get user achievements
- `checkAndAwardAchievements()` - Check for new achievements

## Error Handling

```typescript
import { ApiError } from '../services';

try {
  const user = await api.user.getUser('user-id');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
    // Handle specific status codes
    switch (error.status) {
      case 401: // Unauthorized
      case 404: // Not found
      case 500: // Server error
    }
  }
}
```

## Configuration

### Environment Variables

The API automatically switches between development and production URLs:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080'           // Development
  : 'https://your-production-api.com'; // Production
```

### Custom Configuration

To override the API base URL:

```typescript
// In your app initialization
import { setApiBaseUrl } from '../services/api';
setApiBaseUrl('https://custom-api-url.com');
```

## Storage Management

### Auth Token Persistence

```typescript
import { authStorage } from '../services';

// Tokens are automatically stored and retrieved
await authStorage.saveToken(token);
const token = await authStorage.getToken();
await authStorage.removeToken();
```

### User Data Persistence

```typescript
import { userStorage } from '../services';

await userStorage.saveUser(userData);
const user = await userStorage.getUser();
```

## Best Practices

### 1. Use the Auth Hook
Always use `useAuth()` for authentication state management:

```typescript
const { isAuthenticated, user, signIn } = useAuth();
```

### 2. Handle Loading States
API calls are async - always handle loading states:

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await api.post.createPost(postData);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Type Safety
Leverage the TypeScript types for better development experience:

```typescript
import { BookStatus, CreatePostDto } from '../services';

const postData: CreatePostDto = {
  body: 'My post content',
  community_id: 'community-123'
};
```

### 4. Error Boundaries
Implement error boundaries for API error handling at the component level.

## File Upload Support

The API service supports file uploads for posts and user profile images:

```typescript
// Create post with image
const formData = new FormData();
formData.append('image', imageFile);
const post = await api.post.createPost(postData, imageFile);

// Update user with profile image  
await api.user.updateUser(userData, profileImageFile);
```

## Development

### Adding New Endpoints

1. Add types to `../types/api.ts`
2. Add API methods to `api.ts`
3. Export from `index.ts`
4. Add usage examples to `examples.ts`
5. Update this README

### Testing

The service includes comprehensive TypeScript checking and ESLint validation:

```bash
npm run type-check  # TypeScript validation
npm run lint        # ESLint validation
```

## Migration Notes

If you have existing API calls in your app:

1. Replace direct fetch calls with the API service methods
2. Update imports to use the new service
3. Migrate authentication to use the `useAuth` hook
4. Update error handling to use `ApiError`

The service is designed to be a drop-in replacement while providing better type safety and developer experience.