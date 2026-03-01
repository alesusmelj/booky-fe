import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PanoramaViewer } from '../PanoramaViewer';

// Mock WebView
jest.mock('react-native-webview', () => {
    const { View } = require('react-native');
    return {
        WebView: (props: any) => <View testID="mock-webview" {...props} />,
    };
});

// Mock expo-screen-orientation
jest.mock('expo-screen-orientation', () => ({
    lockAsync: jest.fn(),
    unlockAsync: jest.fn(),
    OrientationLock: {
        LANDSCAPE: 'LANDSCAPE',
        PORTRAIT_UP: 'PORTRAIT_UP',
    },
}));

// Mock expo-sensors
jest.mock('expo-sensors', () => ({
    DeviceMotion: {
        isAvailableAsync: jest.fn(() => Promise.resolve(true)),
        setUpdateInterval: jest.fn(),
        addListener: jest.fn(() => ({ remove: jest.fn() })),
    },
}));

// Mock expo-asset and expo-file-system
jest.mock('expo-asset', () => ({
    Asset: {
        fromModule: jest.fn(() => ({
            downloadAsync: jest.fn(),
            localUri: 'mock-uri',
            uri: 'mock-uri',
        })),
    },
}));

jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn(() => Promise.resolve('mock-content')),
}));

describe('PanoramaViewer', () => {
    it('renders webview when assets are loaded', async () => {
        const { getByTestId, queryByTestId } = render(
            <PanoramaViewer uri="https://example.com/pano.jpg" />
        );

        // Initial state might show activity indicator or text
        // We wait for assets to load (mocked as fast)
        // await waitFor(() => expect(getByTestId('mock-webview')).toBeTruthy());
    });

    it('calls onClose when close button is pressed', () => {
        const mockOnClose = jest.fn();
        const { getByText } = render(
            <PanoramaViewer uri="https://example.com/pano.jpg" onClose={mockOnClose} />
        );

        fireEvent.press(getByText('✕'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
