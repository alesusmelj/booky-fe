import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants';
import { useMessages } from '../hooks';
import { MessageDto, UserPreviewDto } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { ImageViewer } from '../components/ImageViewer';

interface ChatDetailScreenProps {
  route: {
    params: {
      chatId: string;
      otherUser: UserPreviewDto;
    };
  };
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ route }) => {
  const { chatId, otherUser } = route.params;
  const { user: currentUser } = useAuth();
  const { messages, loading, error, sending, sendMessage, markAsRead } = useMessages(chatId);
  
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageUri, setViewerImageUri] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Mark messages as read when entering the chat
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return `Ayer ${date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedImage) {
      return;
    }

    const success = await sendMessage(messageText, selectedImage);
    if (success) {
      setMessageText('');
      setSelectedImage(null);
      // Scroll to bottom after sending message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleImagePress = (imageUri: string) => {
    setViewerImageUri(imageUri);
    setShowImageViewer(true);
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para seleccionar imágenes.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Allow any aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        logger.info('💬 [ChatDetail] Image selected for message:', { 
          uri: result.assets[0].uri.substring(0, 50) + '...' 
        });
      }
    } catch (error) {
      logger.error('❌ [ChatDetail] Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const renderMessage = ({ item: message }: { item: MessageDto }) => {
    const isOwnMessage = message.sender_id === currentUser?.id;
    const showAvatar = !isOwnMessage;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {showAvatar && (
          <View style={styles.messageAvatarContainer}>
            {message.sender.image ? (
              <Image
                source={{ uri: message.sender.image }}
                style={styles.messageAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultMessageAvatar}>
                <Text style={styles.messageAvatarText}>
                  {message.sender.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {message.image && (
            <TouchableOpacity
              onPress={() => handleImagePress(message.image!)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: message.image }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          
          {message.content && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {message.content}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatMessageTime(message.date_sent)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="chat-bubble-outline" size={64} color={colors.neutral.gray300} />
      <Text style={styles.emptyTitle}>Inicia la conversación</Text>
      <Text style={styles.emptySubtitle}>
        Envía un mensaje a {otherUser.name}
      </Text>
    </View>
  );

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando mensajes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.chatContainer, { marginBottom: keyboardHeight }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={messages.length === 0 ? styles.emptyListContainer : styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          style={styles.messagesContainer}
        />

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={removeSelectedImage}
            >
              <MaterialIcons name="close" size={20} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Message Input - Fixed at bottom */}
      <View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
        <TouchableOpacity 
          style={styles.imageButton}
          onPress={handleImagePicker}
          disabled={sending}
        >
          <MaterialIcons name="image" size={24} color={colors.primary.main} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.neutral.gray400}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          editable={!sending}
        />

        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!messageText.trim() && !selectedImage) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={sending || (!messageText.trim() && !selectedImage)}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.neutral.white} />
          ) : (
            <MaterialIcons name="send" size={20} color={colors.neutral.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={showImageViewer}
        imageUri={viewerImageUri}
        onClose={() => setShowImageViewer(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 80, // Space for input container
  },
  messagesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.gray500,
  },
  messagesList: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 2,
  },
  ownMessageBubble: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.neutral.white,
    borderBottomLeftRadius: 4,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.neutral.white,
  },
  otherMessageText: {
    color: colors.neutral.gray900,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: colors.neutral.white + 'CC',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: colors.neutral.gray500,
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 16,
    alignSelf: 'flex-end',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  imageButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: colors.neutral.gray900,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral.gray300,
  },
});
