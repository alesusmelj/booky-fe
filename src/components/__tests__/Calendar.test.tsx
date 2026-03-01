import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Calendar } from '../Calendar';

describe('Calendar', () => {
    const mockOnDateSelect = jest.fn();
    const testDate = new Date(2023, 5, 15); // June 15, 2023

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with initial date', () => {
        const { getByText } = render(
            <Calendar selectedDate={testDate} onDateSelect={mockOnDateSelect} />
        );

        // Header shows month and year in Spanish
        expect(getByText('Junio 2023')).toBeTruthy();
        // Day 15 should be visible
        expect(getByText('15')).toBeTruthy();
    });

    it('calls onDateSelect when a day is pressed', () => {
        const { getByText } = render(
            <Calendar selectedDate={testDate} onDateSelect={mockOnDateSelect} />
        );

        fireEvent.press(getByText('20'));

        expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
        const calledDate = mockOnDateSelect.mock.calls[0][0];
        expect(calledDate.getDate()).toBe(20);
        expect(calledDate.getMonth()).toBe(5); // June
        expect(calledDate.getFullYear()).toBe(2023);
    });

    it('navigates to next and previous months', () => {
        const { getByText } = render(
            <Calendar selectedDate={testDate} onDateSelect={mockOnDateSelect} />
        );

        // Navigate to July
        fireEvent.press(getByText('›'));
        expect(getByText('Julio 2023')).toBeTruthy();

        // Navigate back to June
        fireEvent.press(getByText('‹'));
        expect(getByText('Junio 2023')).toBeTruthy();

        // Navigate back to May
        fireEvent.press(getByText('‹'));
        expect(getByText('Mayo 2023')).toBeTruthy();
    });

    it('disables dates outside min/max range', () => {
        const minDate = new Date(2023, 5, 10);
        const maxDate = new Date(2023, 5, 20);

        const { getByText } = render(
            <Calendar
                selectedDate={testDate}
                onDateSelect={mockOnDateSelect}
                minDate={minDate}
                maxDate={maxDate}
            />
        );

        // Day 5 should be disabled (before minDate)
        fireEvent.press(getByText('5'));
        expect(mockOnDateSelect).not.toHaveBeenCalled();

        // Day 25 should be disabled (after maxDate)
        fireEvent.press(getByText('25'));
        expect(mockOnDateSelect).not.toHaveBeenCalled();

        // Day 15 should be enabled
        fireEvent.press(getByText('15'));
        expect(mockOnDateSelect).toHaveBeenCalledTimes(1);
    });
});
