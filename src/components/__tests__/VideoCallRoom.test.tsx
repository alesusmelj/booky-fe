import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { VideoCallRoom } from '../VideoCallRoom.native';

// Mock all external dependencies explicitly
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({ user: { name: 'Test' } })),
}));
jest.mock('../../contexts/AlertContext', () => ({
    useAlert: jest.fn(() => ({ showAlert: jest.fn() })),
}));
jest.mock('../../services/liveKitService', () => ({
    LiveKitService: {
        getToken: jest.fn(() => Promise.resolve({ token: 't', room_name: 'r' })),
        getSceneImages: jest.fn(() => Promise.resolve([])),
    },
}));
jest.mock('../../utils/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
jest.mock('../../config/livekit', () => ({
    getLiveKitUrl: jest.fn(() => 'url'),
}));

// Mock LiveKit
jest.mock('@livekit/react-native', () => ({
    useRoom: jest.fn(),
    useParticipants: jest.fn(() => []),
    useTracks: jest.fn(() => []),
    VideoTrack: () => null,
    AudioSession: { startAudioSession: jest.fn(), stopAudioSession: jest.fn() },
    registerGlobals: jest.fn(),
}));

jest.mock('livekit-client', () => ({
    Room: jest.fn().mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        localParticipant: { setMicrophoneEnabled: jest.fn(), setCameraEnabled: jest.fn() },
        remoteParticipants: new Map(),
    })),
    RoomEvent: {
        Disconnected: 'disconnected',
        Reconnecting: 'reconnecting',
        Reconnected: 'reconnected',
        ParticipantConnected: 'participantConnected',
        ParticipantDisconnected: 'participantDisconnected',
        LocalTrackPublished: 'localTrackPublished',
        LocalTrackUnpublished: 'localTrackUnpublished',
        TrackMuted: 'trackMuted',
        TrackUnmuted: 'trackUnmuted',
        DataReceived: 'dataReceived',
    },
    Track: { Source: { Camera: 'camera' } },
}));

// Mock PanoramaViewer
jest.mock('../PanoramaViewer', () => ({
    PanoramaViewer: () => null,
}));

// Mock Icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
    Feather: () => null,
    MaterialCommunityIcons: () => null,
}));

describe('VideoCallRoom', () => {
    it('renders without crashing', async () => {
        const { getByText } = render(
            <VideoCallRoom readingClubId="club1" onClose={jest.fn()} />
        );
        expect(getByText('Conectando a la reunión')).toBeTruthy();

        // Attempt to wait for connection
        await waitFor(() => expect(getByText('Reunión del Club')).toBeTruthy(), { timeout: 2000 });
    });
});
