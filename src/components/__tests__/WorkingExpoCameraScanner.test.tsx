import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WorkingExpoCameraScanner } from '../WorkingExpoCameraScanner';

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
                    onPress={() => onBarcodeScanned({ type: 'isbn', data: '9780451524935' })}
                >
                    <Text>Scan</Text>
                </TouchableOpacity>
            </View>
        ),
        useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
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

describe('WorkingExpoCameraScanner', () => {
    const mockOnBarcodeScanned = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders camera when permission is granted', async () => {
        const { getByTestId } = render(
            <WorkingExpoCameraScanner onBarcodeScanned={mockOnBarcodeScanned} onClose={mockOnClose} />
        );

        await waitFor(() => expect(getByTestId('mock-camera-view')).toBeTruthy());
    });

    it('calls onBarcodeScanned and onClose on successful scan', async () => {
        jest.useFakeTimers();
        const { getByTestId } = render(
            <WorkingExpoCameraScanner onBarcodeScanned={mockOnBarcodeScanned} onClose={mockOnClose} />
        );

        await waitFor(() => expect(getByTestId('simulate-scan')).toBeTruthy());
        fireEvent.press(getByTestId('simulate-scan'));

        // Component uses setTimeout before calling handlers
        jest.runAllTimers();

        expect(mockOnBarcodeScanned).toHaveBeenCalledWith('9780451524935');
        expect(mockOnClose).toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('calls onClose when cancel is pressed', async () => {
        const { getByText } = render(
            <WorkingExpoCameraScanner onBarcodeScanned={mockOnBarcodeScanned} onClose={mockOnClose} />
        );

        await waitFor(() => expect(getByText('Cancel')).toBeTruthy());
        fireEvent.press(getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
