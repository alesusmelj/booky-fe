import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OfferCard } from './OfferCard';
import { OrderCard } from './OrderCard';
import CreateExchangeModal from './CreateExchangeModal';
import { CounterOfferModal } from './CounterOfferModal';
import { CreateRatingModal } from './CreateRatingModal';
import { strings, colors, theme } from '../constants';
import { useExchanges } from '../hooks';
import { useChats } from '../hooks/useChats';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { getExchangeStatusInSpanish } from '../utils';
import { logger } from '../utils/logger';
import { exchangeService } from '../services/exchangeService';
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
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<any>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const handleNewExchange = () => {
    setShowCreateModal(true);
  };

  const handleExchangeCreated = (exchange: any) => {
    // Refresh the exchanges list
    loadExchanges();
  };

  // Filter exchanges by status
  const filterExchangesByStatus = (exchanges: any[]) => {
    if (selectedStatusFilter === 'all') {
      return exchanges;
    }
    return exchanges.filter(exchange => 
      getExchangeStatusInSpanish(exchange.status) === selectedStatusFilter
    );
  };

  const filteredReceivedOffers = filterExchangesByStatus(receivedOffers);
  const filteredActiveOrders = filterExchangesByStatus(activeOrders);

  const statusFilters = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendiente', value: strings.commerce.status.pending },
    { label: 'Aceptado', value: strings.commerce.status.accepted },
    { label: 'Completado', value: strings.commerce.status.completed },
    { label: 'Rechazado', value: strings.commerce.status.rejected },
    { label: 'Cancelado', value: strings.commerce.status.cancelled },
  ];

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
    const exchange = [...receivedOffers, ...activeOrders].find(ex => ex.id === exchangeId);
    if (exchange) {
      setSelectedExchange(exchange);
      setShowCounterOfferModal(true);
    }
  };

  const handleSubmitCounterOffer = async (
    exchangeId: string,
    ownerBookIds: string[],
    requesterBookIds: string[]
  ) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!selectedExchange) {
        throw new Error('Exchange not found');
      }

      // The userId param should be the owner of the exchange (who receives the counter-offer)
      const ownerUserId = selectedExchange.owner?.id || user.id;

      logger.info('📤 Submitting counter offer:', {
        exchangeId,
        ownerUserId,
        currentUserId: user.id,
        ownerBookIds,
        requesterBookIds,
        selectedExchange: {
          id: selectedExchange.id,
          ownerId: selectedExchange.owner?.id,
          requesterId: selectedExchange.requester?.id,
        }
      });

      await exchangeService.createCounterOffer(exchangeId, ownerUserId, {
        owner_book_ids: ownerBookIds,
        requester_book_ids: requesterBookIds,
      });

      Alert.alert('Éxito', 'Contraoferta enviada exitosamente');
      setShowCounterOfferModal(false);
      
      // Refresh exchanges
      await loadExchanges();
    } catch (error) {
      logger.error('❌ Error submitting counter offer:', error);
      throw error;
    }
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
        <Text style={styles.loadingText}>Cargando intercambios...</Text>
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

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Filtrar por estado:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedStatusFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatusFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatusFilter === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {strings.commerce.sections.receivedOffers} ({filteredReceivedOffers.length})
        </Text>
        {filteredReceivedOffers.length > 0 ? (
          filteredReceivedOffers.map((exchange) => (
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
                owner: {
                  id: exchange.owner?.id || user?.id || '',
                  name: user ? `${user.name} ${user.lastname}` : 'Usuario no disponible',
                  role: 'Propietario',
                  avatar: user?.image || (user?.name?.charAt(0) || 'U'),
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
              onUserPress={(userId) => navigate('profile', { userId })}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No received offers</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {strings.commerce.sections.activeOrders} ({filteredActiveOrders.length})
        </Text>
        {filteredActiveOrders.length > 0 ? (
          filteredActiveOrders.map((exchange) => (
                <OrderCard 
                  key={exchange.id}
                  currentUserId={user?.id || ''}
                  currentUserImage={user?.image}
                  order={{
                id: exchange.id,
                exchangeNumber: `Exchange #${exchange.id.slice(-4)}`,
                date: new Date(exchange.date_created).toLocaleDateString(),
                status: getExchangeStatusInSpanish(exchange.status) as any,
                // Show the OTHER user (if I'm requester, show owner; if I'm owner, show requester)
                requester: {
                  id: exchange.requester_id === user?.id ? exchange.owner?.id : exchange.requester?.id,
                  name: exchange.requester_id === user?.id
                    ? (exchange.owner ? `${exchange.owner.name} ${exchange.owner.lastname}` : 'Usuario no disponible')
                    : (exchange.requester ? `${exchange.requester.name} ${exchange.requester.lastname}` : 'Usuario no disponible'),
                  location: exchange.requester_id === user?.id
                    ? ((exchange.owner as any)?.address 
                      ? `${(exchange.owner as any).address.state}, ${(exchange.owner as any).address.country}`
                      : undefined)
                    : ((exchange.requester as any)?.address 
                      ? `${(exchange.requester as any).address.state}, ${(exchange.requester as any).address.country}`
                      : undefined),
                  avatar: exchange.requester_id === user?.id 
                    ? (exchange.owner?.image || '/default-avatar.jpg')
                    : (exchange.requester?.image || '/default-avatar.jpg'),
                },
                // Add owner field to help OrderCard determine roles correctly
                owner: {
                  id: exchange.owner?.id || '',
                  name: exchange.owner ? `${exchange.owner.name} ${exchange.owner.lastname}` : 'Usuario no disponible',
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
                // Check the appropriate rate based on user role
                hasUserRated: exchange.requester_id === user?.id 
                  ? !!exchange.requester_rate 
                  : !!exchange.owner_rate,
              }}
                  onAccept={() => handleAcceptOffer(exchange.id)}
                  onReject={() => handleRejectOffer(exchange.id)}
                  onCancel={() => handleCancelOrder(exchange.id)}
                  onComplete={() => handleCompleteOrder(exchange.id)}
                  onCounterOffer={() => handleCounterOffer(exchange.id)}
                  onChat={() => handleChat(exchange.id, exchange.requester?.id == user?.id ? exchange.owner?.id : exchange.requester?.id)}
                  onRate={() => handleRate(exchange)}
                  onUserPress={(userId) => navigate('profile', { userId })}
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

      {/* Counter Offer Modal */}
      {showCounterOfferModal && selectedExchange && user?.id && (
        <CounterOfferModal
          visible={showCounterOfferModal}
          exchange={{
            id: selectedExchange.id,
            exchangeNumber: selectedExchange.exchange_number,
            requester: {
              id: selectedExchange.requester?.id || '',
              name: `${selectedExchange.requester?.name} ${selectedExchange.requester?.lastname}`.trim(),
            },
            owner: {
              id: selectedExchange.owner?.id || '',
              name: `${selectedExchange.owner?.name} ${selectedExchange.owner?.lastname}`.trim(),
            },
            requestedBooks: selectedExchange.owner_books.map((book: any) => ({
              id: book.id,
              title: book.title,
              author: book.author,
              image: book.image || '',
            })),
            offeredBooks: selectedExchange.requester_books.map((book: any) => ({
              id: book.id,
              title: book.title,
              author: book.author,
              image: book.image || '',
            })),
          }}
          currentUserId={user.id}
          onClose={() => {
            setShowCounterOfferModal(false);
            setSelectedExchange(null);
          }}
          onSubmit={handleSubmitCounterOffer}
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
  filtersContainer: {
    marginBottom: 20,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 12,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  filterChipTextActive: {
    color: colors.neutral.white,
    fontWeight: '600',
  },
});