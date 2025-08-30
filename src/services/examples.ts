/**
 * Example usage of the Booky API service
 * This file demonstrates how to use the various API endpoints
 */

import { api, ApiError } from './api';
import { useAuth } from '../hooks/useAuth';
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

    console.log('User signed in:', signInResponse.user);
    console.log('Auth token:', signInResponse.token);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message, error.status);
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

// Example: Book Management
export const exampleBookManagement = async () => {
  try {
    // Search for books
    const books = await api.book.searchBooks('Harry Potter');
    console.log('Found books:', books);

    // Add book to library
    if (books.length > 0 && books[0]) {
      const userBook = await api.book.addBookToLibrary({
        isbn: books[0].isbn,
        status: BookStatus.TO_READ,
      });
      console.log('Added book to library:', userBook);

      // Update book status
      const updatedBook = await api.book.updateBookStatus(userBook.id, {
        status: BookStatus.READING,
      });
      console.log('Updated book status:', updatedBook);

      // Toggle favorite
      const favoritedBook = await api.book.toggleBookFavorite(userBook.id);
      console.log('Favorited book:', favoritedBook);
    }

    // Get user library
    const library = await api.book.getUserLibrary('user-id', {
      status: BookStatus.READING,
      favorites: true,
    });
    console.log('User library:', library);
  } catch (error) {
    console.error('Book management error:', error);
  }
};

// Example: Social Features
export const exampleSocialFeatures = async () => {
  try {
    // Create a post
    const post = await api.post.createPost({
      body: 'Just finished reading an amazing book!',
      community_id: 'community-123',
    });
    console.log('Created post:', post);

    // Add a comment
    const comment = await api.comment.createComment({
      body: 'That sounds interesting! What book was it?',
      post_id: post.id,
    });
    console.log('Added comment:', comment);

    // Get posts from community
    const communityPosts = await api.post.getPosts({
      type: 'general',
      communityId: 'community-123',
    });
    console.log('Community posts:', communityPosts);

    // Follow a user
    await api.user.followUser({ target_user_id: 'user-456' });
    console.log('Followed user');
  } catch (error) {
    console.error('Social features error:', error);
  }
};

// Example: Book Exchange
export const exampleBookExchange = async () => {
  try {
    // Create an exchange request
    const exchange = await api.exchange.createExchange({
      owner_id: 'owner-user-id',
      requester_id: 'requester-user-id',
      owner_book_ids: ['book-1', 'book-2'],
      requester_book_ids: ['book-3'],
    });
    console.log('Created exchange:', exchange);

    // Update exchange status
    const updatedExchange = await api.exchange.updateExchangeStatus(
      exchange.id,
      'owner-user-id',
      { status: ExchangeStatus.ACCEPTED }
    );
    console.log('Updated exchange:', updatedExchange);

    // Get user exchanges
    const userExchanges = await api.exchange.getUserExchanges('user-id', {
      status: ExchangeStatus.PENDING,
    });
    console.log('User exchanges:', userExchanges);
  } catch (error) {
    console.error('Book exchange error:', error);
  }
};

// Example: Communities and Reading Clubs
export const exampleCommunities = async () => {
  try {
    // Create a community
    const community = await api.community.createCommunity({
      name: 'Fantasy Book Lovers',
      description: 'A community for fans of fantasy literature',
    });
    console.log('Created community:', community);

    // Join community
    await api.community.joinCommunity(community.id);
    console.log('Joined community');

    // Create a reading club
    const readingClub = await api.readingClub.createReadingClub({
      name: 'Harry Potter Book Club',
      description: 'Reading through the Harry Potter series together',
      community_id: community.id,
      book_id: 'harry-potter-book-id',
    });
    console.log('Created reading club:', readingClub);

    // Join reading club
    await api.readingClub.joinReadingClub(readingClub.id);
    console.log('Joined reading club');
  } catch (error) {
    console.error('Communities error:', error);
  }
};

// Example: Gamification
export const exampleGamification = async () => {
  try {
    // Get user gamification profile
    const profile = await api.gamification.getUserProfile('user-id');
    console.log('Gamification profile:', profile);

    // Check for new achievements
    const newAchievements = await api.gamification.checkAndAwardAchievements('user-id');
    console.log('New achievements:', newAchievements);

    // Get unnotified achievements
    const unnotified = await api.gamification.getUnnotifiedAchievements('user-id');
    console.log('Unnotified achievements:', unnotified);

    // Mark achievements as notified
    if (unnotified.length > 0) {
      const achievementIds = unnotified.map(a => a.id);
      await api.gamification.markAchievementsAsNotified('user-id', achievementIds);
      console.log('Marked achievements as notified');
    }

    // Get all available achievements
    const allAchievements = await api.gamification.getAllAchievements();
    console.log('All achievements:', allAchievements);
  } catch (error) {
    console.error('Gamification error:', error);
  }
};

// Example: Using the auth hook in a component
export const ExampleComponent = () => {
  const {
    isAuthenticated,
    isLoading,
    signIn,
  } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn({
        email: 'user@example.com',
        password: 'password123'
      });
      console.log('Sign in successful');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (isLoading) {
    return null; // Loading component
  }

  if (!isAuthenticated) {
    // Use handleSignIn in actual implementation
    console.log('Show login screen', handleSignIn);
    return null; // Login screen
  }

  return null; // Main app content
};

// Error handling example
export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        console.error('Unauthorized - please log in');
        // Redirect to login
        break;
      case 403:
        console.error('Forbidden - insufficient permissions');
        break;
      case 404:
        console.error('Not found');
        break;
      case 500:
        console.error('Server error - please try again later');
        break;
      default:
        console.error('API Error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
};