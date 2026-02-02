/**
 * Tests for SpeechService
 */
import { speechService } from '../services/speechService';
import * as Speech from 'expo-speech';

// Mock is already set up in jest.setup.js

describe('SpeechService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('speak', () => {
        it('should call Speech.speak with cleaned text', async () => {
            await speechService.speak('Hello world', { language: 'en' });

            expect(Speech.speak).toHaveBeenCalledWith(
                'Hello world',
                expect.objectContaining({
                    language: 'en-US',
                })
            );
        });

        it('should use French by default', async () => {
            await speechService.speak('Bonjour');

            expect(Speech.speak).toHaveBeenCalledWith(
                'Bonjour',
                expect.objectContaining({
                    language: 'fr-FR',
                })
            );
        });

        it('should stop ongoing speech before starting new one', async () => {
            (Speech.isSpeakingAsync as jest.Mock).mockResolvedValueOnce(true);

            await speechService.speak('New text');

            expect(Speech.stop).toHaveBeenCalled();
        });

        it('should clean markdown from text', async () => {
            await speechService.speak('**Bold** and *italic* text');

            expect(Speech.speak).toHaveBeenCalledWith(
                'Bold and italic text',
                expect.any(Object)
            );
        });

        it('should not speak empty text', async () => {
            await speechService.speak('   ');

            expect(Speech.speak).not.toHaveBeenCalled();
        });
    });

    describe('stop', () => {
        it('should call Speech.stop when speaking', async () => {
            (Speech.isSpeakingAsync as jest.Mock).mockResolvedValueOnce(true);

            await speechService.stop();

            expect(Speech.stop).toHaveBeenCalled();
        });

        it('should not call Speech.stop when not speaking', async () => {
            (Speech.isSpeakingAsync as jest.Mock).mockResolvedValueOnce(false);

            await speechService.stop();

            expect(Speech.stop).not.toHaveBeenCalled();
        });
    });

    describe('isSpeaking', () => {
        it('should return speaking status', async () => {
            (Speech.isSpeakingAsync as jest.Mock).mockResolvedValueOnce(true);

            const result = await speechService.isSpeaking();

            expect(result).toBe(true);
        });
    });
});
