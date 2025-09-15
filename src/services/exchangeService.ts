import { exchangeApi } from './api';
import {
    BookExchangeDto,
    CreateBookExchangeDto,
    UpdateExchangeStatusDto,
    CounterOfferDto
} from '../types/api';

// Re-export types for convenience
export type BookExchange = BookExchangeDto;
export type { CreateBookExchangeDto, UpdateExchangeStatusDto, CounterOfferDto };

export const exchangeService = {
    // Create a new exchange
    createExchange: async (exchangeData: CreateBookExchangeDto): Promise<BookExchange> => {
        return await exchangeApi.createExchange(exchangeData);
    },

    // Get all exchanges for a user
    getUserExchanges: async (userId: string, status?: string): Promise<BookExchange[]> => {
        const params = status ? { status } : undefined;
        return await exchangeApi.getUserExchanges(userId, params);
    },

    // Get exchanges where user is requester
    getExchangesAsRequester: async (userId: string): Promise<BookExchange[]> => {
        return await exchangeApi.getExchangesAsRequester(userId);
    },

    // Get exchanges where user is owner
    getExchangesAsOwner: async (userId: string): Promise<BookExchange[]> => {
        return await exchangeApi.getExchangesAsOwner(userId);
    },

    // Get pending exchanges count
    getPendingExchangesCount: async (userId: string): Promise<number> => {
        return await exchangeApi.getPendingExchangesCount(userId);
    },

    // Get exchange by ID
    getExchangeById: async (exchangeId: string): Promise<BookExchange> => {
        return await exchangeApi.getExchangeById(exchangeId);
    },

    // Update exchange status
    updateExchangeStatus: async (
        exchangeId: string,
        userId: string,
        statusData: UpdateExchangeStatusDto
    ): Promise<BookExchange> => {
        return await exchangeApi.updateExchangeStatus(exchangeId, userId, statusData);
    },

    // Create counter offer
    createCounterOffer: async (
        exchangeId: string,
        userId: string,
        counterOfferData: CounterOfferDto
    ): Promise<BookExchange> => {
        return await exchangeApi.createCounterOffer(exchangeId, userId, counterOfferData);
    },
};
