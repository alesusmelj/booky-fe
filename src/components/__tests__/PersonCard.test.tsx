import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PersonCard } from '../PersonCard';

describe('PersonCard', () => {
    const dummyPerson = {
        id: 'person1',
        name: 'Jane Doe',
        bio: 'Avid sci-fi reader',
        avatarUrl: 'http://example.com/avatar.png',
    };

    it('renders correctly with given person data', () => {
        const { getByText } = render(<PersonCard person={dummyPerson} />);

        expect(getByText('Jane Doe')).toBeTruthy();
        expect(getByText('Avid sci-fi reader')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(
            <PersonCard person={dummyPerson} onPress={onPressMock} />
        );

        fireEvent.press(getByTestId('person-card-person1'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });
});
