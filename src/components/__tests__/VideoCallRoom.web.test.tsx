import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { VideoCallRoom } from '../VideoCallRoom.web';
import { LiveKitService } from '../../services/liveKitService';
import { useAuth } from '../../contexts/AuthContext';

// Mock LiveKit SDK
jest.mock('livekit-client', () => {
    return {
        Room: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            off: jest.fn(),
            localParticipant: {
                isMicrophoneEnabled: true,
                isCameraEnabled: true,
                setMicrophoneEnabled: jest.fn().mockResolvedValue(undefined),
                setCameraEnabled: jest.fn().mockResolvedValue(undefined),
                identity: 'local-web',
                name: 'Local User',
            },
            remoteParticipants: new Map(),
        })),
        RoomEvent: {
            ParticipantConnected: 'participantConnected',
            ParticipantDisconnected: 'participantDisconnected',
            LocalTrackPublished: 'localTrackPublished',
            LocalTrackUnpublished: 'localTrackUnpublished',
            TrackSubscribed: 'trackSubscribed',
            TrackUnsubscribed: 'trackUnsubscribed',
        },
    };
});

// Mock dependencies
jest.mock('../../services/liveKitService', () => ({
    LiveKitService: {
        getToken: jest.fn().mockResolvedValue({
            token: 'web-token',
            room_name: 'web-room'
        }),
    },
}));

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: { name: 'Web', lastname: 'User' }
    })),
}));

jest.mock('../../config/livekit', () => ({
    getLiveKitUrl: jest.fn(() => 'web-url'),
}));

jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('VideoCallRoom.web', () => {
    const mockOnLeave = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully connects and renders the room components', async () => {
        const { findByText } = render(
            <VideoCallRoom readingClubId="clubW" clubName="Web Club" onLeave={mockOnLeave} />
        );

        // 1. Wait until "Web Club" appears (means connection succeeded)
        const clubNameText = await findByText('Web Club', {}, { timeout: 10000 });
        expect(clubNameText).toBeTruthy();

        // 2. Ensure the video support placeholder also appeared
        const supportText = await findByText(/Web Video Support/i, {}, { timeout: 5000 });
        expect(supportText).toBeTruthy();

        // 3. Verify Leave button exists
        const leaveButton = await findByText('Leave');
        expect(leaveButton).toBeTruthy();
    });
});
