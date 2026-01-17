import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { colors } from '../constants';
import { UserBookDto } from '../services/booksService';
import { ensureHttps } from '../utils';

interface BookCardProps {
  book: UserBookDto;
  onPress?: () => void;
  onFavoritePress?: () => void;
  onExchangePress?: () => void;
  onStatusPress?: () => void;
  onStatusChange?: (newStatus: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ') => void;
  compact?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

export const UserLibraryBookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onFavoritePress,
  onExchangePress,
  onStatusPress,
  onStatusChange,
  compact = false,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const renderBookCover = () => {
    if (book.book?.image && !imageError) {
      return (
        <Image
          source={{ uri: ensureHttps(book.book.image) }}
          style={compact ? styles.compactImage : styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <View style={[
        compact ? styles.compactImage : styles.image,
        styles.placeholderContainer
      ]}>
        <MaterialIcons
          name="menu-book"
          size={compact ? 24 : 48}
          color={colors.primary.main}
          style={{ opacity: 0.5 }}
        />
      </View>
    );
  };

  const statusOptions = [
    { value: 'WISHLIST' as const, label: 'Lista de Deseos', color: colors.status.warning, icon: 'star', iconFamily: 'Feather' as const },
    { value: 'TO_READ' as const, label: 'Por Leer', color: colors.neutral.gray500, icon: 'bookmark', iconFamily: 'Feather' as const },
    { value: 'READING' as const, label: 'Leyendo', color: colors.primary.main, icon: 'book-open', iconFamily: 'Feather' as const },
    { value: 'READ' as const, label: 'Leído', color: colors.green[600], icon: 'check-circle', iconFamily: 'MaterialIcons' as const },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READING':
        return colors.primary.main;
      case 'READ':
        return colors.green[600];
      case 'read':
        return colors.green[600];
      case 'TO_READ':
        return colors.neutral.gray500;
      case 'WISHLIST':
        return colors.status.warning;
      default:
        return colors.neutral.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READING':
        return 'Leyendo';
      case 'READ':
        return 'Leído';
      case 'read':
        return 'Leído';
      case 'TO_READ':
        return 'Por Leer';
      case 'WISHLIST':
        return 'Lista de Deseos';
      default:
        return status;
    }
  };

  const handleStatusPress = () => {
    if (onStatusChange) {
      setShowStatusModal(true);
    } else if (onStatusPress) {
      onStatusPress();
    }
  };

  const handleStatusSelect = (newStatus: 'WISHLIST' | 'READING' | 'TO_READ' | 'READ') => {
    setShowStatusModal(false);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  if (compact) {
    return (
      <View style={styles.compactCard}>
        {renderBookCover()}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {book.book?.title || 'Unknown Title'}
          </Text>
          <Text style={styles.compactAuthor} numberOfLines={1}>
            {book.book?.author || 'Unknown Author'}
          </Text>
          <View style={styles.compactMeta}>
            {(onStatusChange || onStatusPress) ? (
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) }]}
                onPress={handleStatusPress}
              >
                <Text style={styles.statusText}>{getStatusText(book.status)}</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) }]}>
                <Text style={styles.statusText}>{getStatusText(book.status)}</Text>
              </View>
            )}
            {book.favorite && (
              <MaterialIcons name="favorite" size={16} color={colors.status.error} />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {renderBookCover()}
        {onFavoritePress ? (
          <TouchableOpacity
            style={styles.favoriteIndicator}
            onPress={onFavoritePress}
          >
            <MaterialIcons
              name={book.favorite ? "favorite" : "favorite-border"}
              size={20}
              color={book.favorite ? colors.status.error : colors.neutral.white}
              style={styles.heartIcon}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.favoriteIndicator}>
            <MaterialIcons
              name={book.favorite ? "favorite" : "favorite-border"}
              size={20}
              color={book.favorite ? colors.status.error : colors.neutral.white}
              style={styles.heartIcon}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {book.book?.title || 'Unknown Title'}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.book?.author || 'Unknown Author'}
        </Text>


        {(onStatusChange || onStatusPress) ? (
          <TouchableOpacity
            style={[styles.statusBadge, styles.statusBadgeLarge, { backgroundColor: getStatusColor(book.status) }]}
            onPress={handleStatusPress}
          >
            <Text style={[styles.statusText, styles.statusTextLarge]}>{getStatusText(book.status)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.statusBadge, styles.statusBadgeLarge, { backgroundColor: getStatusColor(book.status) }]}>
            <Text style={[styles.statusText, styles.statusTextLarge]}>{getStatusText(book.status)}</Text>
          </View>
        )}
      </View>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Estado</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  book.status === option.value && styles.statusOptionActive
                ]}
                onPress={() => handleStatusSelect(option.value)}
              >
                <View style={[styles.statusOptionColor, { backgroundColor: option.color }]} />
                {option.iconFamily === 'MaterialIcons' ? (
                  <MaterialIcons
                    name={option.icon as any}
                    size={16}
                    color={book.status === option.value ? colors.primary.main : colors.neutral.gray600}
                  />
                ) : (
                  <Feather
                    name={option.icon as any}
                    size={16}
                    color={book.status === option.value ? colors.primary.main : colors.neutral.gray600}
                  />
                )}
                <Text style={[
                  styles.statusOptionText,
                  book.status === option.value && styles.statusOptionTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compactCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: cardWidth - 24,
    height: (cardWidth - 24) * 1.5,
    borderRadius: 8,
  },
  compactImage: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 12,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 6,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  heartIcon: {
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
  },
  compactContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: colors.neutral.gray600,
    marginBottom: 8,
  },
  compactAuthor: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  statusTextLarge: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    minWidth: 250,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.gray800,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  statusOptionActive: {
    backgroundColor: colors.primary.light,
  },
  statusOptionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  statusOptionTextActive: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  placeholderContainer: {
    backgroundColor: colors.primary.light + '40', // 25% opacity
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
});

export default UserLibraryBookCard;