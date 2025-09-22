import { useState, useCallback } from 'react';
import { RatingService, CreateRatingDto, UserRating } from '../services/ratingService';
import { logger } from '../utils/logger';

export function useRating() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRating = useCallback(async (exchangeId: string, ratingData: CreateRatingDto): Promise<UserRating | null> => {
        setLoading(true);
        setError(null);

        try {
            const rating = await RatingService.createExchangeRating(exchangeId, ratingData);
            logger.info('✅ Rating created successfully:', rating);
            return rating;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error creating rating';
            logger.error('❌ Error creating rating:', err);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const canRate = useCallback(async (exchangeId: string, userId: string): Promise<boolean> => {
        try {
            return await RatingService.canUserRateExchange(exchangeId, userId);
        } catch (err: any) {
            logger.error('❌ Error checking if user can rate:', err);
            return false;
        }
    }, []);

    const getUserRatings = useCallback(async (userId: string): Promise<UserRating[]> => {
        setLoading(true);
        setError(null);

        try {
            const ratings = await RatingService.getUserRatings(userId);
            return ratings;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error fetching user ratings';
            logger.error('❌ Error fetching user ratings:', err);
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserRatingStats = useCallback(async (userId: string): Promise<UserRatingStatsDto | undefined> => {
        setLoading(true);
        setError(null);
        try {
            const stats = await RatingService.getUserRatingStats(userId);
            return stats;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user rating stats.';
            logger.error('❌ Error fetching user rating stats:', err);
            setError(errorMessage);
            return undefined;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        createRating,
        canRate,
        getUserRatings,
        getUserRatingStats,
        clearError,
    };
}
