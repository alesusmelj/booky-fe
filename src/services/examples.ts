/**
 * Example usage of the Booky API service
 * This file demonstrates how to use the various API endpoints
 */

/* eslint-disable no-unused-vars */

import { api, ApiError } from './api';
import { useAuth } from '../contexts/AuthContext';
import { BookStatus, ExchangeStatus } from '../types/api';

// Example: User Authentication
export const exampleAuth = async () => {
  try {
    // Sign up a new user
    await api.auth.signUp({
      username: 'johndoe',
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'securepassword123',
    });

    // Sign in
    const signInResponse = await api.auth.signIn({
      email: 'john@example.com',
      password: 'securepassword123',
    });
    
    return signInResponse;

  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API error
      throw error;
    } else {
      // Handle unexpected error
      throw error;
    }
  }
};

// Example: Book Management
export const exampleBookManagement = async () => {
  // Search for books
  const books = await api.book.searchBooks('Harry Potter');

  let updatedBook, favoritedBook;
  
  // Add book to library
  if (books.length > 0 && books[0]) {
    const userBook = await api.book.addBookToLibrary({
      isbn: books[0].isbn,
      status: BookStatus.TO_READ,
    });

    // Update book status
    updatedBook = await api.book.updateBookStatus(userBook.id, {
      status: BookStatus.READING,
    });

    // Toggle favorite
    favoritedBook = await api.book.toggleBookFavorite(userBook.id);
  }

  // Get user library
  const library = await api.book.getUserLibrary('user-id', {
    status: BookStatus.READING,
    favorites: true,
  });
  
  return { books, updatedBook, favoritedBook, library };
};

// Example: Social Features
export const exampleSocialFeatures = async () => {
  // Create a post
  const post = await api.post.createPost({
    body: 'Just finished reading an amazing book!',
    community_id: 'community-123',
  });

  // Add a comment
  const comment = await api.comment.createComment({
    body: 'That sounds interesting! What book was it?',
    post_id: post.id,
  });

  // Get posts from community
  const communityPosts = await api.post.getPosts({
    type: 'general',
    communityId: 'community-123',
  });

  // Follow a user
  await api.user.followUser({ target_user_id: 'user-456' });
  
  return { post, comment, communityPosts };
};

// Example: Book Exchange
export const exampleBookExchange = async () => {
  // Create an exchange request
  const exchange = await api.exchange.createExchange({
    owner_id: 'owner-user-id',
    requester_id: 'requester-user-id',
    owner_book_ids: ['book-1', 'book-2'],
    requester_book_ids: ['book-3'],
  });

  // Update exchange status
  const updatedExchange = await api.exchange.updateExchangeStatus(
    exchange.id,
    'owner-user-id',
    { status: ExchangeStatus.ACCEPTED }
  );

  // Get user exchanges
  const userExchanges = await api.exchange.getUserExchanges('user-id', {
    status: ExchangeStatus.PENDING,
  });
  
  return { exchange, updatedExchange, userExchanges };
};

// Example: Communities and Reading Clubs
export const exampleCommunities = async () => {
  // Create a community
  const community = await api.community.createCommunity({
    name: 'Fantasy Book Lovers',
    description: 'A community for fans of fantasy literature',
  });

  // Join community
  await api.community.joinCommunity(community.id);

  // Create a reading club
  const readingClub = await api.readingClub.createReadingClub({
    name: 'Harry Potter Book Club',
    description: 'Reading through the Harry Potter series together',
    community_id: community.id,
    book_id: 'harry-potter-book-id',
  });

  // Join reading club
  await api.readingClub.joinReadingClub(readingClub.id);
  
  return { community, readingClub };
};

// Example: Gamification
export const exampleGamification = async () => {
  // Get user gamification profile
  const profile = await api.gamification.getUserProfile('user-id');

  // Check for new achievements
  const newAchievements = await api.gamification.checkAndAwardAchievements('user-id');

  // Get unnotified achievements
  const unnotified = await api.gamification.getUnnotifiedAchievements('user-id');

  // Mark achievements as notified
  if (unnotified.length > 0) {
    const achievementIds = unnotified.map(a => a.id);
    await api.gamification.markAchievementsAsNotified('user-id', achievementIds);
  }

  // Get all available achievements
  const allAchievements = await api.gamification.getAllAchievements();
  
  return { profile, newAchievements, unnotified, allAchievements };
};

// Example: Using the auth hook in a component
export const ExampleComponent = () => {
  const {
    isAuthenticated,
    isLoading,
    signIn,
  } = useAuth();

  const handleSignIn = async () => {
    await signIn({
      email: 'user@example.com',
      password: 'password123'
    });
  };
  
  // Use the handler in real implementation
  void handleSignIn;

  if (isLoading) {
    return null; // Loading component
  }

  if (!isAuthenticated) {
    // Use handleSignIn in actual implementation
    return null; // Login screen
  }

  return null; // Main app content
};

// Error handling example
export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Redirect to login
        break;
      case 403:
        // Handle forbidden access
        break;
      case 404:
        // Handle not found
        break;
      case 500:
        // Handle server error
        break;
      default:
        // Handle other API errors
        break;
    }
  } else {
    // Handle non-API errors
    throw error;
  }
};