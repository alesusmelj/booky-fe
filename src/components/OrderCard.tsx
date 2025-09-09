import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, colors, theme } from '../constants';

interface Book {
  title: string;
  author: string;
  image: string;
}

interface User {
  name: string;
  location?: string;
  avatar: string;
}

interface Order {
  id: number;
  exchangeNumber: string;
  date: string;
  status: 'PENDIENTE' | 'ACTIVO';
  requester: User;
  requestedBooks: Book[];
  offeredBooks: Book[];
}

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const handleChat = () => {
    // TODO: Open chat with user
  };

  const handleCancel = () => {
    // TODO: Cancel order
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.exchangeInfo}>
          <MaterialIcons name="sync" size={16} color={colors.primary.main} />
          <Text style={styles.exchangeNumber}>{order.exchangeNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.status.success }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <Text style={styles.date}>{order.date}</Text>

      <View style={styles.userSection}>
        <View style={[styles.avatar, { backgroundColor: colors.status.success }]}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{strings.commerce.labels.you}</Text>
          <Text style={styles.userRole}>{strings.commerce.labels.applicant}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{strings.commerce.labels.requests}</Text>
      {order.requestedBooks.map((book, index) => (
        <View key={index} style={styles.bookItem}>
          <View style={styles.bookImagePlaceholder} />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{book.author}</Text>
          </View>
        </View>
      ))}

      <View style={styles.exchangeIcon}>
        <MaterialIcons name="sync" size={16} color={colors.neutral.gray400} />
        <Text style={styles.exchangeText}>{strings.commerce.labels.exchange}</Text>
      </View>

      <View style={styles.otherUserSection}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {order.requester.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{order.requester.name}</Text>
          {order.requester.location && (
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={12} color={theme.text.secondary} />
              <Text style={styles.location}>{order.requester.location}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.sectionLabel}>{strings.commerce.labels.offers}</Text>
      {order.offeredBooks.map((book, index) => (
        <View key={index} style={styles.bookItem}>
          <View style={styles.bookImagePlaceholder} />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{book.author}</Text>
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleChat}
          testID="chat-button"
          accessible={true}
          accessibilityLabel={strings.commerce.actions.chat}
        >
          <MaterialIcons name="chat" size={16} color={colors.neutral.white} />
          <Text style={styles.chatText}>{strings.commerce.actions.chat}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          testID="cancel-button"
          accessible={true}
          accessibilityLabel={strings.commerce.actions.cancel}
        >
          <Text style={styles.cancelText}>{strings.commerce.actions.cancel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exchangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exchangeNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary.main,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  date: {
    fontSize: 12,
    color: theme.text.secondary,
    marginBottom: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.neutral.gray50,
    padding: 12,
    borderRadius: 8,
  },
  otherUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.primary.light,
    padding: 12,
    borderRadius: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  location: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.primary,
    marginBottom: 12,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookImagePlaceholder: {
    width: 40,
    height: 56,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.primary,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  exchangeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 4,
  },
  exchangeText: {
    fontSize: 12,
    color: colors.neutral.gray400,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  chatText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: theme.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});