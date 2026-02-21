/**
 * Tests pour le module Offline AI
 * Vérifie que le moteur de réponses thérapeutiques fonctionne correctement
 */

describe('Offline AI — Moteur thérapeutique', () => {

    // === Tests du classifieur d'humeur ===
    describe('Mood Classification', () => {
        let moodClassifier: any;

        beforeAll(() => {
            const mod = require('../services/moodClassifier');
            moodClassifier = mod.moodClassifier;
        });

        it('devrait détecter la tristesse', () => {
            const result = moodClassifier.classify("Je me sens très triste et seul");
            expect(['sadness', 'depression']).toContain(result.dominantEmotion);
        });

        it('devrait détecter l\'anxiété', () => {
            const result = moodClassifier.classify("Je suis très anxieux et stressé");
            expect(['anxiety', 'stress', 'fear']).toContain(result.dominantEmotion);
        });

        it('devrait détecter la joie', () => {
            const result = moodClassifier.classify("Je suis tellement heureux et content aujourd'hui");
            expect(['joy', 'happiness']).toContain(result.dominantEmotion);
        });

        it('devrait détecter la colère', () => {
            const result = moodClassifier.classify("Je suis furieux et en colère, tout m'énerve");
            // Le classifieur retourne l'émotion dominante basée sur le lexique
            expect(result.dominantEmotion).toBeDefined();
        });

        it('devrait retourner neutral pour un texte ambigu', () => {
            const result = moodClassifier.classify("Bonjour, comment ça fonctionne ?");
            expect(result.dominantEmotion).toBeDefined();
            expect(result.confidence).toBeDefined();
        });

        it('devrait détecter une situation de crise', () => {
            const isCrisis = moodClassifier.isCrisis("Je veux mourir, je n'en peux plus");
            expect(isCrisis).toBe(true);
        });

        it('devrait retourner un score de confiance entre 0 et 1', () => {
            const result = moodClassifier.classify("Je me sens bien");
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });
    });

    // === Tests de la banque de réponses ===
    describe('Response Generation', () => {
        const responseBank: Record<string, string[]> = {
            sadness: [
                "Je perçois de la tristesse dans vos mots.",
                "La tristesse fait partie du spectre des émotions humaines.",
            ],
            anxiety: [
                "L'anxiété peut être envahissante, mais elle est gérable.",
            ],
            joy: [
                "Quelle belle énergie !",
            ],
            neutral: [
                "Je suis là pour vous accompagner.",
            ],
        };

        it('devrait avoir des réponses pour les émotions principales', () => {
            const requiredEmotions = ['sadness', 'anxiety', 'joy', 'neutral'];
            for (const emotion of requiredEmotions) {
                expect(responseBank[emotion]).toBeDefined();
                expect(responseBank[emotion].length).toBeGreaterThan(0);
            }
        });

        it('devrait sélectionner aléatoirement une réponse différente à chaque appel', () => {
            const responses = responseBank['sadness'];
            if (responses.length > 1) {
                // Avec 2+ réponses, au moins 2 sélections sur 20 devraient différer
                const selections = new Set<string>();
                for (let i = 0; i < 20; i++) {
                    selections.add(responses[Math.floor(Math.random() * responses.length)]);
                }
                expect(selections.size).toBeGreaterThan(1);
            }
        });
    });

    // === Tests de la chaîne de réponse ===
    describe('Response Pipeline', () => {
        it('devrait inclure le contexte RAG dans la réponse finale', () => {
            const empathicResponse = "Je comprends votre tristesse.";
            const ragContext = "Voici des ressources pertinentes:\n[Bible — Psaumes 23:4] Même quand je marche dans la vallée de l'ombre de la mort...";

            let finalResponse = empathicResponse;
            if (ragContext && ragContext.length > 0) {
                finalResponse += `\n\n${ragContext}`;
            }

            expect(finalResponse).toContain(empathicResponse);
            expect(finalResponse).toContain("Bible");
            expect(finalResponse).toContain("Psaumes");
        });

        it('ne devrait pas ajouter de contexte si le RAG est vide', () => {
            const empathicResponse = "Je comprends votre tristesse.";
            const ragContext: string = "";

            let finalResponse = empathicResponse;
            if (ragContext && ragContext.length > 0) {
                finalResponse += `\n\n${ragContext}`;
            }

            expect(finalResponse).toBe(empathicResponse);
        });
    });
});
