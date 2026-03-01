import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from 'react-native';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
    const mockSignIn = jest.fn();
    const mockClearError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            signIn: mockSignIn,
            isLoading: false,
            error: null,
            clearError: mockClearError,
        });
    });

    it('renders correctly', () => {
        const { getByTestId, getByText } = render(<LoginScreen />);

        expect(getByTestId('email-input')).toBeTruthy();
        expect(getByTestId('password-input')).toBeTruthy();
        expect(getByTestId('sign-in-button')).toBeTruthy();
        expect(getByText('Booky')).toBeTruthy(); // App name
    });

    it('shows error when email is empty', () => {
        const { getByTestId, getByText } = render(<LoginScreen />);

        // Attempt sign in without filling fields
        fireEvent.press(getByTestId('sign-in-button'));

        expect(getByText('Ingresa un correo electrónico válido.')).toBeTruthy();
        expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('shows error when email is invalid', () => {
        const { getByTestId, getByText } = render(<LoginScreen />);

        fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
        fireEvent.press(getByTestId('sign-in-button'));

        expect(getByText('Ingresa un correo electrónico válido.')).toBeTruthy();
        expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('shows error when password is empty', () => {
        const { getByTestId, getAllByText } = render(<LoginScreen />);

        fireEvent.changeText(getByTestId('email-input'), 'valid@email.com');
        fireEvent.press(getByTestId('sign-in-button'));

        // Error for password should show up
        const errors = getAllByText('La contraseña es requerida.');
        expect(errors.length).toBeGreaterThan(0);
        expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('calls signIn when valid inputs are provided', async () => {
        const { getByTestId } = render(<LoginScreen />);

        fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('password-input'), 'password123');
        fireEvent.press(getByTestId('sign-in-button'));

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('shows auth error when error object is present from useAuth', () => {
        (useAuth as jest.Mock).mockReturnValue({
            signIn: mockSignIn,
            isLoading: false,
            error: 'Invalid credentials',
            clearError: mockClearError,
        });

        const { getByText } = render(<LoginScreen />);

        expect(getByText('Invalid credentials')).toBeTruthy();
    });

    it('calls onCreateAccountPress when create account link is pressed', () => {
        const onCreateAccountPressMock = jest.fn();
        const { getByTestId } = render(
            <LoginScreen onCreateAccountPress={onCreateAccountPressMock} />
        );

        fireEvent.press(getByTestId('create-account-link'));
        expect(onCreateAccountPressMock).toHaveBeenCalledTimes(1);
    });
});
