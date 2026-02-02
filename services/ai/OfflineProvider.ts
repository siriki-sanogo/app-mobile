import { IAIProvider, AIResponse } from './types';
import { moodClassifier } from '../moodClassifier';
import { generatePositiveContent } from '../llm';
import { generateOfflineResponse } from '../../utils/offlineAI';

/**
 * OfflineProvider - Fournisseur IA hors-ligne
 * Combine: Mood Classifier + LLM embarqué (llama.rn) + Fallback keyword-based
 */
export class OfflineProvider implements IAIProvider {
    private isModelLoaded: boolean = false;

    async isAvailable(): Promise<boolean> {
        // Toujours disponible car on a des fallbacks
        return true;
    }

    async chat(message: string, context?: string): Promise<AIResponse> {
        console.log("OfflineProvider: Processing message locally...");

        // 1. Classifier l'humeur
        const moodResult = moodClassifier.classify(message);
        console.log(`OfflineProvider: Mood detected = ${moodResult.mood} (confidence: ${(moodResult.confidence * 100).toFixed(0)}%)`);

        // 2. Vérifier si c'est une situation de crise
        if (moodClassifier.isCrisis(message)) {
            console.warn("OfflineProvider: CRISIS DETECTED - Returning emergency response");
            return {
                text: "⚠️ Je détecte que vous traversez un moment très difficile. Vous n'êtes pas seul(e). " +
                    "Veuillez contacter immédiatement les services d'aide:\n\n" +
                    "🇫🇷 France: 3114 (numéro national de prévention du suicide)\n" +
                    "🇧🇪 Belgique: 0800 32 123\n" +
                    "🇨🇭 Suisse: 143\n" +
                    "🇨🇦 Canada: 1-866-APPELLE (277-3553)\n\n" +
                    "Votre vie a de la valeur. ❤️",
                source: 'offline-crisis',
                model: 'crisis-handler',
                mood: moodResult.mood,
                confidence: moodResult.confidence,
            };
        }

        // 3. Essayer le LLM embarqué (llama.rn)
        try {
            const llmResponse = await generatePositiveContent(message);
            if (llmResponse && llmResponse.response) {
                return {
                    text: llmResponse.response,
                    source: 'offline-llm',
                    model: 'llama-embedded',
                    mood: moodResult.mood,
                    confidence: moodResult.confidence,
                };
            }
        } catch (error) {
            console.log("OfflineProvider: LLM unavailable, falling back to keyword-based...");
        }

        // 4. Fallback vers le moteur keyword-based (offlineAI.ts)
        try {
            const keywordResponse = await generateOfflineResponse(message, null, 'fr');
            return {
                text: keywordResponse.text,
                source: 'offline-keywords',
                model: 'keyword-engine',
                mood: moodResult.mood,
                confidence: moodResult.confidence,
                actions: keywordResponse.actions,
            };
        } catch (error) {
            console.error("OfflineProvider: All methods failed", error);
        }

        // 5. Réponse ultime de fallback
        return {
            text: this.getGenericPositiveResponse(moodResult.mood),
            source: 'offline-fallback',
            model: 'fallback-static',
            mood: moodResult.mood,
            confidence: moodResult.confidence,
        };
    }

    /**
     * Réponses génériques basées sur l'humeur détectée
     */
    private getGenericPositiveResponse(mood: string): string {
        const responses: Record<string, string[]> = {
            very_bad: [
                "Je sens que vous traversez un moment difficile. Je suis là pour vous. Prenez le temps de respirer profondément.",
                "La tempête finira par passer. Vous êtes plus fort(e) que vous ne le pensez.",
            ],
            bad: [
                "Les journées difficiles font partie de la vie. Demain peut être différent.",
                "Chaque épreuve nous fait grandir. Soyez doux avec vous-même.",
            ],
            neutral: [
                "Que puis-je faire pour illuminer votre journée?",
                "Parfois, être \"ok\" est déjà une victoire. Comment puis-je vous aider?",
            ],
            good: [
                "Je suis content(e) d'apprendre que vous allez bien! Continuez sur cette lancée.",
                "Votre bonne humeur est contagieuse! Qu'est-ce qui vous rend heureux aujourd'hui?",
            ],
            very_good: [
                "Votre joie est inspirante! Continuez à rayonner.",
                "C'est merveilleux! Savourez ce moment de bonheur.",
            ],
        };

        const moodResponses = responses[mood] || responses['neutral'];
        return moodResponses[Math.floor(Math.random() * moodResponses.length)];
    }
}
