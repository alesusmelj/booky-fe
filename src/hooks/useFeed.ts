import { useState, useEffect, useCallback } from 'react';
import { PostsService } from '../services';
import { PostDto } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface FeedState {
    posts: PostDto[];
    loading: boolean;
    refreshing: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
}

interface UseFeedOptions {
    pageSize?: number;
    enableMockData?: boolean;
}

export const useFeed = (options: UseFeedOptions = {}) => {
    const { pageSize = 10, enableMockData = false } = options;
    const { user } = useAuth();

    const [state, setState] = useState<FeedState>({
        posts: [],
        loading: true,
        refreshing: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        page: 1,
    });

    // Mock data for development
    const mockPosts: PostDto[] = [
        {
            id: '1',
            body: 'Acabo de terminar de leer "Cien años de soledad" de Gabriel García Márquez. ¡Qué obra maestra! La forma en que teje la realidad con la fantasía es simplemente increíble. ¿Alguien más ha leído este clásico?',
            date_created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
            user_id: 'user1',
            community_id: undefined,
            user: {
                id: 'user1',
                username: 'maria_reader',
                name: 'María',
                lastname: 'González',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            },
            community: undefined,
        },
        {
            id: '2',
            body: 'Visitando esta hermosa librería en el centro de la ciudad. ¡Tienen una sección increíble de literatura latinoamericana! 📚✨',
            date_created: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            user_id: 'user2',
            community_id: undefined,
            user: {
                id: 'user2',
                username: 'david_books',
                name: 'David',
                lastname: 'Kim',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            },
            community: undefined,
        },
        {
            id: '3',
            body: 'Recomendación del día: "El amor en los tiempos del cólera" también de García Márquez. Si te gustó Cien años de soledad, este te va a encantar. La prosa es poética y la historia de amor es conmovedora.',
            date_created: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            user_id: 'user3',
            community_id: undefined,
            user: {
                id: 'user3',
                username: 'ana_literatura',
                name: 'Ana',
                lastname: 'Martínez',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            },
            community: undefined,
        },
        {
            id: '4',
            body: '¿Alguien conoce algún club de lectura en la ciudad? Me encantaría unirme a uno para discutir libros con otros lectores apasionados como yo. 📖',
            date_created: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
            user_id: 'user4',
            community_id: undefined,
            user: {
                id: 'user4',
                username: 'carlos_reader',
                name: 'Carlos',
                lastname: 'López',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
            },
            community: undefined,
        },
        {
            id: '5',
            body: 'Intercambio disponible: Tengo "Don Quijote de la Mancha" en excelente estado. Busco algo de ciencia ficción o fantasía. ¡Envíenme sus propuestas!',
            date_created: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
            user_id: 'user5',
            community_id: undefined,
            user: {
                id: 'user5',
                username: 'lucia_exchange',
                name: 'Lucía',
                lastname: 'Fernández',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
            },
            community: undefined,
        },
    ];

    const fetchFeedPosts = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setState(prev => ({ ...prev, refreshing: true, error: null }));
            } else if (page === 1) {
                setState(prev => ({ ...prev, loading: true, error: null }));
            } else {
                setState(prev => ({ ...prev, loadingMore: true, error: null }));
            }

            logger.info(`🔄 Fetching feed posts - Page: ${page}, Refresh: ${isRefresh}`);

            if (enableMockData) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Simulate pagination with mock data
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedPosts = mockPosts.slice(startIndex, endIndex);

                logger.info(`📄 Mock data - Returning ${paginatedPosts.length} posts for page ${page}`);

                setState(prev => ({
                    ...prev,
                    posts: isRefresh || page === 1 ? paginatedPosts : [...prev.posts, ...paginatedPosts],
                    loading: false,
                    refreshing: false,
                    loadingMore: false,
                    hasMore: endIndex < mockPosts.length,
                    page: page,
                }));
            } else {
                // Real API call
                const response = await PostsService.getPosts({ type: 'feed' });
                const newPosts = response.data || [];

                logger.info(`📄 API data - Received ${newPosts.length} posts for page ${page}`);

                setState(prev => {
                    // Remove duplicates by creating a Map with post IDs as keys
                    const combinedPosts = isRefresh || page === 1
                        ? newPosts
                        : [...prev.posts, ...newPosts];

                    // Create a Map to remove duplicates based on post ID
                    const uniquePostsMap = new Map();
                    combinedPosts.forEach(post => {
                        if (post.id && !uniquePostsMap.has(post.id)) {
                            uniquePostsMap.set(post.id, post);
                        }
                    });

                    const uniquePosts = Array.from(uniquePostsMap.values());

                    logger.info(`📄 Processed posts - Combined: ${combinedPosts.length}, Unique: ${uniquePosts.length}, Duplicates removed: ${combinedPosts.length - uniquePosts.length}`);

                    return {
                        ...prev,
                        posts: uniquePosts,
                        loading: false,
                        refreshing: false,
                        loadingMore: false,
                        hasMore: newPosts.length >= pageSize, // Assume more data if we got a full page
                        page: page,
                    };
                });
            }
        } catch (error) {
            logger.error('❌ Error fetching feed posts:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';

            setState(prev => ({
                ...prev,
                loading: false,
                refreshing: false,
                loadingMore: false,
                error: errorMessage,
            }));
        }
    }, [pageSize, enableMockData]);

    const refreshFeed = useCallback(async () => {
        await fetchFeedPosts(1, true);
    }, [fetchFeedPosts]);

    const loadMorePosts = useCallback(async () => {
        if (state.loadingMore || !state.hasMore) {
            return;
        }

        const nextPage = state.page + 1;
        await fetchFeedPosts(nextPage, false);
    }, [state.loadingMore, state.hasMore, state.page, fetchFeedPosts]);

    const createPost = useCallback(async (postData: {
        body: string;
        community_id?: string;
    }, image?: File | string | null): Promise<boolean> => {
        try {
            logger.info('📝 Creating new post:', postData);

            if (enableMockData) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Create mock post
                const newPost: PostDto = {
                    id: `mock_${Date.now()}`,
                    body: postData.body,
                    date_created: new Date().toISOString(),
                    image: undefined,
                    user_id: 'current_user',
                    community_id: postData.community_id,
                    user: {
                        id: 'current_user',
                        username: 'tu_usuario',
                        name: 'Tu',
                        lastname: 'Nombre',
                        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
                    },
                    community: undefined,
                };

                setState(prev => ({
                    ...prev,
                    posts: [newPost, ...prev.posts],
                }));

                logger.info('✅ Mock post created successfully');
                return true;
            } else {
                // Real API call
                const response = await PostsService.createPost(postData, image);

                logger.info('📝 Adding post to state:', response.data);
                logger.info('📝 Post user in response:', response.data?.user);

                // Ensure the post has user information
                const newPost = {
                    ...response.data,
                    user: response.data.user || user // Use current user if backend doesn't return user info
                };

                logger.info('📝 [useFeed] Post user info after creation:', {
                    hasUserInResponse: !!response.data.user,
                    hasUserInContext: !!user,
                    finalUserInfo: newPost.user ? {
                        id: newPost.user.id,
                        name: newPost.user.name,
                        lastname: newPost.user.lastname
                    } : 'No user info'
                });

                setState(prev => ({
                    ...prev,
                    posts: [newPost, ...prev.posts],
                }));

                logger.info('✅ Post created successfully');
                return true;
            }
        } catch (error) {
            logger.error('❌ Error creating post:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create post';

            setState(prev => ({
                ...prev,
                error: errorMessage,
            }));

            return false;
        }
    }, [enableMockData, user]);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // Initial load
    useEffect(() => {
        fetchFeedPosts(1);
    }, [fetchFeedPosts]);

    return {
        posts: state.posts,
        loading: state.loading,
        refreshing: state.refreshing,
        loadingMore: state.loadingMore,
        error: state.error,
        hasMore: state.hasMore,
        refreshFeed,
        loadMorePosts,
        createPost,
        clearError,
    };
};
