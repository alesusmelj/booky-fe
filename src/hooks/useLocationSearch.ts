import { useState, useCallback } from 'react';
import { UsersService, UserDto, SearchUsersByLocationDto } from '../services/usersService';
import { logger } from '../utils/logger';

export const useLocationSearch = () => {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchUsersByLocation = useCallback(async (searchData: SearchUsersByLocationDto) => {
        try {
            setLoading(true);
            setError(null);
            logger.info('🗺️ [useLocationSearch] Searching users by location:', searchData);

            const foundUsers = await UsersService.searchUsersByLocation(searchData);
            setUsers(foundUsers);

            logger.info('✅ [useLocationSearch] Found users:', foundUsers.length);
        } catch (error) {
            logger.error('❌ [useLocationSearch] Error searching users:', error);
            setError(error instanceof Error ? error.message : 'Error searching users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setUsers([]);
        setError(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        users,
        loading,
        error,
        searchUsersByLocation,
        clearResults,
        clearError,
    };
};
