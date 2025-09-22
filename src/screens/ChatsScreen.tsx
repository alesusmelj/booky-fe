import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';
import { useChats } from '../hooks';
import { ChatWithMetadata } from '../types/api';
import { useNavigation } from '../contexts/NavigationContext';
import { logger } from '../utils/logger';

export const ChatsScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const { chats, loading, error, refreshing, refresh } = useChats(true); // Enable polling for ChatsScreen

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Ahora' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Ayer';
      if (diffInDays < 7) return `${diffInDays}d`;
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const handleChatPress = (chat: ChatWithMetadata) => {
    logger.info('💬 [ChatsScreen] Opening chat:', { 
      chatId: chat.id, 
      otherUser: chat.other_user.name 
    });
    navigate('ChatDetail', { chatId: chat.id, otherUser: chat.other_user });
  };

  const renderChatItem = ({ item: chat }: { item: ChatWithMetadata }) => {
    const hasUnreadMessages = (chat.unread_count || 0) > 0;
    const lastMessageTime = chat.last_message_date || chat.date_created;

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          hasUnreadMessages && styles.chatItemUnread
        ]}
        onPress={() => handleChatPress(chat)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {chat.other_user.image ? (
            <Image
              source={{ uri: chat.other_user.image }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {chat.other_user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {hasUnreadMessages && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[
              styles.userName,
              hasUnreadMessages && styles.userNameUnread
            ]}>
              {chat.other_user.name} {chat.other_user.lastname}
            </Text>
            <Text style={styles.timeText}>
              {formatLastMessageTime(lastMessageTime)}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text 
              style={[
                styles.lastMessage,
                hasUnreadMessages && styles.lastMessageUnread
              ]}
              numberOfLines={1}
            >
              {chat.last_message?.content || 'Nuevo chat'}
            </Text>
            {hasUnreadMessages && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {chat.unread_count! > 99 ? '99+' : chat.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="chat-bubble-outline" size={64} color={colors.neutral.gray300} />
      <Text style={styles.emptyTitle}>No hay chats</Text>
      <Text style={styles.emptySubtitle}>
        Inicia una conversación desde el perfil de otro usuario
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="error-outline" size={64} color={colors.status.error} />
      <Text style={styles.emptyTitle}>Error al cargar chats</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && chats.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Cargando chats...</Text>
      </View>
    );
  }

  if (error && chats.length === 0) {
    return (
      <View style={styles.container}>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={chats.length === 0 ? styles.emptyListContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.gray500,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  chatItemUnread: {
    backgroundColor: colors.primary.light + '10',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.neutral.gray100,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.status.success,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    flex: 1,
  },
  userNameUnread: {
    fontWeight: '700',
    color: colors.neutral.black,
  },
  timeText: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.neutral.gray600,
    flex: 1,
  },
  lastMessageUnread: {
    fontWeight: '500',
    color: colors.neutral.gray800,
  },
  unreadBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.neutral.white,
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
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});
