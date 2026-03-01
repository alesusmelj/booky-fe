import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UserSearchCard } from '../UserSearchCard';
import { UserDto } from '../../types/api';

describe('UserSearchCard', () => {
    const defaultUser: UserDto = {
        id: 'user1',
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        description: 'A reader',
    };

    it('renders correctly with given user data', () => {
        const { getByText } = render(<UserSearchCard user={defaultUser} />);

        // Combining name and lastname
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('@johndoe')).toBeTruthy();
        expect(getByText('A reader')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(<UserSearchCard user={defaultUser} onPress={onPressMock} />);

        fireEvent.press(getByTestId('user-card-user1'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });
});
