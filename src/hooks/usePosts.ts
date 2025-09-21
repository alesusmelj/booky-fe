import { useState, useEffect, useCallback } from 'react';
import { PostsService } from '../services';
import { logger } from '../utils/logger';

interface PostsState {
  posts: any[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export const usePosts = (communityId?: string) => {
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

      // Add the new post to the beginning of the list
      setPosts(prev => [response.data, ...prev]);

      return true;
    } catch (error) {
      logger.error('❌ [usePosts] Error creating post:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create post'
      }));
      return false;
    }
  }, []);

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
    clearError,
  };
};
