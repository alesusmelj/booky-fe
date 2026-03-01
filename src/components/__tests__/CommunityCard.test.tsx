import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CommunityCard } from '../CommunityCard';

describe('CommunityCard', () => {
    const dummyCommunity = {
        id: 'comm1',
        name: 'Tech Readers',
        description: 'A place for tech enthusiasts',
        iconUrl: 'http://example.com/icon.png',
    };

    it('renders correctly with given community data', () => {
        const { getByText } = render(<CommunityCard community={dummyCommunity} />);

        expect(getByText('Tech Readers')).toBeTruthy();
        expect(getByText('A place for tech enthusiasts')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(
            <CommunityCard community={dummyCommunity} onPress={onPressMock} />
        );

        fireEvent.press(getByTestId('community-card-comm1'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });
});
