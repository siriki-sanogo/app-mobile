/**
 * Mood Classifier - Classification d'humeur avancée pour GOOD APP
 * Utilise un lexique émotionnel pondéré avec scoring TF-IDF simplifié
 */

export type MoodLevel = 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';

export interface EmotionScore {
    label: string;
    score: number;
}

export interface MoodResult {
    mood: MoodLevel;
    confidence: number;
    emotions: EmotionScore[];
    dominantEmotion: string;
}

// Lexique émotionnel pondéré (score: -10 à +10)
// Score négatif = émotion négative, positif = émotion positive
const EMOTION_LEXICON: Record<string, { score: number; category: string }> = {
    // --- TRÈS NÉGATIF (-10 à -7) ---
    'suicide': { score: -10, category: 'crisis' },
    'mourir': { score: -10, category: 'crisis' },
    'mort': { score: -9, category: 'crisis' },
    'tuer': { score: -10, category: 'crisis' },
    'désespoir': { score: -9, category: 'sadness' },
    'désespéré': { score: -9, category: 'sadness' },
    'détresse': { score: -8, category: 'anxiety' },
    'terreur': { score: -8, category: 'fear' },
    'haine': { score: -8, category: 'anger' },
    'dépression': { score: -8, category: 'sadness' },
    'déprimé': { score: -8, category: 'sadness' },
    'effondré': { score: -8, category: 'sadness' },

    // --- NÉGATIF (-6 à -4) ---
    'triste': { score: -6, category: 'sadness' },
    'tristesse': { score: -6, category: 'sadness' },
    'malheureux': { score: -6, category: 'sadness' },
    'anxieux': { score: -6, category: 'anxiety' },
    'anxiété': { score: -6, category: 'anxiety' },
    'angoisse': { score: -6, category: 'anxiety' },
    'peur': { score: -5, category: 'fear' },
    'effrayé': { score: -5, category: 'fear' },
    'stress': { score: -5, category: 'stress' },
    'stressé': { score: -5, category: 'stress' },
    'colère': { score: -5, category: 'anger' },
    'énervé': { score: -5, category: 'anger' },
    'fâché': { score: -5, category: 'anger' },
    'frustré': { score: -5, category: 'frustration' },
    'frustration': { score: -5, category: 'frustration' },
    'seul': { score: -5, category: 'loneliness' },
    'solitude': { score: -5, category: 'loneliness' },
    'isolé': { score: -5, category: 'loneliness' },
    'fatigué': { score: -4, category: 'fatigue' },
    'épuisé': { score: -5, category: 'fatigue' },
    'insomnie': { score: -4, category: 'fatigue' },
    'mal': { score: -4, category: 'pain' },
    'douleur': { score: -4, category: 'pain' },
    'inquiet': { score: -4, category: 'anxiety' },
    'soucis': { score: -4, category: 'anxiety' },
    'problème': { score: -3, category: 'stress' },
    'difficile': { score: -3, category: 'challenge' },

    // --- LÉGÈREMENT NÉGATIF (-3 à -1) ---
    'ennui': { score: -2, category: 'boredom' },
    'ennuyé': { score: -2, category: 'boredom' },
    'confus': { score: -2, category: 'confusion' },
    'perdu': { score: -2, category: 'confusion' },
    'pas bien': { score: -3, category: 'unwell' },
    'bof': { score: -1, category: 'meh' },
    'moyen': { score: -1, category: 'neutral' },

    // --- NEUTRE (0) ---
    'normal': { score: 0, category: 'neutral' },
    'ordinaire': { score: 0, category: 'neutral' },
    'calme': { score: 1, category: 'calm' },

    // --- LÉGÈREMENT POSITIF (+1 à +3) ---
    'ok': { score: 1, category: 'okay' },
    'ça va': { score: 1, category: 'okay' },
    'tranquille': { score: 2, category: 'calm' },
    'paisible': { score: 2, category: 'peace' },
    'reposé': { score: 2, category: 'rest' },
    'mieux': { score: 2, category: 'improvement' },
    'curieux': { score: 2, category: 'curiosity' },
    'intéressé': { score: 2, category: 'interest' },
    'espoir': { score: 3, category: 'hope' },

    // --- POSITIF (+4 à +6) ---
    'bien': { score: 4, category: 'wellbeing' },
    'content': { score: 5, category: 'happiness' },
    'satisfait': { score: 5, category: 'satisfaction' },
    'heureux': { score: 6, category: 'happiness' },
    'heureuse': { score: 6, category: 'happiness' },
    'joie': { score: 6, category: 'joy' },
    'joyeux': { score: 6, category: 'joy' },
    'optimiste': { score: 5, category: 'optimism' },
    'confiant': { score: 5, category: 'confidence' },
    'fier': { score: 5, category: 'pride' },
    'reconnaissant': { score: 5, category: 'gratitude' },
    'gratitude': { score: 5, category: 'gratitude' },
    'motivé': { score: 5, category: 'motivation' },
    'inspiré': { score: 5, category: 'inspiration' },
    'amour': { score: 6, category: 'love' },
    'aimer': { score: 5, category: 'love' },

    // --- TRÈS POSITIF (+7 à +10) ---
    'super': { score: 7, category: 'excitement' },
    'génial': { score: 7, category: 'excitement' },
    'excellent': { score: 7, category: 'excellence' },
    'fantastique': { score: 8, category: 'excitement' },
    'extraordinaire': { score: 8, category: 'amazement' },
    'merveilleux': { score: 8, category: 'wonder' },
    'parfait': { score: 8, category: 'perfection' },
    'extatique': { score: 9, category: 'ecstasy' },
    'épanoui': { score: 8, category: 'fulfillment' },
    'béni': { score: 8, category: 'blessing' },

    // --- ENGLISH SUPPORT ---
    'sad': { score: -6, category: 'sadness' },
    'happy': { score: 6, category: 'happiness' },
    'angry': { score: -5, category: 'anger' },
    'anxious': { score: -6, category: 'anxiety' },
    'stressed': { score: -5, category: 'stress' },
    'tired': { score: -4, category: 'fatigue' },
    'scared': { score: -5, category: 'fear' },
    'lonely': { score: -5, category: 'loneliness' },
    'depressed': { score: -8, category: 'sadness' },
    'hopeful': { score: 4, category: 'hope' },
    'grateful': { score: 5, category: 'gratitude' },
    'excited': { score: 7, category: 'excitement' },
    'calm': { score: 2, category: 'calm' },
    'peaceful': { score: 3, category: 'peace' },
    'love': { score: 6, category: 'love' },
    'hate': { score: -7, category: 'anger' },
    'fear': { score: -5, category: 'fear' },
    'joy': { score: 7, category: 'joy' },
    'wonderful': { score: 8, category: 'wonder' },
    'terrible': { score: -7, category: 'distress' },
    'awful': { score: -6, category: 'distress' },
    'great': { score: 6, category: 'excellence' },
    'good': { score: 4, category: 'wellbeing' },
    'bad': { score: -4, category: 'unwell' },
    'fine': { score: 2, category: 'okay' },
    'okay': { score: 1, category: 'okay' },
};

// Intensificateurs et modificateurs
const INTENSIFIERS: Record<string, number> = {
    'très': 1.5,
    'vraiment': 1.4,
    'tellement': 1.5,
    'extrêmement': 1.8,
    'incroyablement': 1.7,
    'super': 1.4,
    'trop': 1.3,
    'assez': 0.8,
    'un peu': 0.5,
    'légèrement': 0.4,
    'pas': -1.0,       // Négation
    "n'est pas": -1.0,
    'jamais': -0.8,
    'plus': 0.7,       // "je ne suis plus triste"
    'very': 1.5,
    'really': 1.4,
    'extremely': 1.8,
    'not': -1.0,
    'never': -0.8,
};

class MoodClassifier {
    /**
     * Classifie l'humeur à partir d'un texte
     */
    classify(text: string): MoodResult {
        const normalizedText = this.normalizeText(text);
        const tokens = this.tokenize(normalizedText);

        const emotionScores = this.calculateEmotionScores(tokens, normalizedText);
        const aggregateScore = this.aggregateScore(emotionScores);
        const mood = this.scoreToMood(aggregateScore);
        const confidence = this.calculateConfidence(emotionScores, tokens.length);

        // Top 3 emotions
        const topEmotions = this.getTopEmotions(emotionScores, 3);
        const dominantEmotion = topEmotions.length > 0 ? topEmotions[0].label : 'neutral';

        return {
            mood,
            confidence,
            emotions: topEmotions,
            dominantEmotion,
        };
    }

    /**
     * Normalise le texte
     */
    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer accents pour matching
            .replace(/[.,!?;:'"()[\]{}]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Tokenize le texte
     */
    private tokenize(text: string): string[] {
        return text.split(/\s+/).filter(t => t.length > 1);
    }

    /**
     * Calcule les scores émotionnels
     */
    private calculateEmotionScores(tokens: string[], fullText: string): Map<string, number> {
        const scores = new Map<string, number>();

        // Chercher les mots du lexique
        for (const [word, data] of Object.entries(EMOTION_LEXICON)) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = fullText.match(regex);

            if (matches) {
                let score = data.score * matches.length;

                // Appliquer les intensificateurs
                for (const [intensifier, multiplier] of Object.entries(INTENSIFIERS)) {
                    const intensifierRegex = new RegExp(`${intensifier}\\s+${word}`, 'gi');
                    if (intensifierRegex.test(fullText)) {
                        score *= multiplier;
                    }
                }

                const currentScore = scores.get(data.category) || 0;
                scores.set(data.category, currentScore + score);
            }
        }

        return scores;
    }

    /**
     * Agrège les scores en un score global
     */
    private aggregateScore(emotionScores: Map<string, number>): number {
        if (emotionScores.size === 0) return 0;

        let totalScore = 0;
        let totalWeight = 0;

        for (const [category, score] of emotionScores) {
            // Les émotions de crise ont plus de poids
            const weight = category === 'crisis' ? 3 : 1;
            totalScore += score * weight;
            totalWeight += weight * Math.abs(score);
        }

        return totalWeight > 0 ? totalScore / (totalWeight / emotionScores.size) : 0;
    }

    /**
     * Convertit le score en niveau d'humeur
     */
    private scoreToMood(score: number): MoodLevel {
        if (score <= -5) return 'very_bad';
        if (score <= -2) return 'bad';
        if (score < 2) return 'neutral';
        if (score < 5) return 'good';
        return 'very_good';
    }

    /**
     * Calcule la confiance du classement
     */
    private calculateConfidence(emotionScores: Map<string, number>, tokenCount: number): number {
        if (emotionScores.size === 0) return 0.3; // Base confidence if no emotions detected

        // Plus d'émotions détectées = plus de confiance
        const emotionCoverage = Math.min(emotionScores.size / 5, 1);

        // Scores plus forts = plus de confiance
        let maxScore = 0;
        for (const score of emotionScores.values()) {
            maxScore = Math.max(maxScore, Math.abs(score));
        }
        const scoreStrength = Math.min(maxScore / 10, 1);

        // Combinaison
        const confidence = 0.3 + (0.4 * emotionCoverage) + (0.3 * scoreStrength);
        return Math.min(confidence, 1);
    }

    /**
     * Récupère les top N émotions
     */
    private getTopEmotions(emotionScores: Map<string, number>, n: number): EmotionScore[] {
        const entries = Array.from(emotionScores.entries());
        return entries
            .map(([label, score]) => ({ label, score: Math.abs(score) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, n);
    }

    /**
     * Détecte si le texte contient des indicateurs de crise
     */
    isCrisis(text: string): boolean {
        const result = this.classify(text);
        return result.emotions.some(e => e.label === 'crisis' && e.score > 5);
    }
}

// Export singleton
export const moodClassifier = new MoodClassifier();
