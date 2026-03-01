import React from 'react';
import { render } from '@testing-library/react-native';
import { UserAvatar } from '../UserAvatar';

describe('UserAvatar', () => {
    it('renders image when imageUrl is provided', () => {
        const imageUrl = 'https://example.com/avatar.jpg';
        const { getByRole } = render(<UserAvatar imageUrl={imageUrl} />);

        // In React Native testing library, Image often maps to an element with role image or just check props
        // Actually rendering internal Image component
        const rendered = render(<UserAvatar imageUrl={imageUrl} />);
        const image = rendered.UNSAFE_getByType('Image');
        expect(image.props.source.uri).toBe(imageUrl);
    });

    it('renders first letter of name when no imageUrl', () => {
        const { getByText } = render(<UserAvatar name="John Doe" />);
        expect(getByText('J')).toBeTruthy();
    });

    it('renders person icon fallback when no image or name', () => {
        const { UNSAFE_getByType } = render(<UserAvatar />);
        // MaterialIcons uses "MaterialIcons" as a component name if mocked or we can check Icon
        expect(UNSAFE_getByType('MaterialIcons')).toBeTruthy();
    });

    it('applies correct initial for trimmed name', () => {
        const { getByText } = render(<UserAvatar name="  felipe  " />);
        expect(getByText('F')).toBeTruthy();
    });
});
