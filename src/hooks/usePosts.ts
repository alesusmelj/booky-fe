import { useState, useEffect, useCallback } from 'react';
import { PostsService } from '../services';

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
      
      const response = communityId 
        ? await PostsService.getPostsByCommunity(communityId)
        : await PostsService.getPosts();
      
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
      console.error('Error refreshing posts:', error);
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
  }, image?: File | null): Promise<boolean> => {
    try {
      const response = await PostsService.createPost(postData, image);
      
      // Add the new post to the beginning of the list
      setPosts(prev => [response.data, ...prev]);
      
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
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
      console.error('Error deleting post:', error);
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
