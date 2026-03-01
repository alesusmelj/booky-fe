import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SetMeetingModal } from '../SetMeetingModal';

jest.mock('../Calendar', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        Calendar: ({ onDateSelect }: any) => (
            <TouchableOpacity testID="mock-calendar" onPress={() => onDateSelect(new Date('2026-05-15T12:00:00Z'))}>
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
            <TouchableOpacity testID="mock-timepicker" onPress={() => onTimeSelect({ hour: 18, minute: 45 })}>
                <Text>Mock TimePicker</Text>
            </TouchableOpacity>
        )
    };
});

describe('SetMeetingModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSetMeeting = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(
            <SetMeetingModal
                visible={true}
                clubName="Fantasy Club"
                onClose={mockOnClose}
                onSetMeeting={mockOnSetMeeting}
            />
        );

        expect(getByText('Programar Reunión para Fantasy Club')).toBeTruthy();
        expect(getByText('Fecha de la Reunión')).toBeTruthy();
        expect(getByText('Hora de la Reunión')).toBeTruthy();
        expect(getByText('Desde página')).toBeTruthy();
        expect(getByPlaceholderText('12')).toBeTruthy();
    });

    it('has disabled submit button initially', () => {
        const { getByText } = render(
            <SetMeetingModal
                visible={true}
                clubName="Fantasy Club"
                onClose={mockOnClose}
                onSetMeeting={mockOnSetMeeting}
            />
        );

        const submitBtn = getByText('Programar');
        // Let's fire press and see if it calls onSetMeeting
        fireEvent.press(submitBtn);
        expect(mockOnSetMeeting).not.toHaveBeenCalled();
    });

    it('allows setting a meeting', () => {
        const { getByText, getByTestId, getByPlaceholderText } = render(
            <SetMeetingModal
                visible={true}
                clubName="Fantasy Club"
                onClose={mockOnClose}
                onSetMeeting={mockOnSetMeeting}
            />
        );

        // Select Date
        fireEvent.press(getByTestId('mock-calendar'));

        // Select Time
        fireEvent.press(getByTestId('mock-timepicker'));

        // Enter Chapter
        fireEvent.changeText(getByPlaceholderText('12'), '5');

        // Submit
        fireEvent.press(getByText('Programar'));

        expect(mockOnSetMeeting).toHaveBeenCalledWith({
            chapter: 5,
            nextMeeting: expect.any(String) // The time string formatted with ISO
        });
        expect(mockOnClose).toHaveBeenCalledTimes(1); // Because it relies on handleClose internally which calls onClose
    });

    it('handles close', () => {
        const { getByText } = render(
            <SetMeetingModal
                visible={true}
                clubName="Fantasy Club"
                onClose={mockOnClose}
                onSetMeeting={mockOnSetMeeting}
            />
        );

        fireEvent.press(getByText('Cancelar'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
