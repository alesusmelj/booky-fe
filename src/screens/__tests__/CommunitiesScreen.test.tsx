import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CommunitiesScreen } from '../CommunitiesScreen';
import { useCommunities } from '../../hooks';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../hooks/useCommunities', () => ({ useCommunities: jest.fn() }));
jest.mock('../../contexts/NavigationContext', () => ({ useNavigation: jest.fn() }));
jest.mock('../../contexts/AlertContext', () => ({ useAlert: jest.fn() }));
jest.mock('../../contexts/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../components/CustomModal', () => ({ CustomModal: (props: any) => props.visible ? <>{props.children}</> : null }));
jest.mock('@expo/vector-icons', () => ({ MaterialIcons: 'MaterialIcons' }));
jest.mock('react-native-webview', () => ({ WebView: () => 'WebView' }));

describe('CommunitiesScreen', () => {
    const mockNavigate = jest.fn();
    const mockShowAlert = jest.fn();
    const mockSearchCommunities = jest.fn();
    const mockCreateCommunity = jest.fn();
    const mockJoinCommunity = jest.fn();
    const mockDeleteCommunity = jest.fn();
    const mockRefresh = jest.fn();
    const mockFetchCommunities = jest.fn();
    const mockClearError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
        (useAlert as jest.Mock).mockReturnValue({ showAlert: mockShowAlert });
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1' } });

        (useCommunities as jest.Mock).mockReturnValue({
            communities: [],
            loading: false,
            error: null,
            refreshing: false,
            searchCommunities: mockSearchCommunities,
            createCommunity: mockCreateCommunity,
            joinCommunity: mockJoinCommunity,
            deleteCommunity: mockDeleteCommunity,
            refresh: mockRefresh,
            fetchCommunities: mockFetchCommunities,
            clearError: mockClearError,
        });
    });

    it('renders loading state when fetching communities initially', () => {
        (useCommunities as jest.Mock).mockReturnValue({
            communities: [],
            loading: true,
            error: null,
            clearError: mockClearError,
        });

        const { getByText } = render(<CommunitiesScreen />);
        expect(getByText('Cargando comunidades...')).toBeTruthy();
    });

    it('renders error state when fetch fails', () => {
        (useCommunities as jest.Mock).mockReturnValue({
            communities: [],
            loading: false,
            error: 'Network Error',
            refresh: mockRefresh,
            clearError: mockClearError,
        });

        const { getByText } = render(<CommunitiesScreen />);
        expect(getByText('Algo salió mal')).toBeTruthy();
        expect(getByText('Network Error')).toBeTruthy();

        fireEvent.press(getByText('Intentar de nuevo'));
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('renders list of communities correctly', () => {
        (useCommunities as jest.Mock).mockReturnValue({
            communities: [
                { id: 'c1', name: 'Comunidad 1', description: 'Desc 1', member_count: 5, join_available: true, admin_id: 'u2' },
                { id: 'c2', name: 'Comunidad 2', description: 'Desc 2', member_count: 10, join_available: false, admin_id: 'u1' }
            ],
            loading: false,
            error: null,
            clearError: mockClearError,
        });

        const { getByText } = render(<CommunitiesScreen />);

        expect(getByText('Comunidad 1')).toBeTruthy();
        expect(getByText('Desc 1')).toBeTruthy();
        expect(getByText('5 miembros')).toBeTruthy();

        expect(getByText('Comunidad 2')).toBeTruthy();
        expect(getByText('Desc 2')).toBeTruthy();
        expect(getByText('10 miembros')).toBeTruthy();
    });

    it('navigates to community detail if user is member', () => {
        (useCommunities as jest.Mock).mockReturnValue({
            communities: [
                // User is member when join_available is false
                { id: 'c2', name: 'Comunidad 2', description: 'Desc 2', member_count: 10, join_available: false, admin_id: 'admin' }
            ],
            loading: false,
            error: null,
            clearError: mockClearError,
        });

        const { getByText } = render(<CommunitiesScreen />);
        fireEvent.press(getByText('Comunidad 2'));

        expect(mockNavigate).toHaveBeenCalledWith('community-detail', { communityId: 'c2' });
    });

    it('calls join API when unirse button is pressed', async () => {
        mockJoinCommunity.mockResolvedValue(true);

        (useCommunities as jest.Mock).mockReturnValue({
            communities: [
                { id: 'c1', name: 'Comunidad 1', description: 'Desc 1', member_count: 5, join_available: true, admin_id: 'admin' },
            ],
            loading: false,
            error: null,
            joinCommunity: mockJoinCommunity,
            fetchCommunities: mockFetchCommunities,
            clearError: mockClearError,
        });

        const { getByText } = render(<CommunitiesScreen />);

        // Simulate event with stopPropagation
        fireEvent.press(getByText('Unirse'), { stopPropagation: jest.fn() });

        await waitFor(() => {
            expect(mockJoinCommunity).toHaveBeenCalledWith('c1');
        });
    });

    it('searches for communities based on user input', async () => {
        const { getByPlaceholderText } = render(<CommunitiesScreen />);

        const searchInput = getByPlaceholderText('Buscar comunidades...');
        fireEvent.changeText(searchInput, 'Libros');

        await waitFor(() => {
            expect(mockSearchCommunities).toHaveBeenCalledWith('Libros');
        }, { timeout: 400 }); // Account for debounce
    });

});
