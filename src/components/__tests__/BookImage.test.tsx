import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookImage from '../BookImage';
import { ensureHttps } from '../../utils';

jest.mock('../../utils', () => ({
    ensureHttps: jest.fn(url => url),
}));

describe('BookImage', () => {
    const mockSource = 'https://example.com/book.jpg';

    it('renders image with correct source', () => {
        const { UNSAFE_getByType } = render(<BookImage source={mockSource} />);
        const image = UNSAFE_getByType('Image');
        expect(image.props.source.uri).toBe(mockSource);
        expect(ensureHttps).toHaveBeenCalledWith(mockSource);
    });

    it('renders fallback when source is missing', () => {
        const { getByText } = render(<BookImage source="" />);
        expect(getByText('📚')).toBeTruthy();
    });

    it('renders fallback on image error', () => {
        const { UNSAFE_getByType, getByText } = render(<BookImage source={mockSource} />);
        const image = UNSAFE_getByType('Image');

        fireEvent(image, 'error');

        expect(getByText('📚')).toBeTruthy();
    });

    it('handles different sizes', () => {
        const { UNSAFE_getByType, rerender } = render(<BookImage source={mockSource} size="small" />);
        let image = UNSAFE_getByType('Image');
        expect(image.props.style).toContainEqual({ width: 32, height: 44 });

        rerender(<BookImage source={mockSource} size="large" />);
        image = UNSAFE_getByType('Image');
        expect(image.props.style).toContainEqual({ width: 64, height: 90 });
    });
});
