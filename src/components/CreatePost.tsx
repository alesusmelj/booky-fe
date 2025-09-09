import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { strings, colors } from '../constants';
import { logger } from '../utils/logger';

interface CreatePostProps {
  onPost?: (content: string, images?: string[]) => void;
  maxLength?: number;
  disabled?: boolean;
  showCharacterCount?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  onPost = () => {},
  maxLength = 280,
  disabled = false,
  showCharacterCount = false,
}) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const isPostDisabled = disabled || (postContent.trim().length === 0 && selectedImages.length === 0);

  const handlePost = () => {
    if (isPostDisabled) return;

    try {
      onPost(postContent.trim(), selectedImages);
      setPostContent('');
      setSelectedImages([]);
      logger.info('Post created successfully');
    } catch (error) {
      logger.error('Failed to create post:', error);
      Alert.alert('Error', strings.errors.postCreationFailed);
    }
  };

  const handleAddImage = () => {
    // TODO: Implement image picker functionality
    // This would typically use expo-image-picker
    Alert.alert(
      strings.createPost.imageUpcomingTitle,
      strings.createPost.imageUpcomingMessage
    );
    logger.info('Image upload feature not implemented yet');
  };

  const getUserAvatar = () => {
    if (user?.image) {
      return (
        <Image 
          source={{ uri: user.image }} 
          style={styles.avatar}
          testID="user-avatar"
        />
      );
    }

    return (
      <View style={styles.defaultAvatar} testID="default-avatar">
        <MaterialIcons name="person" size={24} color={colors.primary.main} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {getUserAvatar()}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={strings.createPost.placeholder}
            placeholderTextColor={colors.neutral.gray400}
            value={postContent}
            onChangeText={setPostContent}
            multiline
            maxLength={maxLength}
            editable={!disabled}
            testID="post-text-input"
            accessible={true}
            accessibilityLabel={strings.createPost.textInputAccessibility}
          />
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handleAddImage}
          activeOpacity={0.7}
          disabled={disabled}
          testID="add-image-button"
          accessible={true}
          accessibilityLabel={strings.createPost.addImageAccessibility}
        >
          <MaterialIcons 
            name="image" 
            size={24} 
            color={disabled ? colors.disabled.background : colors.primary.main} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.publishButton,
            isPostDisabled && styles.publishButtonDisabled,
          ]}
          onPress={handlePost}
          activeOpacity={0.7}
          disabled={isPostDisabled}
          testID="publish-button"
          accessible={true}
          accessibilityLabel={strings.createPost.publishAccessibility}
        >
          <Text 
            style={[
              styles.publishButtonText,
              isPostDisabled && styles.publishButtonTextDisabled,
            ]}
          >
            {strings.createPost.publishButton}
          </Text>
        </TouchableOpacity>
      </View>

      {showCharacterCount && (
        <View style={styles.characterCount}>
          <Text style={styles.characterCountText}>
            {postContent.length}/{maxLength}
          </Text>
        </View>
      )}
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
  mainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.gray100,
    marginRight: 12,
  },
  defaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    color: colors.neutral.gray800,
    minHeight: 48,
    maxHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageButton: {
    padding: 8,
    borderRadius: 8,
  },
  publishButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  publishButtonDisabled: {
    backgroundColor: colors.disabled.background,
    shadowOpacity: 0,
    elevation: 0,
  },
  publishButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  publishButtonTextDisabled: {
    color: colors.disabled.text,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: colors.neutral.gray400,
  },
});