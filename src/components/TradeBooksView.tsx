import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OfferCard } from './OfferCard';
import { OrderCard } from './OrderCard';
import { strings, colors, theme } from '../constants';

// Mock data - replace with actual API data
const mockReceivedOffers = [
  {
    id: 1,
    exchangeNumber: 'Intercambio #1',
    date: '2024-02-11',
    status: 'PENDIENTE' as const,
    requester: {
      name: 'Ana Martínez',
      role: 'Solicitante',
      avatar: 'A',
    },
    requestedBooks: [
      {
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        image: '/book1.jpg',
      },
    ],
    offeredBooks: [
      {
        title: '1984',
        author: 'George Orwell',
        image: '/book2.jpg',
      },
    ],
  },
];

const mockActiveOrders = [
  {
    id: 1,
    exchangeNumber: 'Intercambio #1',
    date: '2024-02-10',
    status: 'ACTIVO' as const,
    requester: {
      name: 'Carlos Rodriguez',
      location: 'Buenos Aires, Argentina',
      avatar: '/avatar.jpg',
    },
    requestedBooks: [
      {
        title: '1984',
        author: 'George Orwell',
        image: '/book2.jpg',
      },
    ],
    offeredBooks: [
      {
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        image: '/book1.jpg',
      },
    ],
  },
];

export function TradeBooksView() {
  const handleNewExchange = () => {
    // TODO: Navigate to new exchange screen
  };

  return (
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.commerce.sections.receivedOffers}</Text>
        {mockReceivedOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.commerce.sections.activeOrders}</Text>
        {mockActiveOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});