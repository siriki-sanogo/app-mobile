/**
 * RAG Service - Retrieval Augmented Generation avec TF-IDF Vectoriel
 * Recherche sémantique offline basée sur TF-IDF + Similarité Cosinus
 * 
 * Architecture:
 * 1. Au premier appel, charge tous les documents depuis SQLite (lazy init)
 * 2. Tokenize + calcule TF-IDF pour chaque document
 * 3. Calcule l'IDF global sur le corpus
 * 4. Pour chaque requête, calcule le vecteur TF-IDF et cherche par similarité cosinus
 */
import { getDB } from "./database";

// ================================================
// STOP WORDS (FR + EN)
// ================================================
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
    "ne", "pas", "plus", "si", "tout", "tous", "toute", "toutes",
    "au", "aux", "aussi",
    // English
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "i", "you", "he", "she", "it", "we", "they",
    "my", "your", "his", "her", "its", "our", "their",
    "this", "that", "these", "those",
    "and", "or", "but", "if", "then", "so", "because",
    "what", "which", "who", "whom", "how", "why", "where", "when",
    "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "do", "does", "did", "have", "has", "had", "will", "would", "could", "should",
    "not", "no", "also", "all", "been",
]);

// ================================================
// TYPES
// ================================================

interface IndexedDocument {
    id: string;
    source: string;        // 'bible', 'coran', 'proverbe', 'dictionnaire'
    content: string;       // Texte brut original
    tokens: string[];      // Tokens nettoyés
    tfidf: Map<string, number>; // Vecteur TF-IDF pré-calculé
    // Métadonnées optionnelles
    book?: string;
    chapter?: number;
    verse?: number;
    author?: string;
    word?: string;
    language?: string;
}

interface RAGResult {
    id: string;
    source: string;
    content: string;
    score: number;
    book?: string;
    chapter?: number;
    verse?: number;
    author?: string;
}

// ================================================
// ÉTAT GLOBAL (Singleton)
// ================================================

let documentCache: IndexedDocument[] = [];
let idfCache: Map<string, number> = new Map();
let isIndexed = false;
let isIndexing = false;
let indexingPromise: Promise<void> | null = null;

// ================================================
// TOKENIZATION & TEXT PROCESSING
// ================================================

/**
 * Extrait et nettoie les tokens d'un texte (supprime accents, ponctuation, stop words)
 */
const extractTokens = (text: string): string[] => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Supprimer accents
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\[\]'"«»…]/g, " ")
        .replace(/\d+/g, " ")            // Supprimer les nombres
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

// ================================================
// TF-IDF CALCULATIONS
// ================================================

/**
 * Calcule le Term Frequency (TF) normalisé
 */
const calculateTF = (tokens: string[]): Map<string, number> => {
    const tf = new Map<string, number>();
    const totalTokens = tokens.length;
    if (totalTokens === 0) return tf;

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
 * Calcule l'IDF (Inverse Document Frequency) pour tout le corpus
 * IDF(t) = log(N / (1 + df(t)))  où df(t) = nombre de docs contenant t
 */
const calculateIDF = (documents: IndexedDocument[]): Map<string, number> => {
    const idf = new Map<string, number>();
    const N = documents.length;
    if (N === 0) return idf;

    // Document Frequency: compter dans combien de docs chaque terme apparaît
    const df = new Map<string, number>();
    for (const doc of documents) {
        const uniqueTokens = new Set(doc.tokens);
        for (const token of uniqueTokens) {
            df.set(token, (df.get(token) || 0) + 1);
        }
    }

    // Calculer IDF
    for (const [token, docFreq] of df) {
        idf.set(token, Math.log(N / (1 + docFreq)));
    }

    return idf;
};

/**
 * Calcule le vecteur TF-IDF pour un ensemble de tokens
 */
const calculateTFIDF = (tokens: string[], idf: Map<string, number>): Map<string, number> => {
    const tf = calculateTF(tokens);
    const tfidf = new Map<string, number>();

    for (const [token, tfValue] of tf) {
        const idfValue = idf.get(token) || Math.log(documentCache.length || 1000);
        tfidf.set(token, tfValue * idfValue);
    }

    return tfidf;
};

// ================================================
// SIMILARITÉ COSINUS
// ================================================

/**
 * Calcule la similarité cosinus entre deux vecteurs TF-IDF
 */
const cosineSimilarity = (vec1: Map<string, number>, vec2: Map<string, number>): number => {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const [token, value] of vec1) {
        norm1 += value * value;
        if (vec2.has(token)) {
            dotProduct += value * vec2.get(token)!;
        }
    }

    for (const value of vec2.values()) {
        norm2 += value * value;
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (norm1 * norm2);
};

// ================================================
// INDEXATION DES DOCUMENTS DEPUIS SQLITE
// ================================================

/**
 * Charge et indexe tous les documents depuis SQLite (lazy, une seule fois)
 * Sources: textes religieux, proverbes, dictionnaire
 */
const buildIndex = async (): Promise<void> => {
    // Si déjà indexé, ne rien faire
    if (isIndexed) return;

    // Si une indexation est en cours, attendre qu'elle finisse
    if (isIndexing && indexingPromise) {
        await indexingPromise;
        return;
    }

    isIndexing = true;
    indexingPromise = (async () => {
        try {
            console.log("📚 RAG: Building TF-IDF vector index...");
            const startTime = Date.now();
            const docs: IndexedDocument[] = [];
            const db = await getDB();

            // 1. Charger les textes religieux
            try {
                const religiousTexts = await db.getAllAsync(
                    "SELECT id, source, book, chapter, verse, content FROM religious_texts LIMIT 2000"
                ) as any[];

                for (const row of religiousTexts) {
                    const tokens = extractTokens(row.content);
                    if (tokens.length > 0) {
                        docs.push({
                            id: `religious_${row.id}`,
                            source: row.source,
                            content: row.content,
                            tokens,
                            tfidf: new Map(), // Calculé après IDF
                            book: row.book,
                            chapter: row.chapter,
                            verse: row.verse,
                        });
                    }
                }
                console.log(`  ✅ ${religiousTexts.length} textes religieux chargés`);
            } catch (e) {
                console.log("  ⚠️ Table religious_texts vide ou absente");
            }

            // 2. Charger les proverbes
            try {
                const proverbs = await db.getAllAsync(
                    "SELECT id, content, author, source, language FROM proverbs LIMIT 500"
                ) as any[];

                for (const row of proverbs) {
                    const tokens = extractTokens(row.content);
                    if (tokens.length > 0) {
                        docs.push({
                            id: `proverb_${row.id}`,
                            source: row.source || 'proverbe',
                            content: row.content,
                            tokens,
                            tfidf: new Map(),
                            author: row.author,
                            language: row.language,
                        });
                    }
                }
                console.log(`  ✅ ${proverbs.length} proverbes chargés`);
            } catch (e) {
                console.log("  ⚠️ Table proverbs vide ou absente");
            }

            // 3. Charger le dictionnaire
            try {
                const dictEntries = await db.getAllAsync(
                    "SELECT id, word, definition, language, source FROM dictionaries LIMIT 1000"
                ) as any[];

                for (const row of dictEntries) {
                    const text = `${row.word}: ${row.definition}`;
                    const tokens = extractTokens(text);
                    if (tokens.length > 0) {
                        docs.push({
                            id: `dict_${row.id}`,
                            source: `dictionnaire_${row.language}`,
                            content: text,
                            tokens,
                            tfidf: new Map(),
                            word: row.word,
                            language: row.language,
                        });
                    }
                }
                console.log(`  ✅ ${dictEntries.length} entrées dictionnaire chargées`);
            } catch (e) {
                console.log("  ⚠️ Table dictionaries vide ou absente");
            }

            // 4. Charger les encyclopédies
            try {
                const encyclopedias = await db.getAllAsync(
                    "SELECT id, title, content, category, source, language FROM encyclopedias LIMIT 500"
                ) as any[];

                for (const row of encyclopedias) {
                    const text = `${row.title}: ${row.content}`;
                    const tokens = extractTokens(text);
                    if (tokens.length > 0) {
                        docs.push({
                            id: `encyclo_${row.id}`,
                            source: row.source || 'encyclopédie',
                            content: text,
                            tokens,
                            tfidf: new Map(),
                            language: row.language,
                        });
                    }
                }
                console.log(`  ✅ ${encyclopedias.length} articles encyclopédiques chargés`);
            } catch (e) {
                console.log("  ⚠️ Table encyclopedias vide ou absente");
            }

            // 5. Calculer l'IDF global sur tout le corpus
            idfCache = calculateIDF(docs);
            console.log(`  📊 IDF calculé: ${idfCache.size} termes uniques`);

            // 5. Calculer TF-IDF pour chaque document
            for (const doc of docs) {
                doc.tfidf = calculateTFIDF(doc.tokens, idfCache);
            }

            documentCache = docs;
            isIndexed = true;

            const elapsed = Date.now() - startTime;
            console.log(`✅ RAG Index built: ${docs.length} documents indexed in ${elapsed}ms`);
        } catch (error) {
            console.error("❌ RAG: Failed to build index:", error);
            // On ne bloque pas l'app si l'indexation échoue
        } finally {
            isIndexing = false;
        }
    })();

    await indexingPromise;
};

// ================================================
// RECHERCHE SÉMANTIQUE VECTORIELLE
// ================================================

/**
 * Recherche sémantique par similarité cosinus TF-IDF
 * @param query - Texte de recherche de l'utilisateur
 * @param limit - Nombre max de résultats
 * @param minScore - Score minimum de pertinence (0-1)
 */
const semanticSearch = (query: string, limit: number = 5, minScore: number = 0.03): RAGResult[] => {
    const queryTokens = extractTokens(query);
    if (queryTokens.length === 0 || documentCache.length === 0) return [];

    const queryTFIDF = calculateTFIDF(queryTokens, idfCache);

    const results: { doc: IndexedDocument; score: number }[] = [];

    for (const doc of documentCache) {
        const score = cosineSimilarity(queryTFIDF, doc.tfidf);

        if (score > minScore) {
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
        book: r.doc.book,
        chapter: r.doc.chapter,
        verse: r.doc.verse,
        author: r.doc.author,
    }));
};

// ================================================
// POINT D'ENTRÉE PRINCIPAL - getRAGContext
// ================================================

/**
 * Récupère le contexte RAG vectoriel pour une requête utilisateur.
 * 
 * 1. Indexe le corpus au premier appel (lazy init)
 * 2. Effectue une recherche sémantique TF-IDF + cosinus
 * 3. Formate les résultats en contexte textuel pour le LLM/assistant
 */
export const getRAGContext = async (userQuery: string): Promise<string> => {
    try {
        // Lazy indexation au premier appel
        await buildIndex();

        const queryTokens = extractTokens(userQuery);
        console.log("🔍 RAG Vector Search — keywords:", queryTokens.slice(0, 5));

        if (queryTokens.length === 0) {
            return "";
        }

        // Recherche vectorielle par similarité cosinus
        const vectorResults = semanticSearch(userQuery, 5, 0.03);

        if (vectorResults.length === 0) {
            console.log("  📭 Aucun résultat vectoriel trouvé");
            return "";
        }

        console.log(`  📊 ${vectorResults.length} résultats trouvés (meilleur score: ${vectorResults[0].score.toFixed(3)})`);

        // Formater le contexte pour le LLM
        const context = vectorResults
            .map((row) => {
                if (row.book && row.chapter !== undefined && row.verse !== undefined) {
                    return `[${row.source} — ${row.book} ${row.chapter}:${row.verse}] ${row.content}`;
                }
                if (row.author) {
                    return `[${row.source} — ${row.author}] ${row.content}`;
                }
                return `[${row.source}] ${row.content}`;
            })
            .join("\n\n");

        return `Voici des ressources pertinentes:\n${context}`;
    } catch (error) {
        console.error("RAG Error:", error);
        return "";
    }
};

// ================================================
// API PUBLIQUE
// ================================================

/**
 * Force la reconstruction de l'index (utile après import de nouvelles données)
 */
export const rebuildRAGIndex = async (): Promise<void> => {
    isIndexed = false;
    documentCache = [];
    idfCache = new Map();
    await buildIndex();
};

/**
 * Retourne des stats sur l'index RAG
 */
export const getRAGStats = () => ({
    isIndexed,
    documentCount: documentCache.length,
    vocabularySize: idfCache.size,
    sources: {
        religious: documentCache.filter(d => d.id.startsWith('religious_')).length,
        proverbs: documentCache.filter(d => d.id.startsWith('proverb_')).length,
        dictionary: documentCache.filter(d => d.id.startsWith('dict_')).length,
    }
});

/**
 * Exporte les fonctions utilitaires pour les tests
 */
export const ragUtils = {
    extractKeywords: extractTokens,
    calculateTF,
    calculateTFIDF,
    cosineSimilarity,
    semanticSearch,
    buildIndex,
    getRAGStats,
};
