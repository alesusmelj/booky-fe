import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MeetingScheduler } from '../MeetingScheduler';

jest.mock('../Calendar', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        Calendar: ({ onDateSelect }: any) => (
            <TouchableOpacity testID="mock-calendar" onPress={() => onDateSelect(new Date('2025-10-10T10:00:00Z'))}>
                <Text>Mock Calendar</Text>
            </TouchableOpacity>
        )
    };
});

jest.mock('../TimePicker', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        TimePicker: ({ onTimeSelect }: any) => (
            <TouchableOpacity testID="mock-timepicker" onPress={() => onTimeSelect({ hour: 15, minute: 30 })}>
                <Text>Mock TimePicker</Text>
            </TouchableOpacity>
        )
    };
});

describe('MeetingScheduler', () => {
    const mockOnSchedule = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders initial step correctly', () => {
        const { getByText, getAllByText } = render(
            <MeetingScheduler onSchedule={mockOnSchedule} onCancel={mockOnCancel} />
        );

        expect(getAllByText('Programar Meeting').length).toBeGreaterThan(0);
        expect(getByText('Selecciona la fecha del meeting')).toBeTruthy();
        expect(getByText('Mock Calendar')).toBeTruthy();
    });

    it('can navigate through steps and schedule meeting', () => {
        const { getByText, getAllByText, getByTestId, getByPlaceholderText } = render(
            <MeetingScheduler onSchedule={mockOnSchedule} onCancel={mockOnCancel} />
        );

        // Step 1: Date
        fireEvent.press(getByTestId('mock-calendar'));

        // Step 2: Time
        expect(getByText('Selecciona la hora del meeting')).toBeTruthy();
        fireEvent.press(getByTestId('mock-timepicker'));

        // Step 3: Details
        expect(getByText('Detalles del meeting')).toBeTruthy();

        // Increase chapter
        fireEvent.press(getByText('+'));

        // Add notes
        fireEvent.changeText(getByPlaceholderText('Agrega notas sobre el meeting...'), 'Read up to chapter 2');

        fireEvent.press(getAllByText('Programar Meeting')[1]);

        expect(mockOnSchedule).toHaveBeenCalledWith(expect.objectContaining({
            time: { hour: 15, minute: 30 },
            chapter: 2,
            notes: 'Read up to chapter 2',
        }));
    });

    it('allows cancelling', () => {
        const { getByText } = render(
            <MeetingScheduler onSchedule={mockOnSchedule} onCancel={mockOnCancel} />
        );

        fireEvent.press(getByText('Cancelar'));
        expect(mockOnCancel).toHaveBeenCalled();
    });
});
