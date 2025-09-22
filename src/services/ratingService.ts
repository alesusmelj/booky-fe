import { apiRequest } from './api';

export interface CreateRatingDto {
    rating: number; // 1-5
    comment?: string;
}

export interface UserRating {
    id: string;
    user_id: string;
    exchange_id: string;
    rating: number;
    comment?: string;
    date_created: string;
}

export interface UserRatingStats {
    average_rating: number;
    total_ratings: number;
}

export class RatingService {
    /**
     * Create a rating for a completed exchange
     */
    static async createExchangeRating(exchangeId: string, ratingData: CreateRatingDto): Promise<UserRating> {
        const endpoint = `/ratings/exchanges/${exchangeId}`;
        console.log('🔗 [RatingService] Creating rating with:', {
            endpoint,
            exchangeId,
            ratingData,
            method: 'POST'
        });

        try {
            const result = await apiRequest<UserRating>(endpoint, {
                method: 'POST',
                body: JSON.stringify(ratingData)
            });
            console.log('✅ [RatingService] Rating created successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ [RatingService] Error creating rating:', error);
            throw error;
        }
    }

    /**
     * Get all ratings for an exchange
     */
    static async getExchangeRatings(exchangeId: string): Promise<UserRating[]> {
        return await apiRequest<UserRating[]>(`/ratings/exchanges/${exchangeId}`, {
            method: 'GET'
        });
    }

    /**
     * Check if current user can rate an exchange
     */
    static async canUserRateExchange(exchangeId: string, userId: string): Promise<boolean> {
        return await apiRequest<boolean>(`/ratings/exchanges/${exchangeId}/can-rate?userId=${userId}`, {
            method: 'GET'
        });
    }

    /**
     * Get all ratings for a user
     */
    static async getUserRatings(userId: string): Promise<UserRating[]> {
        return await apiRequest<UserRating[]>(`/ratings/users/${userId}`, {
            method: 'GET'
        });
    }

    /**
     * Get rating statistics for a user
     */
    static async getUserRatingStats(userId: string): Promise<UserRatingStats> {
        return await apiRequest<UserRatingStats>(`/ratings/users/${userId}/stats`, {
            method: 'GET'
        });
    }
}

export const ratingService = new RatingService();
