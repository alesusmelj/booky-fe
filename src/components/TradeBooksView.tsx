import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OfferCard } from './OfferCard';
import { OrderCard } from './OrderCard';
import CreateExchangeModal from './CreateExchangeModal';
import { CreateRatingModal } from './CreateRatingModal';
import { strings, colors, theme } from '../constants';
import { useExchanges } from '../hooks';
import { useChats } from '../hooks/useChats';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { getExchangeStatusInSpanish } from '../utils';
import { logger } from '../utils/logger';
import React, { useState } from 'react';

// Component uses real API data via useExchanges hook

export function TradeBooksView() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { createOrGetChat } = useChats();
  const { 
    receivedOffers, 
    activeOrders, 
    loading, 
    error, 
    updateExchangeStatus,
    loadExchanges 
  } = useExchanges();

  // Log exchanges being rendered
  React.useEffect(() => {
    logger.info('🎨 [TradeBooksView] Rendering exchanges:', {
      received_offers_count: receivedOffers.length,
      active_orders_count: activeOrders.length,
      received_offers: receivedOffers.map(ex => ({
        id: ex.id,
        status: ex.status,
        requester: ex.requester ? `${ex.requester.name} ${ex.requester.lastname}` : 'Unknown'
      })),
      active_orders: activeOrders.map(ex => ({
        id: ex.id,
        status: ex.status,
        owner: ex.owner ? `${ex.owner.name} ${ex.owner.lastname}` : 'Unknown'
      }))
    });
  }, [receivedOffers, activeOrders]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<any>(null);

  const handleNewExchange = () => {
    setShowCreateModal(true);
  };

  const handleExchangeCreated = (exchange: any) => {
    // Refresh the exchanges list
    loadExchanges();
  };

  const handleAcceptOffer = async (exchangeId: string) => {
    try {
      await updateExchangeStatus(exchangeId, 'ACCEPTED');
    } catch (err) {
      // Error is handled by the useExchanges hook
    }
  };

  const handleRejectOffer = async (exchangeId: string) => {
    try {
      await updateExchangeStatus(exchangeId, 'REJECTED');
    } catch (err) {
      // Error is handled by the useExchanges hook
    }
  };

  const handleCompleteOrder = async (exchangeId: string) => {
    try {
      await updateExchangeStatus(exchangeId, 'COMPLETED');
    } catch (err) {
      // Error is handled by the useExchanges hook
    }
  };

  const handleCancelOrder = async (exchangeId: string) => {
    try {
      await updateExchangeStatus(exchangeId, 'CANCELLED');
    } catch (err) {
      // Error is handled by the useExchanges hook
    }
  };

  const handleCounterOffer = (exchangeId: string) => {
    // TODO: Implement counter offer logic
    // This would typically open a modal for creating a counter offer
    // For now, we'll just show an alert
    alert(`Counter offer functionality for exchange ${exchangeId} will be implemented soon`);
  };

  const handleRate = (exchange: any) => {
    setSelectedExchange(exchange);
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    // Refresh exchanges after rating
    loadExchanges();
  };

  const handleChat = async (exchangeId: string, otherUserId: string) => {
    if (!user?.id || !otherUserId) {
      Alert.alert('Error', 'No se pudo iniciar el chat');
      return;
    }

    try {
      logger.info('💬 [TradeBooksView] Starting chat for exchange:', { exchangeId, otherUserId });
      const chat = await createOrGetChat(otherUserId);
      
      if (chat) {
        logger.info('💬 [TradeBooksView] Chat created/retrieved, navigating to chat detail:', { 
          chatId: chat.id,
          otherUser: chat.other_user.name 
        });
        navigate('ChatDetail', { 
          chatId: chat.id, 
          otherUser: chat.other_user 
        });
      } else {
        Alert.alert('Error', 'No se pudo iniciar el chat');
      }
    } catch (error) {
      logger.error('❌ [TradeBooksView] Error starting chat:', error);
      Alert.alert('Error', 'No se pudo iniciar el chat');
    }
  };

  if (loading && receivedOffers.length === 0 && activeOrders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading exchanges...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.newExchangeButton}
        onPress={handleNewExchange}
        testID="new-exchange-button"
        accessible={true}
        accessibilityLabel={strings.commerce.actions.newExchange}
      >
        <MaterialIcons name="sync" size={20} color={colors.neutral.white} />
        <Text style={styles.newExchangeButtonText}>
          {strings.commerce.actions.newExchange}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={24} color={colors.error.main} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadExchanges} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.commerce.sections.receivedOffers}</Text>
        {receivedOffers.length > 0 ? (
          receivedOffers.map((exchange) => (
                <OfferCard 
                  key={exchange.id}
                  currentUserId={user?.id || ''}
                  currentUserImage={user?.image}
                  offer={{
                id: exchange.id,
                exchangeNumber: `Exchange #${exchange.id.slice(-4)}`,
                date: new Date(exchange.date_created).toLocaleDateString(),
                status: getExchangeStatusInSpanish(exchange.status) as any,
                requester: {
                  id: exchange.requester?.id,
                  name: exchange.requester 
                    ? `${exchange.requester.name} ${exchange.requester.lastname}` 
                    : 'Usuario no disponible',
                  role: 'Solicitante',
                  avatar: exchange.requester?.image || (exchange.requester?.name?.charAt(0) || 'U'),
                },
                requestedBooks: (exchange.owner_books || []).map(ub => ({
                  title: ub?.book?.title || 'Título no disponible',
                  author: ub?.book?.author || 'Autor no disponible',
                  image: ub?.book?.image || '/default-book.jpg',
                })),
                offeredBooks: (exchange.requester_books || []).map(ub => ({
                  title: ub?.book?.title || 'Título no disponible',
                  author: ub?.book?.author || 'Autor no disponible',
                  image: ub?.book?.image || '/default-book.jpg',
                })),
                canRate: exchange.can_rate,
                hasUserRated: !!exchange.owner_rate, // Current user is owner, so check owner_rate
              }}
              onAccept={() => handleAcceptOffer(exchange.id)}
              onReject={() => handleRejectOffer(exchange.id)}
              onChat={() => handleChat(exchange.id, exchange.requester?.id == user?.id ? exchange.owner?.id : exchange.requester?.id)}
              onCancel={() => handleCancelOrder(exchange.id)}
              onComplete={() => handleCompleteOrder(exchange.id)}
              onCounterOffer={() => handleCounterOffer(exchange.id)}
              onRate={() => handleRate(exchange)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No received offers</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.commerce.sections.activeOrders}</Text>
        {activeOrders.length > 0 ? (
          activeOrders.map((exchange) => (
                <OrderCard 
                  key={exchange.id}
                  currentUserId={user?.id || ''}
                  currentUserImage={user?.image}
                  order={{
                id: exchange.id,
                exchangeNumber: `Exchange #${exchange.id.slice(-4)}`,
                date: new Date(exchange.date_created).toLocaleDateString(),
                status: getExchangeStatusInSpanish(exchange.status) as any,
                requester: {
                  id: exchange.owner?.id,
                  name: exchange.owner 
                    ? `${exchange.owner.name} ${exchange.owner.lastname}` 
                    : 'Usuario no disponible',
                  location: (exchange.owner as any)?.address 
                    ? `${(exchange.owner as any).address.state}, ${(exchange.owner as any).address.country}`
                    : undefined,
                  avatar: exchange.owner?.image || '/default-avatar.jpg',
                },
                requestedBooks: (exchange.owner_books || []).map(ub => ({
                  title: ub?.book?.title || 'Título no disponible',
                  author: ub?.book?.author || 'Autor no disponible',
                  image: ub?.book?.image || '/default-book.jpg',
                })),
                offeredBooks: (exchange.requester_books || []).map(ub => ({
                  title: ub?.book?.title || 'Título no disponible',
                  author: ub?.book?.author || 'Autor no disponible',
                  image: ub?.book?.image || '/default-book.jpg',
                })),
                canRate: exchange.can_rate,
                hasUserRated: !!exchange.requester_rate, // Current user is requester, so check requester_rate
              }}
                  onAccept={() => handleAcceptOffer(exchange.id)}
                  onReject={() => handleRejectOffer(exchange.id)}
                  onCancel={() => handleCancelOrder(exchange.id)}
                  onComplete={() => handleCompleteOrder(exchange.id)}
                  onCounterOffer={() => handleCounterOffer(exchange.id)}
                  onChat={() => handleChat(exchange.id, exchange.requester?.id == user?.id ? exchange.owner?.id : exchange.requester?.id)}
                  onRate={() => handleRate(exchange)}
                  />
          ))
        ) : (
          <Text style={styles.emptyText}>No active orders</Text>
        )}
      </View>
    </ScrollView>

      <CreateExchangeModal
        isVisible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUserId={user?.id || ''}
        onSuccess={handleExchangeCreated}
      />

      {selectedExchange && (
        <CreateRatingModal
          isVisible={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedExchange(null);
          }}
          exchangeId={selectedExchange.id}
          otherUserName={
            selectedExchange.requester?.id === user?.id 
              ? `${selectedExchange.owner?.name} ${selectedExchange.owner?.lastname}`.trim()
              : `${selectedExchange.requester?.name} ${selectedExchange.requester?.lastname}`.trim()
          }
          onSuccess={handleRatingSuccess}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.text.secondary,
  },
  errorContainer: {
    backgroundColor: colors.error.light,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error.main,
  },
  retryButton: {
    backgroundColor: colors.error.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  newExchangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  newExchangeButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});