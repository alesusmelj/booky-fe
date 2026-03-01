import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignUpScreen } from '../SignUpScreen';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from 'react-native';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('SignUpScreen', () => {
    const mockSignUp = jest.fn();
    const mockClearError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            signUp: mockSignUp,
            isLoading: false,
            error: null,
            clearError: mockClearError,
        });
    });

    it('renders correctly', () => {
        const { getByTestId, getByText } = render(<SignUpScreen />);

        expect(getByTestId('username-input')).toBeTruthy();
        expect(getByTestId('firstName-input')).toBeTruthy();
        expect(getByTestId('lastName-input')).toBeTruthy();
        expect(getByTestId('email-input')).toBeTruthy();
        expect(getByTestId('password-input')).toBeTruthy();
        expect(getByTestId('confirmPassword-input')).toBeTruthy();
        expect(getByTestId('sign-up-button')).toBeTruthy();
    });

    it('disables submit button and does not call signUp when form is invalid', async () => {
        const { getByTestId } = render(<SignUpScreen />);

        const submitButton = getByTestId('sign-up-button');

        // Form is initially empty and invalid terms, button should be disabled
        fireEvent.press(submitButton);

        // Fill with invalid data
        fireEvent.changeText(getByTestId('username-input'), 'ab'); // Too short
        fireEvent.changeText(getByTestId('firstName-input'), 'a'); // Too short
        fireEvent.changeText(getByTestId('lastName-input'), 'a'); // Too short
        fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
        fireEvent.changeText(getByTestId('password-input'), 'short'); // Too short
        fireEvent.changeText(getByTestId('confirmPassword-input'), 'mismatch');

        fireEvent.press(getByTestId('terms-checkbox')); // Accept terms just in case
        fireEvent.press(submitButton);

        // Button should be disabled by component logic, so mockSignUp is not called
        expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('does not allow submit without terms checked', () => {
        const { getByTestId } = render(<SignUpScreen />);

        fireEvent.changeText(getByTestId('username-input'), 'validUser');
        fireEvent.changeText(getByTestId('firstName-input'), 'Valid');
        fireEvent.changeText(getByTestId('lastName-input'), 'Name');
        fireEvent.changeText(getByTestId('email-input'), 'valid@email.com');
        fireEvent.changeText(getByTestId('password-input'), 'password123');
        fireEvent.changeText(getByTestId('confirmPassword-input'), 'password123');

        fireEvent.press(getByTestId('sign-up-button'));

        expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('allows successful submit with valid data and terms checked', async () => {
        const { getByTestId } = render(<SignUpScreen />);

        fireEvent.changeText(getByTestId('username-input'), 'validUser');
        fireEvent.changeText(getByTestId('firstName-input'), 'Valid');
        fireEvent.changeText(getByTestId('lastName-input'), 'Name');
        fireEvent.changeText(getByTestId('email-input'), 'valid@email.com');
        fireEvent.changeText(getByTestId('password-input'), 'password123');
        fireEvent.changeText(getByTestId('confirmPassword-input'), 'password123');

        fireEvent.press(getByTestId('terms-checkbox'));
        fireEvent.press(getByTestId('sign-up-button'));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                username: 'validUser',
                name: 'Valid',
                lastname: 'Name',
                email: 'valid@email.com',
                password: 'password123',
            });
        });
    });

    it('shows error text from auth context', () => {
        (useAuth as jest.Mock).mockReturnValue({
            signUp: mockSignUp,
            isLoading: false,
            error: 'Email already in use',
            clearError: mockClearError,
        });

        const { getByText } = render(<SignUpScreen />);
        expect(getByText('Email already in use')).toBeTruthy();
    });
});
