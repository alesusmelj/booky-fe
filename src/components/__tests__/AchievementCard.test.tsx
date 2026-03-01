import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AchievementCard } from '../AchievementCard';

describe('AchievementCard', () => {
    const mockAchievement = {
        id: 'ach1',
        name: 'First Word',
        description: 'Read your first book',
        category: 'reading',
        points_reward: 50,
    };

    const mockUserAchievement = {
        id: 'ua1',
        achievement_id: 'ach1',
        user_id: 'u1',
        date_earned: '2023-10-01T12:00:00Z',
        notified: true,
        achievement: mockAchievement,
    };

    it('renders general achievement correctly', () => {
        const { getByText } = render(
            <AchievementCard achievement={mockAchievement} />
        );

        expect(getByText('First Word')).toBeTruthy();
        expect(getByText('Read your first book')).toBeTruthy();
        expect(getByText('+50 pts')).toBeTruthy();
    });

    it('renders earned user achievement correctly', () => {
        const { getByText } = render(
            <AchievementCard achievement={mockUserAchievement} earned={true} />
        );

        expect(getByText('First Word')).toBeTruthy();
        expect(getByText(/Obtenido el/)).toBeTruthy();
    });

    it('renders in compact mode', () => {
        const { queryByText, getByText } = render(
            <AchievementCard achievement={mockAchievement} compact={true} earned={true} />
        );

        expect(getByText('First Word')).toBeTruthy();
        // Description should not be there in compact mode based on implementation
        expect(queryByText('Read your first book')).toBeNull();
    });

    it('renders progress when provided', () => {
        const { getByText } = render(
            <AchievementCard achievement={mockAchievement} progress={75} />
        );

        expect(getByText('75% Completado')).toBeTruthy();
    });

    it('calls onPress when clicked', () => {
        const mockOnPress = jest.fn();
        const { getByText } = render(
            <AchievementCard achievement={mockAchievement} onPress={mockOnPress} earned={true} />
        );

        fireEvent.press(getByText('First Word'));
        expect(mockOnPress).toHaveBeenCalled();
    });

    it('shows NEW badge for unnotified user achievement', () => {
        const unnotifiedAchievement = { ...mockUserAchievement, notified: false };
        const { getByText } = render(
            <AchievementCard achievement={unnotifiedAchievement} earned={true} />
        );

        expect(getByText('NUEVO')).toBeTruthy();
    });
});
