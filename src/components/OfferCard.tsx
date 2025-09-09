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
  role: string;
  avatar: string;
}

interface Offer {
  id: number;
  exchangeNumber: string;
  date: string;
  status: 'PENDIENTE' | 'ACTIVO';
  requester: User;
  requestedBooks: Book[];
  offeredBooks: Book[];
}

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const handleCounterOffer = () => {
    // TODO: Handle counter offer
  };

  const handleAccept = () => {
    // TODO: Handle accept offer
  };

  const handleReject = () => {
    // TODO: Handle reject offer
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.exchangeInfo}>
          <MaterialIcons name="sync" size={16} color={colors.primary.main} />
          <Text style={styles.exchangeNumber}>{offer.exchangeNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.status.warning }]}>
          <Text style={styles.statusText}>{offer.status}</Text>
        </View>
      </View>

      <Text style={styles.date}>{offer.date}</Text>

      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{offer.requester.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{offer.requester.name}</Text>
          <Text style={styles.userRole}>{offer.requester.role}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{strings.commerce.labels.requests}</Text>
      {offer.requestedBooks.map((book, index) => (
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

      <View style={styles.youSection}>
        <View style={[styles.avatar, { backgroundColor: colors.status.success }]}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{strings.commerce.labels.you}</Text>
          <Text style={styles.userRole}>{strings.commerce.labels.owner}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{offer.requester.name} {strings.commerce.labels.offers.toLowerCase()}</Text>
      {offer.offeredBooks.map((book, index) => (
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
          style={[styles.actionButton, styles.counterOfferButton]}
          onPress={handleCounterOffer}
          testID="counter-offer-button"
          accessible={true}
          accessibilityLabel={strings.commerce.actions.counterOffer}
        >
          <Text style={styles.counterOfferText}>{strings.commerce.actions.counterOffer}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
          testID="accept-button"
          accessible={true}
          accessibilityLabel={strings.commerce.actions.accept}
        >
          <Text style={styles.acceptText}>{strings.commerce.actions.accept}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleReject}
          testID="reject-button"
          accessible={true}
          accessibilityLabel={strings.commerce.actions.reject}
        >
          <Text style={styles.rejectText}>{strings.commerce.actions.reject}</Text>
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
    backgroundColor: colors.primary.light,
    padding: 12,
    borderRadius: 8,
  },
  youSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.neutral.gray50,
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
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  counterOfferButton: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  acceptButton: {
    backgroundColor: colors.status.success,
  },
  counterOfferText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  acceptText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '500',
  },
  rejectButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  rejectText: {
    color: theme.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});