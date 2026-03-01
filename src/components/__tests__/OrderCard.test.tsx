import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OrderCard } from '../OrderCard';

// Dummy BookImage & UserAvatar components mock because they might use remote URLs or hooks
jest.mock('../BookImage', () => ({
    __esModule: true,
    default: ({ source }: any) => {
        const { View, Text } = require('react-native');
        return (
            <View testID={`book-image-${source}`}>
                <Text>BookImage Mock</Text>
            </View>
        );
    }
}));

jest.mock('../UserAvatar', () => ({
    UserAvatar: ({ name }: any) => {
        const { View, Text } = require('react-native');
        return (
            <View testID={`user-avatar-${name}`}>
                <Text>{name}</Text>
            </View>
        );
    }
}));

describe('OrderCard', () => {
    const dummyOrder = {
        id: 'order1',
        exchangeNumber: 'EX-123',
        date: '2023-10-01',
        status: 'Pendiente',
        requester: {
            id: 'req1',
            name: 'Alice',
            avatar: 'http://example.com/alice.jpg'
        },
        owner: {
            id: 'own1',
            name: 'Bob',
            avatar: 'http://example.com/bob.jpg'
        },
        requestedBooks: [
            { title: 'Book A', author: 'Author A', image: 'coverA.jpg' }
        ],
        offeredBooks: [
            { title: 'Book B', author: 'Author B', image: 'coverB.jpg' }
        ],
    };

    it('renders correctly for the requester in Pending state', () => {
        // Requester viewing the card
        const { getByText, getByTestId, queryByTestId } = render(
            <OrderCard order={dummyOrder} currentUserId="req1" />
        );

        expect(getByText('EX-123')).toBeTruthy();
        expect(getByText('Pendiente')).toBeTruthy();
        expect(getByText('Book A')).toBeTruthy();
        expect(getByText('Book B')).toBeTruthy();

        // Requester can cancel a pending order
        expect(getByTestId('cancel-button')).toBeTruthy();
        // Requester cannot accept/reject their own order
        expect(queryByTestId('accept-button')).toBeNull();
    });

    it('renders correctly for the owner in Pending state', () => {
        // Owner viewing the card
        const { getByTestId, queryByTestId } = render(
            <OrderCard order={dummyOrder} currentUserId="own1" />
        );

        // Owner can accept, reject, counter offer
        expect(getByTestId('accept-button')).toBeTruthy();
        expect(getByTestId('reject-button')).toBeTruthy();
        expect(getByTestId('counter-offer-button')).toBeTruthy();

        // Owner does not have cancel here based on component logic
        expect(queryByTestId('cancel-button')).toBeNull();
    });

    it('triggers onAccept and onReject for owner', () => {
        const onAcceptMock = jest.fn();
        const onRejectMock = jest.fn();

        const { getByTestId } = render(
            <OrderCard
                order={dummyOrder}
                currentUserId="own1"
                onAccept={onAcceptMock}
                onReject={onRejectMock}
            />
        );

        fireEvent.press(getByTestId('accept-button'));
        expect(onAcceptMock).toHaveBeenCalledTimes(1);

        fireEvent.press(getByTestId('reject-button'));
        expect(onRejectMock).toHaveBeenCalledTimes(1);
    });
});
