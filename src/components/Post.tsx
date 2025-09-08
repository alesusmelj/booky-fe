import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, colors } from '../constants';

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
  post: PostData;
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
  const handleLike = () => {
    onLike(post.id);
  };

  const handleComment = () => {
    onComment(post.id);
  };

  const handleUserPress = () => {
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
          <Text style={styles.userName}>{post.user.name}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>{post.content}</Text>
        
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
            name={post.isLiked ? "favorite" : "favorite-border"} 
            size={20} 
            color={post.isLiked ? colors.status.error : colors.neutral.gray500} 
          />
          <Text style={[
            styles.actionText,
            post.isLiked && styles.actionTextActive
          ]}>
            {post.likes}
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
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
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
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray800,
  },
  content: {
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: colors.neutral.gray800,
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
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
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