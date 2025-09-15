import { useState, useEffect, useCallback } from 'react';
import { exchangeService, BookExchange } from '../services/exchangeService';
import { useAuth } from '../contexts/AuthContext';

export function useExchanges() {
    const { user } = useAuth();
    const [exchanges, setExchanges] = useState<BookExchange[]>([]);
    const [receivedOffers, setReceivedOffers] = useState<BookExchange[]>([]);
    const [activeOrders, setActiveOrders] = useState<BookExchange[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadExchanges = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const userExchanges = await exchangeService.getUserExchanges(user.id);

            // Filter out exchanges with missing critical data
            const validExchanges = userExchanges.filter(exchange =>
                exchange && exchange.id && exchange.status
            );

            setExchanges(validExchanges);

            // Separate exchanges into different categories
            // Received offers: I'm the owner and someone wants my books (PENDING)
            const offers = validExchanges.filter(exchange =>
                exchange.owner_id === user.id && exchange.status === 'PENDING'
            );

            // Active orders: All exchanges that are active (ACCEPTED, COUNTERED) OR my pending requests
            const orders = validExchanges.filter(exchange =>
                // Accepted/Countered exchanges (regardless of role)
                exchange.status === 'ACCEPTED' || exchange.status === 'COUNTERED' ||
                // My pending requests (I'm the requester and it's pending)
                (exchange.requester_id === user.id && exchange.status === 'PENDING')
            );

            setReceivedOffers(offers);
            setActiveOrders(orders);
        } catch (err) {
            console.error('Error loading exchanges:', err);
            setError('Failed to load exchanges');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const updateExchangeStatus = useCallback(async (
        exchangeId: string,
        status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
    ) => {
        if (!user?.id) return;

        try {
            await exchangeService.updateExchangeStatus(exchangeId, user.id, { status });
            // Reload exchanges after status update
            await loadExchanges();
        } catch (err) {
            console.error('Error updating exchange status:', err);
            setError('Failed to update exchange status');
        }
    }, [user?.id, loadExchanges]);

    const createExchange = useCallback(async (exchangeData: {
        owner_id: string;
        owner_book_ids: string[];
        requester_book_ids: string[];
    }) => {
        if (!user?.id) return;

        try {
            const newExchange = await exchangeService.createExchange({
                ...exchangeData,
                requester_id: user.id,
            });

            // Reload exchanges after creation
            await loadExchanges();
            return newExchange;
        } catch (err) {
            console.error('Error creating exchange:', err);
            setError('Failed to create exchange');
            throw err;
        }
    }, [user?.id, loadExchanges]);

    useEffect(() => {
        loadExchanges();
    }, [loadExchanges]);

    return {
        exchanges,
        receivedOffers,
        activeOrders,
        loading,
        error,
        loadExchanges,
        updateExchangeStatus,
        createExchange,
    };
}
