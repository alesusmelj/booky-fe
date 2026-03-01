import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ReadersMapScreen } from '../ReadersMapScreen';
import { useLocationSearch } from '../../hooks/useLocationSearch';
import { useNavigation } from '../../contexts/NavigationContext';
import * as Location from 'expo-location';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    class MockMapView extends React.Component {
        render() { return <View testID="mock-map-view">{this.props.children}</View>; }
    }
    class MockMarker extends React.Component {
        render() { return <View testID="mock-marker" onPress={this.props.onPress}>{this.props.children}</View>; }
    }
    return {
        __esModule: true,
        default: MockMapView,
        Marker: MockMarker,
        PROVIDER_GOOGLE: 'google',
    };
});

// Mock expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({
        coords: { latitude: 10, longitude: 20 },
    })),
    geocodeAsync: jest.fn(() => Promise.resolve([{ latitude: 30, longitude: 40 }])),
    Accuracy: { High: 3 },
}));

// Mock hooks
jest.mock('../../hooks/useLocationSearch', () => ({
    useLocationSearch: jest.fn(),
}));

jest.mock('../../contexts/NavigationContext', () => ({
    useNavigation: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('ReadersMapScreen', () => {
    const mockNavigate = jest.fn();
    const mockSearchUsersByLocation = jest.fn();
    const mockClearResults = jest.fn();
    const mockOnClose = jest.fn();

    const mockUsers = [
        { id: 'u1', name: 'User 1', username: 'u1', address: { latitude: 10.1, longitude: 20.1, state: 'ST', country: 'CT' } },
    ];

    beforeEach(() => {
        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
        (useLocationSearch as jest.Mock).mockReturnValue({
            users: mockUsers,
            loading: false,
            error: null,
            searchUsersByLocation: mockSearchUsersByLocation,
            clearResults: mockClearResults,
        });
        jest.clearAllMocks();
    });

    it('renders map when visible', () => {
        const { getByTestId, getByText } = render(
            <ReadersMapScreen visible={true} onClose={mockOnClose} />
        );

        expect(getByTestId('mock-map-view')).toBeTruthy();
        expect(getByText('Mapa de Lectores')).toBeTruthy();
    });

    it('calls searchUsersByLocation when visible and on region change', async () => {
        render(<ReadersMapScreen visible={true} onClose={mockOnClose} />);

        expect(mockSearchUsersByLocation).toHaveBeenCalled();
    });

    it('gets current location when location button is pressed', async () => {
        const { getByTestId } = render(
            <ReadersMapScreen visible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('current-location-button'));
        await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());
    });

    it('calls onClose when close button is pressed', () => {
        const { getByTestId } = render(
            <ReadersMapScreen visible={true} onClose={mockOnClose} />
        );
        fireEvent.press(getByTestId('map-close-button'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('searches location by query', async () => {
        const { getByPlaceholderText } = render(
            <ReadersMapScreen visible={true} onClose={mockOnClose} />
        );

        const input = getByPlaceholderText('Buscar una ubicación...');
        fireEvent.changeText(input, 'New York');
        fireEvent(input, 'submitEditing');

        await waitFor(() => expect(Location.geocodeAsync).toHaveBeenCalledWith('New York'));
    });
});
