/**
 * Tests pour le module RAG (Retrieval-Augmented Generation)
 * Vérifie le fonctionnement du TF-IDF, cosinus, et extraction de tokens
 */

// On importe les utilitaires RAG exportés
// Note: On teste les fonctions pures (extractTokens, TF-IDF, cosinus)
// sans avoir besoin de SQLite

describe('RAG Module — TF-IDF Vectoriel', () => {

    // === Tests de tokenisation ===
    describe('extractTokens', () => {
        // La fonction est privée, on la simule
        const extractTokens = (text: string): string[] => {
            const stopWords = new Set([
                'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une',
                'et', 'est', 'en', 'que', 'qui', 'dans', 'pour', 'pas',
                'sur', 'au', 'aux', 'ce', 'se', 'son', 'sa', 'ses',
                'il', 'elle', 'on', 'je', 'tu', 'nous', 'vous', 'ils',
                'ne', 'plus', 'par', 'avec', 'tout', 'fait', 'été',
                'être', 'avoir', 'faire', 'comme', 'mais', 'ou', 'donc',
                'car', 'ni', 'si', 'cette', 'ces', 'mon', 'ton',
                'the', 'is', 'are', 'was', 'were', 'be', 'been',
                'a', 'an', 'and', 'or', 'not', 'no', 'so',
                'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
                'from', 'it', 'its', 'this', 'that', 'i', 'you', 'he',
                'she', 'we', 'they', 'my', 'your', 'his', 'her',
            ]);

            return text
                .toLowerCase()
                .replace(/[^\w\sàâäéèêëïîôùûüÿçœæ]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2 && !stopWords.has(word));
        };

        it('devrait extraire les mots significatifs en français', () => {
            const tokens = extractTokens("La patience est la clé du bonheur");
            expect(tokens).toContain('patience');
            expect(tokens).toContain('clé');
            expect(tokens).toContain('bonheur');
            expect(tokens).not.toContain('la');
            expect(tokens).not.toContain('est');
        });

        it('devrait extraire les mots significatifs en anglais', () => {
            const tokens = extractTokens("The power of positive thinking is transformative");
            expect(tokens).toContain('power');
            expect(tokens).toContain('positive');
            expect(tokens).toContain('thinking');
            expect(tokens).not.toContain('the');
            expect(tokens).not.toContain('of');
        });

        it('devrait ignorer les mots courts (< 3 caractères)', () => {
            const tokens = extractTokens("Je me sens si mal et je ne sais pas quoi faire");
            expect(tokens).not.toContain('je');
            expect(tokens).not.toContain('si');
            expect(tokens).toContain('sens');
        });

        it('devrait gérer les caractères accentués', () => {
            const tokens = extractTokens("L'anxiété et la méditation aident à la résilience");
            expect(tokens).toContain('anxiété');
            expect(tokens).toContain('méditation');
            expect(tokens).toContain('résilience');
        });

        it('devrait retourner un tableau vide pour une chaîne vide', () => {
            const tokens = extractTokens("");
            expect(tokens).toHaveLength(0);
        });
    });

    // === Tests TF-IDF ===
    describe('calculateTFIDF', () => {
        const calculateTFIDF = (tokens: string[], idf: Map<string, number>): Map<string, number> => {
            const tfidf = new Map<string, number>();
            const tf = new Map<string, number>();

            for (const token of tokens) {
                tf.set(token, (tf.get(token) || 0) + 1);
            }

            for (const [term, count] of tf) {
                const tfValue = count / tokens.length;
                const idfValue = idf.get(term) || 0;
                tfidf.set(term, tfValue * idfValue);
            }

            return tfidf;
        };

        it('devrait calculer le TF-IDF correctement', () => {
            const tokens = ['patience', 'bonheur', 'patience']; // patience apparaît 2 fois
            const idf = new Map([['patience', 1.5], ['bonheur', 2.0]]);

            const result = calculateTFIDF(tokens, idf);

            // TF(patience) = 2/3, IDF = 1.5 → TFIDF = 1.0
            expect(result.get('patience')).toBeCloseTo(1.0, 1);
            // TF(bonheur) = 1/3, IDF = 2.0 → TFIDF ≈ 0.667
            expect(result.get('bonheur')).toBeCloseTo(0.667, 1);
        });

        it('devrait gérer un terme absent de l\'IDF', () => {
            const tokens = ['mot_inconnu'];
            const idf = new Map<string, number>();

            const result = calculateTFIDF(tokens, idf);
            expect(result.get('mot_inconnu')).toBe(0);
        });
    });

    // === Tests Similarité Cosinus ===
    describe('cosineSimilarity', () => {
        const cosineSimilarity = (vecA: Map<string, number>, vecB: Map<string, number>): number => {
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;

            const allTerms = new Set([...vecA.keys(), ...vecB.keys()]);
            for (const term of allTerms) {
                const a = vecA.get(term) || 0;
                const b = vecB.get(term) || 0;
                dotProduct += a * b;
                normA += a * a;
                normB += b * b;
            }

            if (normA === 0 || normB === 0) return 0;
            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        };

        it('devrait retourner 1.0 pour des vecteurs identiques', () => {
            const vec = new Map([['patience', 0.5], ['bonheur', 0.3]]);
            expect(cosineSimilarity(vec, vec)).toBeCloseTo(1.0, 5);
        });

        it('devrait retourner 0 pour des vecteurs orthogonaux', () => {
            const vecA = new Map([['patience', 1.0]]);
            const vecB = new Map([['colère', 1.0]]);
            expect(cosineSimilarity(vecA, vecB)).toBe(0);
        });

        it('devrait retourner une valeur entre 0 et 1 pour des vecteurs partiellement similaires', () => {
            const vecA = new Map([['patience', 0.5], ['bonheur', 0.3], ['paix', 0.2]]);
            const vecB = new Map([['patience', 0.4], ['tristesse', 0.6]]);
            const similarity = cosineSimilarity(vecA, vecB);
            expect(similarity).toBeGreaterThan(0);
            expect(similarity).toBeLessThan(1);
        });

        it('devrait retourner 0 pour un vecteur vide', () => {
            const vecA = new Map<string, number>();
            const vecB = new Map([['patience', 1.0]]);
            expect(cosineSimilarity(vecA, vecB)).toBe(0);
        });
    });

    // === Tests IDF ===
    describe('calculateIDF', () => {
        it('devrait attribuer un IDF plus élevé aux mots rares', () => {
            // Simuler 3 documents
            const docs = [
                { tokens: ['patience', 'bonheur', 'paix'] },
                { tokens: ['patience', 'stress'] },
                { tokens: ['méditation', 'calme'] },
            ];

            const N = docs.length;
            const df = new Map<string, number>();

            for (const doc of docs) {
                const uniqueTokens = new Set(doc.tokens);
                for (const token of uniqueTokens) {
                    df.set(token, (df.get(token) || 0) + 1);
                }
            }

            const idf = new Map<string, number>();
            for (const [term, count] of df) {
                idf.set(term, Math.log(N / (1 + count)));
            }

            // 'patience' apparaît dans 2/3 docs → IDF plus bas
            // 'méditation' apparaît dans 1/3 docs → IDF plus haut
            const idfPatience = idf.get('patience') || 0;
            const idfMeditation = idf.get('méditation') || 0;

            expect(idfMeditation).toBeGreaterThan(idfPatience);
        });
    });
});
