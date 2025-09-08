import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { PostBox } from '../components';
import { strings, colors } from '../constants';
import { logger } from '../utils/logger';

export const HomeScreen: React.FC = () => {
  const handleCreatePost = (_content: string, _images?: string[]) => {
    // TODO: Implement API call to create post
    logger.info('Post created successfully');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <PostBox 
        onPost={handleCreatePost}
        showCharacterCount={true}
        maxLength={280}
      />
      
      <View style={styles.feedContainer}>
        <Text style={styles.feedTitle}>{strings.home.feedTitle}</Text>
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
    padding: 16,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 16,
  },
  emptyFeed: {
    backgroundColor: colors.neutral.white,
    padding: 32,
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