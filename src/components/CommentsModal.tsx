import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';

interface CommentsModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
  onCommentsCountChange?: (count: number) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ visible, postId, onClose, onCommentsCountChange }) => {
  const { user: currentUser } = useAuth();
  const { comments, loading, creating, fetchComments, createComment, deleteComment } = useComments(postId);
  const [commentText, setCommentText] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible, fetchComments]);

  useEffect(() => {
    if (onCommentsCountChange) {
      onCommentsCountChange(comments.length);
    }
  }, [comments.length, onCommentsCountChange]);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    const success = await createComment(commentText.trim());
    if (success) {
      setCommentText('');
    } else {
      Alert.alert('Error', 'No se pudo crear el comentario');
    }
  };

  const handleDelete = (commentId: string) => {
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que quieres eliminar este comentario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteComment(commentId);
            if (!success) {
              Alert.alert('Error', 'No se pudo eliminar el comentario');
            }
          },
        },
      ]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return commentDate.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: any }) => {
    const isOwnComment = currentUser?.id === item.user_id;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          {item.user?.image ? (
            <Image source={{ uri: item.user.image }} style={styles.commentAvatar} />
          ) : (
            <View style={styles.defaultCommentAvatar}>
              <MaterialIcons name="person" size={16} color={colors.primary.main} />
            </View>
          )}
          
          <View style={styles.commentInfo}>
            <View style={styles.commentUserRow}>
              <Text style={styles.commentUserName}>
                {item.user?.name} {item.user?.lastname}
              </Text>
              <Text style={styles.commentTime}>{formatTimeAgo(item.date_created)}</Text>
            </View>
            <Text style={styles.commentText}>{item.body}</Text>
          </View>

          {isOwnComment && (
            <TouchableOpacity
              style={styles.deleteCommentButton}
              onPress={() => handleDelete(item.id)}
            >
              <MaterialIcons name="delete-outline" size={18} color={colors.neutral.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.title}>Comentarios</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.neutral.gray900} />
            </TouchableOpacity>
          </View>

        {/* Comments List */}
        {loading && comments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="chat-bubble-outline" size={48} color={colors.neutral.gray300} />
                <Text style={styles.emptyText}>No hay comentarios aún</Text>
                <Text style={styles.emptySubtext}>Sé el primero en comentar</Text>
              </View>
            }
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un comentario..."
            placeholderTextColor={colors.neutral.gray400}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
            editable={!creating}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!commentText.trim() || creating) && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={!commentText.trim() || creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <MaterialIcons name="send" size={20} color={colors.neutral.white} />
            )}
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray900,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray500,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.neutral.gray400,
    marginTop: 4,
  },
  commentItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  commentHeader: {
    flexDirection: 'row',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  defaultCommentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: colors.neutral.gray400,
  },
  commentText: {
    fontSize: 14,
    color: colors.neutral.gray700,
    lineHeight: 20,
  },
  deleteCommentButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: colors.neutral.gray900,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral.gray300,
  },
});

