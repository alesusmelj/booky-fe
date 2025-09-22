import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, colors, theme } from '../constants';
import BookImage from './BookImage';
import { getExchangeStatusColor } from '../utils/exchangeUtils';
import { UserAvatar } from './UserAvatar';

interface Book {
  title: string;
  author: string;
  image: string;
}

interface User {
  id?: string;
  name: string;
  role: string;
  avatar: string;
}

interface Offer {
  id: string;
  exchangeNumber: string;
  date: string;
  status: string;
  requester: User;
  requestedBooks: Book[];
  offeredBooks: Book[];
}

interface OfferCardProps {
  offer: Offer;
  currentUserId: string;
  currentUserImage?: string | null;
  onAccept?: () => void;
  onReject?: () => void;
  onCounterOffer?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onChat?: () => void;
}

export function OfferCard({ 
  offer, 
  currentUserId,
  currentUserImage,
  onAccept, 
  onReject, 
  onCounterOffer,
  onCancel,
  onComplete,
  onChat 
}: OfferCardProps) {
  const handleCounterOffer = () => {
    onCounterOffer?.();
  };

  const handleAccept = () => {
    onAccept?.();
  };

  const handleReject = () => {
    onReject?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleComplete = () => {
    onComplete?.();
  };

  const handleChat = () => {
    onChat?.();
  };

  // Determine user role and what buttons to show
  const isRequester = currentUserId === offer.requester.id;
  const isOwner = !isRequester;
  const status = offer.status;

  const renderActionButtons = () => {
    // If requester and status is PENDING - show Cancel
    if (isRequester && status === 'Pendiente') {
      return (
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleCancel}
          testID="cancel-button"
        >
          <Text style={styles.rejectText}>Cancelar</Text>
        </TouchableOpacity>
      );
    }

    // If owner and status is PENDING - show Accept, Reject, Counter Offer
    if (isOwner && status === 'Pendiente') {
      return (
        <>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            testID="accept-button"
          >
            <Text style={styles.acceptText}>Aceptar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.counterOfferButton]}
            onPress={handleCounterOffer}
            testID="counter-offer-button"
          >
            <Text style={styles.counterOfferText}>Contra Oferta</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
            testID="reject-button"
          >
            <Text style={styles.rejectText}>Rechazar</Text>
          </TouchableOpacity>
        </>
      );
    }

    // If status is ACCEPTED (either requester or owner) - show Complete
    if (status === 'Aceptado') {
      return (
        <>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleChat}
            testID="chat-button"
          >
            <MaterialIcons name="chat" size={14} color={colors.neutral.white} />
            <Text style={styles.acceptText}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleComplete}
            testID="complete-button"
          >
            <MaterialIcons name="check" size={14} color={colors.neutral.white} />
            <Text style={styles.acceptText}>Completar</Text>
          </TouchableOpacity>
        </>
      );
    }

    // Default case - show original buttons
    return (
      <>
        <TouchableOpacity
          style={[styles.actionButton, styles.counterOfferButton]}
          onPress={handleCounterOffer}
          testID="counter-offer-button"
        >
          <Text style={styles.counterOfferText}>Contra Oferta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
          testID="accept-button"
        >
          <Text style={styles.acceptText}>Aceptar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleReject}
          testID="reject-button"
        >
          <Text style={styles.rejectText}>Rechazar</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.exchangeInfo}>
          <MaterialIcons name="sync" size={16} color={colors.primary.main} />
          <Text style={styles.exchangeNumber}>{offer.exchangeNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getExchangeStatusColor(offer.status as any) }]}>
          <Text style={styles.statusText}>{offer.status}</Text>
        </View>
      </View>

      <Text style={styles.date}>{offer.date}</Text>

      <View style={styles.userSection}>
        <UserAvatar 
          imageUrl={offer.requester.avatar.startsWith('http') ? offer.requester.avatar : null}
          name={offer.requester.name}
          size="medium"
          backgroundColor={colors.primary.main}
          style={styles.avatarSpacing}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{offer.requester.name}</Text>
          <Text style={styles.userRole}>{offer.requester.role}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{strings.commerce.labels.requests}</Text>
      {offer.requestedBooks.map((book, index) => (
        <View key={index} style={styles.bookItem}>
          <BookImage 
            source={book.image} 
            containerStyle={styles.bookImageContainer}
            size="small"
          />
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
        <UserAvatar 
          imageUrl={currentUserImage}
          name={strings.commerce.labels.you}
          size="medium"
          backgroundColor={colors.status.success}
          style={styles.avatarSpacing}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{strings.commerce.labels.you}</Text>
          <Text style={styles.userRole}>{strings.commerce.labels.owner}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{offer.requester.name} {strings.commerce.labels.offers.toLowerCase()}</Text>
      {offer.offeredBooks.map((book, index) => (
        <View key={index} style={styles.bookItem}>
          <BookImage 
            source={book.image} 
            containerStyle={styles.bookImageContainer}
            size="small"
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{book.author}</Text>
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        {renderActionButtons()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  exchangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exchangeNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: colors.status.warning,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
    color: theme.text.secondary,
    marginBottom: 10,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.primary.light,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  youSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.neutral.gray50,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.neutral.gray400,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
  avatarSpacing: {
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
    fontSize: 11,
    fontWeight: '500',
    color: theme.text.secondary,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
    marginTop: 4,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.neutral.white,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    gap: 10,
  },
  bookImageContainer: {
    marginRight: 10,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 10,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 2,
    lineHeight: 16,
  },
  bookAuthor: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  exchangeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 3,
  },
  exchangeText: {
    fontSize: 10,
    color: colors.neutral.gray400,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
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
    fontSize: 12,
    fontWeight: '500',
  },
  acceptText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
  },
  rejectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  rejectText: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
});