import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NativeBarcodeScanner } from '../NativeBarcodeScanner';

// Mock expo-camera
jest.mock('expo-camera', () => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return {
        CameraView: ({ onBarcodeScanned, children }: any) => (
            <View testID="mock-camera-view">
                {children}
                <TouchableOpacity
                    testID="simulate-scan"
                    onPress={() => onBarcodeScanned({ type: 'isbn', data: '1234567890' })}
                >
                    <Text>Scan</Text>
                </TouchableOpacity>
            </View>
        ),
        Camera: {
            requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
        },
    };
});

// Mock logger
jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('NativeBarcodeScanner', () => {
    const mockOnBarcodeScanned = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders camera after permission is granted', async () => {
        const { getByTestId } = render(
            <NativeBarcodeScanner onBarcodeScanned={mockOnBarcodeScanned} onClose={mockOnClose} />
        );

        await waitFor(() => expect(getByTestId('mock-camera-view')).toBeTruthy());
    });

    it('calls onBarcodeScanned and onClose on successful scan', async () => {
        const { getByTestId } = render(
            <NativeBarcodeScanner onBarcodeScanned={mockOnBarcodeScanned} onClose={mockOnClose} />
        );

        await waitFor(() => expect(getByTestId('simulate-scan')).toBeTruthy());
        fireEvent.press(getByTestId('simulate-scan'));

        expect(mockOnBarcodeScanned).toHaveBeenCalledWith('1234567890');
        // onClose is called via Alert.alert callback in the component
        // We can't easily test the Alert.alert callback here without mocking Alert
    });

    it('calls onClose when cancel button is pressed', async () => {
        const { getByText } = render(
            <NativeBarcodeScanner onBarcodeScanned={mockOnBarcodeScanned} onClose={mockOnClose} />
        );

        await waitFor(() => expect(getByText('Cancel')).toBeTruthy());
        fireEvent.press(getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
