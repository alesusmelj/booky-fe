import { useState, useEffect, useCallback } from 'react';
import { PostsService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface PostsState {
  posts: any[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export const usePosts = (communityId?: string) => {
  const { user } = useAuth();
  const [state, setState] = useState<PostsState>({
    posts: [],
    loading: true,
    error: null,
    refreshing: false,
  });

  const setPosts = (postsOrUpdater: any[] | ((prev: any[]) => any[])) => {
    setState(prev => ({
      ...prev,
      posts: typeof postsOrUpdater === 'function'
        ? postsOrUpdater(prev.posts)
        : postsOrUpdater
    }));
  };

  const fetchPosts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      logger.info('📄 [usePosts] Fetching posts:', { communityId });

      const response = communityId
        ? await PostsService.getPostsByCommunity(communityId)
        : await PostsService.getPosts();

      logger.info('📄 [usePosts] Posts fetched:', {
        count: response.data?.length || 0,
        communityId,
        firstPost: response.data?.[0] ? {
          id: response.data[0].id,
          hasUser: !!response.data[0].user,
          hasBody: !!response.data[0].body,
          userPreview: response.data[0].user ? {
            id: response.data[0].user.id,
            name: response.data[0].user.name
          } : 'No user data'
        } : 'No posts'
      });

      setPosts(response.data || []);
    } catch (error) {
      logger.error('❌ [usePosts] Error fetching posts:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch posts'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [communityId]);

  const refresh = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: null }));

      const response = communityId
        ? await PostsService.getPostsByCommunity(communityId)
        : await PostsService.getPosts();

      setPosts(response.data || []);
    } catch (error) {
      logger.error('Error refreshing posts:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh posts'
      }));
    } finally {
      setState(prev => ({ ...prev, refreshing: false }));
    }
  }, [communityId]);

  const createPost = useCallback(async (postData: {
    body: string;
    community_id?: string;
  }, image?: File | string | null): Promise<boolean> => {
    try {
      logger.info('📝 [usePosts] Creating post:', {
        body: postData.body.substring(0, 50) + '...',
        community_id: postData.community_id,
        hasImage: !!image
      });

      const response = await PostsService.createPost(postData, image);

      logger.info('✅ [usePosts] Post created successfully, adding to list');

      // Ensure the post has user information
      const newPost = {
        ...response.data,
        user: response.data.user || user // Use current user if backend doesn't return user info
      };

      logger.info('📝 [usePosts] Post user info after creation:', {
        hasUserInResponse: !!response.data.user,
        hasUserInContext: !!user,
        finalUserInfo: newPost.user ? {
          id: newPost.user.id,
          name: newPost.user.name,
          lastname: newPost.user.lastname
        } : 'No user info'
      });

      // Add the new post to the beginning of the list
      setPosts(prev => [newPost, ...prev]);

      return true;
    } catch (error) {
      logger.error('❌ [usePosts] Error creating post:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create post'
      }));
      return false;
    }
  }, [user]);

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      await PostsService.deletePost(postId);

      // Remove the post from the list
      setPosts(prev => prev.filter(post => post.id !== postId));

      return true;
    } catch (error) {
      logger.error('Error deleting post:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete post'
      }));
      return false;
    }
  }, []);

  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    try {
      logger.info('❤️ [usePosts] Toggling like for post:', postId);

      // Call the API
      await PostsService.toggleLike(postId);

      logger.info('✅ [usePosts] Like toggled successfully, refreshing posts');

      // Refresh posts to get updated data
      await fetchPosts();
    } catch (error) {
      logger.error('❌ [usePosts] Error toggling like:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to toggle like'
      }));
    }
  }, [fetchPosts]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts: state.posts,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    fetchPosts,
    refresh,
    createPost,
    deletePost,
    toggleLike,
    clearError,
  };
};
