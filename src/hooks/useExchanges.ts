import { useState, useEffect, useCallback } from 'react';
import { exchangeService, BookExchange } from '../services/exchangeService';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

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

            logger.info('📦 [useExchanges] Raw exchanges from API:', {
                count: userExchanges.length,
                exchanges: userExchanges.map(ex => ({
                    id: ex.id,
                    status: ex.status,
                    requester_id: ex.requester_id,
                    owner_id: ex.owner_id,
                    requester_name: ex.requester ? `${ex.requester.name} ${ex.requester.lastname}` : 'Unknown',
                    owner_name: ex.owner ? `${ex.owner.name} ${ex.owner.lastname}` : 'Unknown',
                    date_created: ex.date_created,
                    owner_books_count: ex.owner_books?.length || 0,
                    requester_books_count: ex.requester_books?.length || 0
                }))
            });

            // Filter out exchanges with missing critical data
            const validExchanges = userExchanges.filter(exchange =>
                exchange && exchange.id && exchange.status
            );

            logger.info('✅ [useExchanges] Valid exchanges after filtering:', {
                count: validExchanges.length,
                filtered_out: userExchanges.length - validExchanges.length
            });

            setExchanges(validExchanges);

            // Separate exchanges into different categories
            // Received offers: I'm the owner and someone wants my books (all statuses)
            const offers = validExchanges.filter(exchange =>
                exchange.owner_id === user.id
            );

            // Active orders: All exchanges where I'm the requester (all statuses)
            const orders = validExchanges.filter(exchange =>
                exchange.requester_id === user.id
            );

            logger.info('📥 [useExchanges] Received Offers (I am owner):', {
                count: offers.length,
                offers: offers.map(ex => ({
                    id: ex.id,
                    status: ex.status,
                    requester: ex.requester ? `${ex.requester.name} ${ex.requester.lastname}` : 'Unknown',
                    books_requested: ex.owner_books?.length || 0,
                    books_offered: ex.requester_books?.length || 0
                }))
            });

            logger.info('📤 [useExchanges] Active Orders (I am requester):', {
                count: orders.length,
                orders: orders.map(ex => ({
                    id: ex.id,
                    status: ex.status,
                    owner: ex.owner ? `${ex.owner.name} ${ex.owner.lastname}` : 'Unknown',
                    books_requested: ex.owner_books?.length || 0,
                    books_offered: ex.requester_books?.length || 0
                }))
            });

            // Summary by status
            const statusSummary = validExchanges.reduce((acc, ex) => {
                acc[ex.status] = (acc[ex.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            logger.info('📊 [useExchanges] Status Summary:', statusSummary);
            logger.info('🔄 [useExchanges] Final categorization:', {
                total_exchanges: validExchanges.length,
                received_offers: offers.length,
                active_orders: orders.length,
                user_id: user.id
            });

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
