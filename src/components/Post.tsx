import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, colors, theme } from '../constants';
import { PostDto } from '../types/api';
import { logger } from '../utils/logger';

export interface PostData {
  id: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  content: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface PostProps {
  post: PostDto;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
}

export const Post: React.FC<PostProps> = ({
  post,
  onLike = () => {},
  onComment = () => {},
  onUserPress = () => {},
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const handleComment = () => {
    onComment(post.id);
  };

  const handleUserPress = () => {
    logger.info('🔵 Post handleUserPress called:', { 
      userId: post.user.id, 
      userName: post.user.name,
      onUserPressType: typeof onUserPress 
    });
    onUserPress(post.user.id);
  };

  const getUserAvatar = () => {
    if (post.user.image) {
      return (
        <Image 
          source={{ uri: post.user.image }} 
          style={styles.avatar}
          testID="post-user-avatar"
        />
      );
    }

    return (
      <View style={styles.defaultAvatar} testID="post-default-avatar">
        <MaterialIcons name="person" size={20} color={colors.primary.main} />
      </View>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return postDate.toLocaleDateString();
  };

  const getFullName = () => {
    return `${post.user.name} ${post.user.lastname}`.trim();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={handleUserPress}
          activeOpacity={0.7}
          testID="post-user-button"
          accessible={true}
          accessibilityLabel={strings.post.userProfileAccessibility}
        >
          {getUserAvatar()}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{getFullName()}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.date_created)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>{post.body}</Text>
        
        {post.image && (
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            resizeMode="cover"
            testID="post-image"
            accessible={true}
            accessibilityLabel={strings.post.postImageAccessibility}
          />
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}
          testID="post-like-button"
          accessible={true}
          accessibilityLabel={strings.post.likeAccessibility}
        >
          <MaterialIcons 
            name={isLiked ? "favorite" : "favorite-border"} 
            size={20} 
            color={isLiked ? colors.status.error : colors.neutral.gray500} 
          />
          <Text style={[
            styles.actionText,
            isLiked && styles.actionTextActive
          ]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
          activeOpacity={0.7}
          testID="post-comment-button"
          accessible={true}
          accessibilityLabel={strings.post.commentAccessibility}
        >
          <MaterialIcons 
            name="chat-bubble-outline" 
            size={20} 
            color={colors.neutral.gray500} 
          />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background.primary,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray100,
    marginRight: 12,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '400',
  },
  content: {
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: theme.text.primary,
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.neutral.gray100,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: 14,
    color: colors.neutral.gray500,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionTextActive: {
    color: colors.status.error,
  },
});