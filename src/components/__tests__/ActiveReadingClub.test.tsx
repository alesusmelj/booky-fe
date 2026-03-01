import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActiveReadingClub } from '../ActiveReadingClub';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('ActiveReadingClub', () => {
    const mockOnJoin = jest.fn();
    const mockOnSetMeeting = jest.fn();

    const mockClub = {
        id: 'c1',
        name: 'Fantasy Club',
        description: 'A club for fantasy books',
        book_id: 'b1',
        book: {
            id: 'b1',
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
            pages: 300,
            image: 'http://example.com/hobbit.jpg'
        },
        current_chapter: 5,
        member_count: 10,
        next_meeting: new Date().toISOString(),
        moderator_id: 'u1',
        moderator: {
            id: 'u1',
            name: 'John',
            lastname: 'Doe'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly for a normal user', () => {
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u2' } }); // Not the moderator

        const { getByText, queryByText } = render(
            <ActiveReadingClub club={mockClub} onJoin={mockOnJoin} onSetMeeting={mockOnSetMeeting} />
        );

        // Club details
        expect(getByText('Fantasy Club')).toBeTruthy();
        expect(getByText('The Hobbit')).toBeTruthy();
        expect(getByText('por J.R.R. Tolkien')).toBeTruthy();
        expect(getByText('10 miembros')).toBeTruthy();
        expect(getByText('Moderado por John Doe')).toBeTruthy();
        expect(getByText('📖 Página 5/300')).toBeTruthy();

        // Join button should be visible
        expect(getByText('Unirse al Club')).toBeTruthy();

        // Set meeting button should NOT be visible
        expect(queryByText('Programar Reunión')).toBeNull();
    });

    it('handles join button press', () => {
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u2' } });

        const { getByText } = render(
            <ActiveReadingClub club={mockClub} onJoin={mockOnJoin} onSetMeeting={mockOnSetMeeting} />
        );

        fireEvent.press(getByText('Unirse al Club'));
        expect(mockOnJoin).toHaveBeenCalledWith('c1');
    });

    it('renders completely for the moderator and handles set meeting', () => {
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1' } }); // Is the moderator

        const { getByText } = render(
            <ActiveReadingClub club={mockClub} onJoin={mockOnJoin} onSetMeeting={mockOnSetMeeting} />
        );

        // Set meeting button SHOULD be visible
        const setMeetingBtn = getByText('Programar Reunión');
        expect(setMeetingBtn).toBeTruthy();

        fireEvent.press(setMeetingBtn);
        expect(mockOnSetMeeting).toHaveBeenCalledWith(mockClub);
    });

    it('handles missing optional data gracefully', () => {
        const incompleteClub = {
            id: 'c2',
            name: 'Mystery Club',
            description: 'Mystery books',
            book_id: 'b2',
            member_count: 2,
            next_meeting: new Date().toISOString(),
            moderator_id: 'u3'
        };

        (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u2' } });

        const { getByText } = render(
            <ActiveReadingClub club={incompleteClub} onJoin={mockOnJoin} />
        );

        expect(getByText('Libro no disponible')).toBeTruthy();
        expect(getByText('por Autor desconocido')).toBeTruthy();
        expect(getByText('📖 Página 0/?')).toBeTruthy();
        expect(getByText('Moderado por Moderador ')).toBeTruthy();
    });
});
