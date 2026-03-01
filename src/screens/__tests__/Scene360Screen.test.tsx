import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Scene360Screen } from '../Scene360Screen';
import { generateSceneImage } from '../../services/api';

jest.mock('../../services/api', () => ({
    generateSceneImage: jest.fn(),
}));

jest.mock('../../components/PanoramaViewer', () => ({
    PanoramaViewer: ({ onClose, showCloseButton }: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="mock-panorama-viewer">
                <Text>Panorama Mock</Text>
                {showCloseButton && (
                    <TouchableOpacity testID="panorama-close-button" onPress={onClose}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
}));

describe('Scene360Screen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const fillFormAndSubmit = (getByPlaceholderText: any, getByText: any) => {
        const idInput = getByPlaceholderText('Ej: 123');
        const textInput = getByPlaceholderText('Ingresa un fragmento narrado del libro...');
        const submitButton = getByText('Generar Escena 360°');

        fireEvent.changeText(idInput, '101');
        fireEvent.changeText(textInput, 'Un bosque oscuro con árboles altos');
        fireEvent.press(submitButton);
    };

    it('renders correctly with form inputs', () => {
        const { getByText, getByPlaceholderText } = render(<Scene360Screen />);

        expect(getByText('Generador de Escenas 360°')).toBeTruthy();
        expect(getByPlaceholderText('Ej: 123')).toBeTruthy();
        expect(getByPlaceholderText('Ingresa un fragmento narrado del libro...')).toBeTruthy();
        expect(getByText('Generar Escena 360°')).toBeTruthy();
    });

    it('shows an alert if inputs are empty on submit', () => {
        const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
        const { getByText } = render(<Scene360Screen />);

        fireEvent.press(getByText('Generar Escena 360°'));

        expect(alertSpy).toHaveBeenCalledWith(
            'Error',
            'Por favor ingresa el ID del libro y el fragmento de texto'
        );
        alertSpy.mockRestore();
    });

    it('displays loading state while API is being called', async () => {
        let resolveApi: any;
        const promise = new Promise((resolve) => { resolveApi = resolve; });
        (generateSceneImage as jest.Mock).mockReturnValue(promise);

        const { getByPlaceholderText, getByText, queryByText, UNSAFE_getByType } = render(<Scene360Screen />);

        fillFormAndSubmit(getByPlaceholderText, getByText);

        // After pressing submit, the button should not show its text and should have ActivityIndicator
        expect(queryByText('Generar Escena 360°')).toBeNull();
        const { ActivityIndicator } = require('react-native');
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

        resolveApi({
            imageUrl: 'https://example.com/scene.jpg',
            bookId: '101'
        });
    });

    it('renders PanoramaViewer on successful API call', async () => {
        const mockResponse = {
            imageUrl: 'https://example.com/image.jpg',
            imageBase64: 'base64str',
            bookId: '101',
            craftedPrompt: 'mock',
            size: 'mock',
            createdAt: 'date'
        };
        (generateSceneImage as jest.Mock).mockResolvedValue(mockResponse);

        const { getByPlaceholderText, getByText, getByTestId, queryByText } = render(<Scene360Screen />);

        fillFormAndSubmit(getByPlaceholderText, getByText);

        await waitFor(() => {
            expect(generateSceneImage).toHaveBeenCalledWith(expect.objectContaining({
                bookId: '101',
                text: 'Un bosque oscuro con árboles altos',
            }));
        });

        // Wait for the mock panorama to appear
        await waitFor(() => {
            expect(getByTestId('mock-panorama-viewer')).toBeTruthy();
        });

        // Make sure form is no longer visible
        expect(queryByText('Generador de Escenas 360°')).toBeNull();
    });

    it('can close PanoramaViewer and return to formatting screen', async () => {
        (generateSceneImage as jest.Mock).mockResolvedValue({
            imageUrl: 'https://example.com/image.jpg',
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<Scene360Screen />);

        fillFormAndSubmit(getByPlaceholderText, getByText);

        await waitFor(() => {
            expect(getByTestId('mock-panorama-viewer')).toBeTruthy();
        });

        // Close the panorama viewer
        fireEvent.press(getByTestId('panorama-close-button'));

        // Should return to the form
        expect(getByText('Generador de Escenas 360°')).toBeTruthy();
    });

    it('displays error alert if API call fails', async () => {
        const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
        (generateSceneImage as jest.Mock).mockRejectedValue(new Error('API failed'));

        const { getByPlaceholderText, getByText } = render(<Scene360Screen />);

        fillFormAndSubmit(getByPlaceholderText, getByText);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'No se pudo generar la escena. Verifica tu conexión e intenta nuevamente.'
            );
        });

        // Should still be on the form
        expect(getByText('Generador de Escenas 360°')).toBeTruthy();
        alertSpy.mockRestore();
    });
});
