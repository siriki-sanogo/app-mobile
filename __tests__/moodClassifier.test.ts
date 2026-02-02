/**
 * Tests for MoodClassifier service
 */
import { moodClassifier } from '../services/moodClassifier';

describe('MoodClassifier', () => {
    describe('classify', () => {
        it('should detect very_bad mood for crisis keywords', () => {
            const result = moodClassifier.classify('Je pense au suicide');
            expect(result.mood).toBe('very_bad');
            expect(result.emotions).toContainEqual(expect.objectContaining({ label: 'crisis' }));
        });

        it('should detect sad mood for French sadness keywords', () => {
            const result = moodClassifier.classify('Je suis triste et malheureux');
            expect(result.mood).toBe('bad');
            expect(result.dominantEmotion).toBe('sadness');
        });

        it('should detect good mood for positive keywords', () => {
            const result = moodClassifier.classify("Je suis vraiment heureux aujourd'hui");
            expect(['good', 'very_good']).toContain(result.mood);
        });

        it('should detect neutral mood for generic messages', () => {
            const result = moodClassifier.classify('Bonjour comment allez-vous');
            expect(result.mood).toBe('neutral');
        });

        it('should apply intensity modifiers', () => {
            const normalResult = moodClassifier.classify('Je suis triste');
            const intenseResult = moodClassifier.classify('Je suis très triste');

            // Very should amplify the sadness score
            expect(intenseResult.confidence).toBeGreaterThanOrEqual(normalResult.confidence);
        });

        it('should work with English keywords', () => {
            const result = moodClassifier.classify('I am feeling very sad and depressed');
            expect(result.mood).toBe('very_bad');
        });

        it('should return confidence between 0 and 1', () => {
            const result = moodClassifier.classify('Je suis content et heureux');
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('isCrisis', () => {
        it('should detect crisis for suicide-related keywords', () => {
            expect(moodClassifier.isCrisis('Je veux mourir')).toBe(true);
        });

        it('should not detect crisis for normal sadness', () => {
            expect(moodClassifier.isCrisis('Je suis triste')).toBe(false);
        });
    });
});
