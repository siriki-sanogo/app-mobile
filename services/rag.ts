/**
 * RAG Service - Retrieval Augmented Generation avec TF-IDF
 * Recherche sémantique simplifiée pour contenus offline
 */
import { searchReligiousTexts, searchDictionary, searchProverbs } from "./database";

// Liste de mots vides (stop words) pour FR et EN
const STOP_WORDS = new Set([
    // French
    "le", "la", "les", "un", "une", "des", "du", "de", "d", "l",
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
    "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
    "ce", "cet", "cette", "ces",
    "et", "ou", "mais", "donc", "or", "ni", "car",
    "est", "sont", "suis", "es", "ai", "as", "a", "ont",
    "qui", "que", "quoi", "dont", "où", "comment", "pourquoi",
    "pour", "par", "dans", "avec", "sans", "sur", "sous",
    "me", "te", "se", "y", "en", "moi", "toi", "lui",
    "ça", "cela", "ceci", "voici", "voilà",
    "être", "avoir", "faire", "dire", "aller", "voir", "venir",
    // English
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "i", "you", "he", "she", "it", "we", "they",
    "my", "your", "his", "her", "its", "our", "their",
    "this", "that", "these", "those",
    "and", "or", "but", "if", "then", "so", "because",
    "what", "which", "who", "whom", "how", "why", "where", "when",
    "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "do", "does", "did", "have", "has", "had", "will", "would", "could", "should",
]);

// Interface pour les documents indexés
interface IndexedDocument {
    id: string;
    source: string;
    content: string;
    tokens: string[];
    tfidf?: Map<string, number>;
}

interface RAGResult {
    id: string;
    source: string;
    content: string;
    score: number;
    book?: string;
    chapter?: number;
    verse?: number;
}

interface ReligiousTextResult {
    source: string;
    book: string;
    chapter: number;
    verse: number;
    content: string;
}

interface DictionaryResult {
    word: string;
    language: string;
    definition: string;
}

interface ProverbResult {
    id: number;
    text: string;
    author?: string;
}

// Cache pour les documents indexés
let documentCache: IndexedDocument[] = [];
let idfCache: Map<string, number> = new Map();

/**
 * Extrait et nettoie les mots-clés d'un texte
 */
const extractKeywords = (text: string): string[] => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Supprimer accents
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

/**
 * Calcule le Term Frequency (TF)
 */
const calculateTF = (tokens: string[]): Map<string, number> => {
    const tf = new Map<string, number>();
    const totalTokens = tokens.length;

    for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Normaliser par le nombre total de tokens
    for (const [token, count] of tf) {
        tf.set(token, count / totalTokens);
    }

    return tf;
};

/**
 * Calcule le TF-IDF pour un document
 */
const calculateTFIDF = (tokens: string[], idf: Map<string, number>): Map<string, number> => {
    const tf = calculateTF(tokens);
    const tfidf = new Map<string, number>();

    for (const [token, tfValue] of tf) {
        const idfValue = idf.get(token) || Math.log(1000); // Default IDF pour mots rares
        tfidf.set(token, tfValue * idfValue);
    }

    return tfidf;
};

/**
 * Calcule la similarité cosinus entre deux vecteurs TF-IDF
 */
const cosineSimilarity = (vec1: Map<string, number>, vec2: Map<string, number>): number => {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    // Calculer le produit scalaire et la norme de vec1
    for (const [token, value] of vec1) {
        norm1 += value * value;
        if (vec2.has(token)) {
            dotProduct += value * vec2.get(token)!;
        }
    }

    // Calculer la norme de vec2
    for (const value of vec2.values()) {
        norm2 += value * value;
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (norm1 * norm2);
};

/**
 * Recherche sémantique basée sur TF-IDF
 */
const semanticSearch = (query: string, documents: IndexedDocument[], limit: number = 5): RAGResult[] => {
    const queryTokens = extractKeywords(query);
    if (queryTokens.length === 0) return [];

    const queryTFIDF = calculateTFIDF(queryTokens, idfCache);

    const results: { doc: IndexedDocument; score: number }[] = [];

    for (const doc of documents) {
        const docTFIDF = doc.tfidf || calculateTFIDF(doc.tokens, idfCache);
        const score = cosineSimilarity(queryTFIDF, docTFIDF);

        if (score > 0.05) { // Seuil minimum de pertinence
            results.push({ doc, score });
        }
    }

    // Trier par score décroissant
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit).map(r => ({
        id: r.doc.id,
        source: r.doc.source,
        content: r.doc.content,
        score: r.score,
    }));
};

/**
 * Récupère le contexte RAG pour une requête utilisateur
 * Combine recherche dans textes religieux, dictionnaires, et proverbes
 */
export const getRAGContext = async (userQuery: string): Promise<string> => {
    try {
        const keywords = extractKeywords(userQuery);
        console.log("RAG Keywords extracted:", keywords);

        if (keywords.length === 0) {
            return "";
        }

        // Limiter à 3 mots-clés principaux
        const topKeywords = keywords.slice(0, 3);
        const allResults: RAGResult[] = [];

        // 1. Recherche dans les textes religieux
        for (const word of topKeywords) {
            try {
                const results = await searchReligiousTexts(word) as ReligiousTextResult[];
                for (const r of results) {
                    allResults.push({
                        id: `${r.source}_${r.book}_${r.chapter}_${r.verse}`,
                        source: r.source,
                        content: r.content,
                        score: 0.8, // Score de base pour correspondance exacte
                        book: r.book,
                        chapter: r.chapter,
                        verse: r.verse,
                    });
                }
            } catch (e) {
                console.log(`RAG: No religious texts for "${word}"`);
            }
        }

        // 2. Recherche dans les dictionnaires
        for (const word of topKeywords) {
            try {
                const results = await searchDictionary(word) as DictionaryResult[];
                for (const r of results) {
                    allResults.push({
                        id: `dict_${r.word}_${r.language}`,
                        source: `Dictionnaire ${r.language.toUpperCase()}`,
                        content: `${r.word}: ${r.definition}`,
                        score: 0.6,
                    });
                }
            } catch (e) {
                console.log(`RAG: No dictionary entries for "${word}"`);
            }
        }

        // 3. Recherche dans les proverbes
        try {
            const proverbResults = await searchProverbs(topKeywords[0]) as ProverbResult[];
            for (const p of proverbResults.slice(0, 2)) {
                allResults.push({
                    id: `proverb_${p.id}`,
                    source: p.author || 'Proverbe',
                    content: p.text,
                    score: 0.7,
                });
            }
        } catch (e) {
            console.log("RAG: No proverbs found");
        }

        // Dédupliquer par ID et garder les meilleurs scores
        const uniqueResults = Array.from(
            new Map(allResults.map((item) => [item.id, item])).values()
        )
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        if (uniqueResults.length === 0) {
            return "";
        }

        // Formater le contexte
        const context = uniqueResults
            .map((row) => {
                if (row.book && row.chapter !== undefined && row.verse !== undefined) {
                    return `[${row.source} - ${row.book} ${row.chapter}:${row.verse}] ${row.content}`;
                }
                return `[${row.source}] ${row.content}`;
            })
            .join("\n\n");

        return `Voici des ressources pertinentes:\n${context}`;
    } catch (error) {
        console.error("Error retrieving RAG context:", error);
        return "";
    }
};

/**
 * Exporte les fonctions utilitaires pour les tests
 */
export const ragUtils = {
    extractKeywords,
    calculateTF,
    calculateTFIDF,
    cosineSimilarity,
    semanticSearch,
};
