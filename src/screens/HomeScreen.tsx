import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CreatePost, Post, PostData } from '../components';
import { strings, colors } from '../constants';
import { logger } from '../utils/logger';
import { useNavigation } from '../contexts/NavigationContext';

export const HomeScreen: React.FC = () => {
  const { navigate } = useNavigation();

  const handleCreatePost = (_content: string, _images?: File[]) => {
    // TODO: Implement API call to create post
    logger.info('Post created successfully');
  };

  const handleLike = (postId: string) => {
    // TODO: Implement like functionality
    logger.info('Post liked:', postId);
  };

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
    logger.info('Comment on post:', postId);
  };

  const handleUserPress = (userId: string) => {
    // TODO: Navigate to user profile
    logger.info('User profile pressed:', userId);
  };

  // Sample posts data - TODO: Replace with API data
  const samplePosts: PostData[] = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'David Kim',
      },
      content: 'Visiting this beautiful bookstore in Valencia today! Anyone want to meet up?',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      createdAt: '2025-09-08T10:00:00Z',
      likes: 42,
      comments: 5,
      isLiked: false,
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'María González',
      },
      content: 'Just finished reading "Cien años de soledad" - what an incredible journey! Gabriel García Márquez really knows how to weave magic into words. Highly recommend this masterpiece to anyone who loves Latin American literature.',
      createdAt: '2025-09-08T08:30:00Z',
      likes: 23,
      comments: 8,
      isLiked: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CreatePost 
        onPost={handleCreatePost}
        showCharacterCount={true}
        maxLength={280}
      />
      
      
      <View style={styles.feedContainer}>
        <Text style={styles.feedTitle}>{strings.home.feedTitle}</Text>
        
        {samplePosts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onUserPress={handleUserPress}
          />
        ))}
        
        <View style={styles.emptyFeed}>
          <Text style={styles.emptyFeedText}>
            {strings.home.emptyFeedMessage}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  feedContainer: {
    paddingHorizontal: 0,
    paddingTop: 16,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  emptyFeed: {
    backgroundColor: colors.neutral.white,
    padding: 32,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  emptyFeedText: {
    fontSize: 16,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
});