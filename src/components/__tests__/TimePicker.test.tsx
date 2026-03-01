import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimePicker } from '../TimePicker';

describe('TimePicker', () => {
    const mockOnTimeSelect = jest.fn();
    const testTime = { hour: 14, minute: 30 }; // 2:30 PM

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with 24-hour format', () => {
        const { getByText } = render(
            <TimePicker
                selectedTime={testTime}
                onTimeSelect={mockOnTimeSelect}
                format24Hour={true}
            />
        );

        expect(getByText('14:30')).toBeTruthy();
        expect(getByText('14')).toBeTruthy();
        expect(getByText('30')).toBeTruthy();
    });

    it('renders correctly with 12-hour format', () => {
        const { getByText } = render(
            <TimePicker
                selectedTime={testTime}
                onTimeSelect={mockOnTimeSelect}
                format24Hour={false}
            />
        );

        expect(getByText('2:30 PM')).toBeTruthy();
        expect(getByText('2')).toBeTruthy();
        expect(getByText('30')).toBeTruthy();
        expect(getByText('PM')).toBeTruthy();
    });

    it('calls onTimeSelect when hour is changed', () => {
        const { getByText } = render(
            <TimePicker
                selectedTime={testTime}
                onTimeSelect={mockOnTimeSelect}
                format24Hour={true}
            />
        );

        fireEvent.press(getByText('10'));
        expect(mockOnTimeSelect).toHaveBeenCalledWith({ hour: 10, minute: 30 });
    });

    it('calls onTimeSelect when minute is changed', () => {
        const { getByText } = render(
            <TimePicker
                selectedTime={testTime}
                onTimeSelect={mockOnTimeSelect}
                format24Hour={true}
            />
        );

        fireEvent.press(getByText('45'));
        expect(mockOnTimeSelect).toHaveBeenCalledWith({ hour: 14, minute: 45 });
    });

    it('changes period in 12-hour format', () => {
        const { getByText } = render(
            <TimePicker
                selectedTime={testTime}
                onTimeSelect={mockOnTimeSelect}
                format24Hour={false}
            />
        );

        fireEvent.press(getByText('AM'));
        expect(mockOnTimeSelect).toHaveBeenCalledWith({ hour: 2, minute: 30 });
        expect(getByText('2:30 AM')).toBeTruthy();
    });
});
