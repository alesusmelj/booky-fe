import { ExchangeStatus } from '../types/api';
import { strings } from '../constants';

/**
 * Maps API exchange status to Spanish translation
 */
export const getExchangeStatusInSpanish = (status: ExchangeStatus): string => {
    switch (status) {
        case ExchangeStatus.PENDING:
            return strings.commerce.status.pending;
        case ExchangeStatus.ACCEPTED:
            return strings.commerce.status.accepted;
        case ExchangeStatus.REJECTED:
            return strings.commerce.status.rejected;
        case ExchangeStatus.COUNTERED:
            return strings.commerce.status.countered;
        case ExchangeStatus.CANCELLED:
            return strings.commerce.status.cancelled;
        case ExchangeStatus.COMPLETED:
            return strings.commerce.status.completed;
        default:
            return status; // Fallback to original status if not mapped
    }
};

/**
 * Gets the appropriate status color based on exchange status
 */
export const getExchangeStatusColor = (status: ExchangeStatus): string => {
    switch (status) {
        case ExchangeStatus.PENDING:
            return '#F59E0B'; // Warning/Orange
        case ExchangeStatus.ACCEPTED:
            return '#10B981'; // Success/Green
        case ExchangeStatus.REJECTED:
            return '#EF4444'; // Error/Red
        case ExchangeStatus.COUNTERED:
            return '#3B82F6'; // Info/Blue
        case ExchangeStatus.CANCELLED:
            return '#6B7280'; // Gray
        case ExchangeStatus.COMPLETED:
            return '#059669'; // Dark Green
        default:
            return '#6B7280'; // Default gray
    }
};
