import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem
} from 'react-native';
import { CreatePost, Post } from '../components';
import { strings, colors, theme } from '../constants';
import { logger } from '../utils/logger';
import { useNavigation } from '../contexts/NavigationContext';
import { useFeed } from '../hooks/useFeed';
import { PostDto } from '../types/api';
import { useAlert } from '../contexts/AlertContext';

export const HomeScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const { showAlert } = useAlert();
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    refreshFeed,
    loadMorePosts,
    createPost,
    deletePost,
    toggleLike,
    clearError
  } = useFeed({ enableMockData: false });

  const handleCreatePost = async (content: string, images?: string[]) => {
    try {
      logger.info('📝 Creating new post:', content);
      logger.info('📝 Images provided:', images);

      // Get the first image URI if provided (backend supports single image for now)
      const imageUri = images && images.length > 0 ? images[0] : null;

      const success = await createPost({
        body: content
      }, imageUri);

      if (!success) {
        showAlert({ title: 'Error', message: 'No se pudo crear el post. Intenta de nuevo.' });
      }
    } catch (err) {
      logger.error('❌ Error creating post:', err);
      showAlert({ title: 'Error', message: 'No se pudo crear el post. Intenta de nuevo.' });
    }
  };

  const handleLike = async (postId: string) => {
    logger.info('❤️ Post liked:', postId);
    try {
      await toggleLike(postId);
    } catch (error) {
      logger.error('❌ Error toggling like:', error);
      showAlert({ title: 'Error', message: 'No se pudo dar/quitar like. Intenta de nuevo.' });
    }
  };

  const handleComment = (postId: string) => {
    logger.info('💬 Comment on post:', postId);
    // TODO: Implement comment functionality
  };

  const handleUserPress = (userId: string) => {
    logger.info('👤 User profile pressed:', { userId, navigateFunction: typeof navigate });
    try {
      navigate('profile', { userId });
      logger.info('✅ Navigation to profile initiated successfully');
    } catch (error) {
      logger.error('❌ Error navigating to profile:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    const success = await deletePost(postId);
    if (!success) {
      showAlert({ title: 'Error', message: 'No se pudo eliminar la publicación. Intenta de nuevo.' });
    }
  };

  const renderPost: ListRenderItem<PostDto> = ({ item }) => (
    <Post
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onUserPress={handleUserPress}
      onDelete={handleDelete}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <CreatePost
        onPost={handleCreatePost}
        showCharacterCount={true}
        maxLength={280}
      />
      <Text style={styles.feedTitle}>{strings.home.feedTitle}</Text>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <>
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={colors.primary.main} />
            <Text style={styles.loadingMoreText}>Cargando más posts...</Text>
          </View>
          <View style={styles.footerSpacer} />
        </>
      );
    }

    if (!hasMore && posts.length > 0) {
      return (
        <>
          <View style={styles.endOfFeed}>
            <Text style={styles.endOfFeedText}>¡Has visto todos los posts!</Text>
          </View>
          <View style={styles.footerSpacer} />
        </>
      );
    }

    // Siempre retornar un espaciador para separar del navbar
    return <View style={styles.footerSpacer} />;
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Cargando tu feed...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
          <Text style={styles.errorSubtext}>
            Desliza hacia abajo para intentar de nuevo
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyFeed}>
        <Text style={styles.emptyFeedText}>
          No hay posts en tu feed aún
        </Text>
        <Text style={styles.emptyFeedSubtext}>
          Sigue a otros usuarios o únete a comunidades para ver contenido aquí
        </Text>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMorePosts();
    }
  };

  const handleRefresh = () => {
    if (error) {
      clearError();
    }
    refreshFeed();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => item.id ? `post-${item.id}` : `post-index-${index}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  emptyContainer: {
    flex: 1,
  },
  contentContainer: {
    marginBottom: 32,
  },
  headerContainer: {
    backgroundColor: colors.neutral.gray50,
    paddingBottom: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: theme.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  emptyFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
    padding: 32,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyFeedText: {
    fontSize: 16,
    color: theme.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyFeedSubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontSize: 14,
    color: theme.text.secondary,
    marginLeft: 8,
  },
  endOfFeed: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endOfFeedText: {
    fontSize: 14,
    color: theme.text.secondary,
    fontStyle: 'italic',
  },
  footerSpacer: {
    height: 32,
  },
});