// Jest setup file
import '@testing-library/jest-native/extend-expect';

// Mock expo-speech for TTS tests
jest.mock('expo-speech', () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    isSpeakingAsync: jest.fn().mockResolvedValue(false),
    getAvailableVoicesAsync: jest.fn().mockResolvedValue([]),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
    fetch: jest.fn().mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
    }),
    useNetInfo: jest.fn().mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
    }),
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn().mockReturnValue({
        execAsync: jest.fn(),
        getFirstAsync: jest.fn(),
        getAllAsync: jest.fn().mockResolvedValue([]),
        runAsync: jest.fn(),
        withTransactionAsync: jest.fn((cb) => cb()),
    }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    selectionAsync: jest.fn(),
    notificationAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
    NotificationFeedbackType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
}));
