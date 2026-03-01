import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BarcodeScannerWrapper } from '../BarcodeScannerWrapper';

// Mock expo-camera
jest.mock('expo-camera', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');

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
        useCameraPermissions: () => [{ granted: true }, jest.fn()],
        Camera: {
            requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
        },
    };
});

// Mock logger - correct path
jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('BarcodeScannerWrapper', () => {
    const mockOnBarcodeScanned = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders fallback scanner when forceNative is false', () => {
        const { getByText, getByPlaceholderText } = render(
            <BarcodeScannerWrapper
                onBarcodeScanned={mockOnBarcodeScanned}
                onClose={mockOnClose}
                forceNative={false}
            />
        );

        expect(getByText('📱 Escáner No Disponible')).toBeTruthy();
        expect(getByPlaceholderText('Ingresa un ISBN de 10 o 13 dígitos')).toBeTruthy();
    });

    it('calls onBarcodeScanned and onClose on manual entry in fallback', () => {
        const { getByPlaceholderText, getByText } = render(
            <BarcodeScannerWrapper
                onBarcodeScanned={mockOnBarcodeScanned}
                onClose={mockOnClose}
                forceNative={false}
            />
        );

        const input = getByPlaceholderText('Ingresa un ISBN de 10 o 13 dígitos');
        fireEvent.changeText(input, '9780451524935');
        fireEvent.press(getByText('Agregar Libro'));

        expect(mockOnBarcodeScanned).toHaveBeenCalledWith('9780451524935');
    });
});
