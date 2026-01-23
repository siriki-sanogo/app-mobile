import { searchReligiousTexts } from "./database";

// Liste de mots vides (stop words) basique pour le français
const STOP_WORDS = new Set([
    "le", "la", "les", "un", "une", "des", "du", "de", "d", "l",
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
    "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
    "ce", "cet", "cette", "ces",
    "et", "ou", "mais", "donc", "or", "ni", "car",
    "est", "sont", "suis", "es", "ai", "as", "a", "ont",
    "qui", "que", "quoi", "dont", "où", "comment", "pourquoi",
    "pour", "par", "dans", "avec", "sans", "sur", "sous",
    "me", "te", "se", "y", "en", "moi", "toi", "lui"
]);

const extractKeywords = (text: string): string[] => {
    return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ") // Supprimer la ponctuation
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

export const getRAGContext = async (userQuery: string): Promise<string> => {
    try {
        // 1. Extraire les mots clés
        const keywords = extractKeywords(userQuery);
        console.log("RAG Keywords extracted:", keywords);

        if (keywords.length === 0) {
            return "";
        }

        // 2. Chercher pour chaque mot clé important (simulé par OR via boucle pour MVP)
        // On prend les 3 premiers mots clés max pour ne pas spammer la DB
        const topKeywords = keywords.slice(0, 3);
        let allResults: any[] = [];

        for (const word of topKeywords) {
            const results = await searchReligiousTexts(word);
            allResults = [...allResults, ...results];
        }

        // Dédupliquer par ID
        const uniqueResults = Array.from(
            new Map(allResults.map((item) => [item.id, item])).values() // item.id suppose que la DB a une colonne id
        ).slice(0, 3); // Garder top 3

        if (uniqueResults.length === 0) {
            return "";
        }

        // 3. Formater le contexte
        const context = uniqueResults
            .map(
                (row) =>
                    `[${row.source} - ${row.book} ${row.chapter}:${row.verse}] ${row.content}`
            )
            .join("\n\n");

        return `Voici des textes religieux qui pourraient aider :\n${context}`;
    } catch (error) {
        console.error("Error retrieving RAG context:", error);
        return "";
    }
};
