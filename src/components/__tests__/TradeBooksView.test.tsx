import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TradeBooksView } from '../TradeBooksView';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useExchanges } from '../../hooks';
import { useChats } from '../../hooks/useChats';

// Mock dependencies
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('../../hooks', () => ({
    useExchanges: jest.fn(),
}));

jest.mock('../../hooks/useChats', () => ({
    useChats: jest.fn(),
}));

// Mock child components to simplify the test
jest.mock('../OfferCard', () => ({
    OfferCard: ({ offer, onAccept, onReject }: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID={`offer-card-${offer.id}`}>
                <Text>{offer.requester.name}</Text>
                <TouchableOpacity onPress={onAccept} testID={`accept-btn-${offer.id}`}>
                    <Text>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onReject} testID={`reject-btn-${offer.id}`}>
                    <Text>Reject</Text>
                </TouchableOpacity>
            </View>
        );
    }
}));

jest.mock('../OrderCard', () => ({
    OrderCard: ({ order }: any) => {
        const { View, Text } = require('react-native');
        return (
            <View testID={`order-card-${order.id}`}>
                <Text>{order.requester.name}</Text>
            </View>
        );
    }
}));

jest.mock('../CreateExchangeModal', () => {
    const { View } = require('react-native');
    const React = require('react');
    return (props: any) => props.isVisible ? <View testID="create-exchange-modal" /> : null;
});

describe('TradeBooksView', () => {
    const mockNavigate = jest.fn();
    const mockLoadExchanges = jest.fn();
    const mockUpdateExchangeStatus = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1', name: 'Me' } });
        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
        (useChats as jest.Mock).mockReturnValue({ createOrGetChat: jest.fn() });
        (useExchanges as jest.Mock).mockReturnValue({
            receivedOffers: [],
            activeOrders: [],
            loading: false,
            error: null,
            updateExchangeStatus: mockUpdateExchangeStatus,
            loadExchanges: mockLoadExchanges,
        });
    });

    it('renders empty states correctly', () => {
        const { getByText } = render(<TradeBooksView />);
        expect(getByText('No received offers')).toBeTruthy();
        expect(getByText('No active orders')).toBeTruthy();
    });

    it('renders received offers and active orders', () => {
        const mockOffers = [
            { id: 'ex1', status: 'PENDING', requester: { id: 'u2', name: 'User 2', lastname: 'Test' }, date_created: new Date().toISOString() },
        ];
        const mockOrders = [
            { id: 'ex2', status: 'ACCEPTED', owner: { id: 'u3', name: 'User 3', lastname: 'Test' }, requester_id: 'u1', date_created: new Date().toISOString() },
        ];

        (useExchanges as jest.Mock).mockReturnValue({
            receivedOffers: mockOffers,
            activeOrders: mockOrders,
            loading: false,
            error: null,
            loadExchanges: mockLoadExchanges,
        });

        const { getByTestId, getByText } = render(<TradeBooksView />);

        expect(getByTestId('offer-card-ex1')).toBeTruthy();
        expect(getByTestId('order-card-ex2')).toBeTruthy();
    });

    it('handles interaction with an offer', async () => {
        const mockOffers = [
            { id: 'ex1', status: 'PENDING', requester: { id: 'u2', name: 'User 2', lastname: 'Test' }, date_created: new Date().toISOString() },
        ];

        (useExchanges as jest.Mock).mockReturnValue({
            receivedOffers: mockOffers,
            activeOrders: [],
            loading: false,
            error: null,
            updateExchangeStatus: mockUpdateExchangeStatus,
            loadExchanges: mockLoadExchanges,
        });

        const { getByTestId } = render(<TradeBooksView />);

        fireEvent.press(getByTestId('accept-btn-ex1'));
        expect(mockUpdateExchangeStatus).toHaveBeenCalledWith('ex1', 'ACCEPTED');

        fireEvent.press(getByTestId('reject-btn-ex1'));
        expect(mockUpdateExchangeStatus).toHaveBeenCalledWith('ex1', 'REJECTED');
    });

    it('opens create exchange modal', () => {
        const { getByTestId } = render(<TradeBooksView />);

        fireEvent.press(getByTestId('new-exchange-button'));
        expect(getByTestId('create-exchange-modal')).toBeTruthy();
    });

    it('shows loading state only when no data is available', () => {
        (useExchanges as jest.Mock).mockReturnValue({
            receivedOffers: [],
            activeOrders: [],
            loading: true,
            error: null,
        });

        const { getByText } = render(<TradeBooksView />);
        expect(getByText('Cargando intercambios...')).toBeTruthy();
    });
});
