import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImageViewer } from '../ImageViewer';

describe('ImageViewer', () => {
    it('renders image when visible', () => {
        const imageUri = 'https://example.com/big-image.jpg';
        const { UNSAFE_getByType } = render(
            <ImageViewer visible={true} imageUri={imageUri} onClose={() => { }} />
        );

        const image = UNSAFE_getByType('Image');
        expect(image.props.source.uri).toBe(imageUri);
    });

    it('calls onClose when close button is pressed', () => {
        const mockOnClose = jest.fn();
        const { getByTestId } = render(
            <ImageViewer visible={true} imageUri="test.jpg" onClose={mockOnClose} />
        );

        const closeBtn = getByTestId('close-button');
        fireEvent.press(closeBtn);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
