import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CommunityDetailScreen } from '../CommunityDetailScreen';
import { useCommunity, usePosts, useReadingClubs } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useNavigation } from '../../contexts/NavigationContext';

jest.mock('../../hooks/useCommunity', () => ({ useCommunity: jest.fn() }));
jest.mock('../../hooks/usePosts', () => ({ usePosts: jest.fn() }));
jest.mock('../../hooks/useReadingClubs', () => ({ useReadingClubs: jest.fn() }));
jest.mock('../../contexts/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../contexts/AlertContext', () => ({ useAlert: jest.fn() }));
jest.mock('../../contexts/NavigationContext', () => ({ useNavigation: jest.fn() }));

jest.mock('../../components', () => ({
    CreateReadingClubModal: () => 'CreateReadingClubModal',
    SetMeetingModal: () => 'SetMeetingModal',
    Post: () => 'Post',
    CreatePost: () => 'CreatePost',
    VideoCallRoom: () => 'VideoCallRoom',
}));
jest.mock('@expo/vector-icons', () => ({ MaterialIcons: 'MaterialIcons' }));
jest.mock('react-native-webview', () => ({ WebView: () => 'WebView' }));

describe('CommunityDetailScreen', () => {
    const mockNavigate = jest.fn();
    const mockShowAlert = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1', name: 'TestUser' } });
        (useAlert as jest.Mock).mockReturnValue({ showAlert: mockShowAlert });
        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });

        (useCommunity as jest.Mock).mockReturnValue({
            community: null,
            loading: true,
            error: null,
        });

        (usePosts as jest.Mock).mockReturnValue({
            posts: [],
            loading: false,
            error: null,
        });

        (useReadingClubs as jest.Mock).mockReturnValue({
            readingClubs: [],
            loading: false,
            error: null,
        });
    });

    it('shows loading state while fetching community details', () => {
        const { getByText } = render(<CommunityDetailScreen communityId="c1" />);
        expect(getByText('Loading community...')).toBeTruthy();
    });

    it('shows error state when community is not found', () => {
        (useCommunity as jest.Mock).mockReturnValue({
            community: null,
            loading: false,
            error: '404 Community Not Found',
        });

        const { getByText } = render(<CommunityDetailScreen communityId="c1" />);
        expect(getByText('Community not found')).toBeTruthy();
        expect(getByText('404 Community Not Found')).toBeTruthy();
    });

    it('renders community details correctly', () => {
        (useCommunity as jest.Mock).mockReturnValue({
            community: {
                id: 'c1',
                name: 'React Readers',
                description: 'Libros de JS',
                member_count: 50,
                admin: { name: 'Admin', lastname: 'Doe' }
            },
            loading: false,
            error: null,
        });

        const { getByText } = render(<CommunityDetailScreen communityId="c1" />);

        expect(getByText('React Readers')).toBeTruthy();
        expect(getByText('Libros de JS')).toBeTruthy();
        expect(getByText('👥 50 miembros')).toBeTruthy();
        expect(getByText('Admin: Admin Doe')).toBeTruthy();
    });

    it('switches between Posts and Reading Clubs tabs', () => {
        (useCommunity as jest.Mock).mockReturnValue({
            community: { id: 'c1', name: 'React Readers' },
            loading: false,
        });

        (useReadingClubs as jest.Mock).mockReturnValue({
            readingClubs: [{ id: 'rc1', name: 'Libro del mes', join_available: true }],
            loading: false,
        });

        const { getByText, queryByText } = render(<CommunityDetailScreen communityId="c1" />);

        // Default is posts tab, so post components mockup should be there implicitly, clubs mockup shouldn't be visible directly unless rendered
        expect(queryByText('Todos los Clubes de Lectura')).toBeNull();

        // Switch to reading clubs tab
        fireEvent.press(getByText('Clubes de Lectura'));

        expect(getByText('Todos los Clubes de Lectura')).toBeTruthy();
    });

});
