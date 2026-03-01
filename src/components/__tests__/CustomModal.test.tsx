import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomModal } from '../CustomModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(),
}));

describe('CustomModal', () => {
    beforeEach(() => {
        (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, bottom: 0 });
    });

    it('renders title and content when visible', () => {
        const { getByText } = render(
            <CustomModal visible={true} onClose={() => { }} title="Test Modal">
                <Text>Modal Content</Text>
            </CustomModal>
        );

        expect(getByText('Test Modal')).toBeTruthy();
        expect(getByText('Modal Content')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
        const mockOnClose = jest.fn();
        const { getByText } = render(
            <CustomModal visible={true} onClose={mockOnClose} title="Test Modal">
                <Text>Content</Text>
            </CustomModal>
        );

        fireEvent.press(getByText('Cerrar'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('renders footer buttons when provided', () => {
        const { getByText } = render(
            <CustomModal
                visible={true}
                onClose={() => { }}
                footerButtons={<Text>Footer Button</Text>}
            >
                <Text>Content</Text>
            </CustomModal>
        );

        expect(getByText('Footer Button')).toBeTruthy();
    });
});
