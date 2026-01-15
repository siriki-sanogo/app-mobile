export const API_URLS = {
    dictionary: "https://api.dictionaryapi.dev/api/v2/entries/fr/",
    quran: "http://api.alquran.cloud/v1/search/",
    bible: "https://bolls.life/get-text/LSV/"
};

export interface ApiResult {
    source: string;
    title: string;
    description: string;
    data: any; // Raw data to store if needed
}

// 1. Dictionary Search (FR & EN)
export const searchDictionary = async (word: string): Promise<ApiResult[]> => {
    try {
        const urls = [
            `https://api.dictionaryapi.dev/api/v2/entries/fr/${word}`,
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        ];

        const responses = await Promise.all(urls.map(url => fetch(url).then(r => r.ok ? r.json() : null)));
        const results: ApiResult[] = [];

        responses.forEach((data, index) => {
            if (Array.isArray(data)) {
                const lang = index === 0 ? "FR" : "EN";
                data.forEach((entry: any) => {
                    entry.meanings.forEach((meaning: any) => {
                        meaning.definitions.forEach((def: any) => {
                            results.push({
                                source: "dictionary",
                                title: `${entry.word} (${lang})`,
                                description: `(${meaning.partOfSpeech}) ${def.definition}`,
                                data: entry
                            });
                        });
                    });
                });
            }
        });

        return results;
    } catch (e) {
        console.error("Dictionary API Error", e);
        return [];
    }
};

// 2. Quran Search
export const searchQuran = async (query: string): Promise<ApiResult[]> => {
    try {
        // Search in French translation (Edition 'fr.hamidullah' is standard)
        const response = await fetch(`${API_URLS.quran}${query}/all/fr.hamidullah`);
        if (!response.ok) return [];
        const json = await response.json();

        if (json.status !== "OK") return [];

        return json.data.matches.map((match: any) => ({
            source: "coran",
            title: `Sourate ${match.surah.name} (${match.surah.number}:${match.numberInSurah})`,
            description: match.text,
            data: match
        }));

    } catch (e) {
        console.error("Quran API Error", e);
        return [];
    }
}

// 3. Unified Search
export const searchOnline = async (query: string, category?: string) => {
    let results: ApiResult[] = [];

    // Run in parallel if category is all
    const promises = [];

    if (!category || category === 'all' || category === 'dictionary') {
        promises.push(searchDictionary(query));
    }
    if (!category || category === 'all' || category === 'coran') {
        promises.push(searchQuran(query));
    }

    const responses = await Promise.all(promises);
    responses.forEach(r => results = [...results, ...r]);

    return results;
};

// 4. AI Assistant (Hugging Face)
// NOTE: You need a free API Key from https://huggingface.co/settings/tokens
const HF_API_KEY = ""; // <--- INSERT KEY HERE
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

import { generateOfflineResponse } from "../utils/offlineAI";

export const fetchAIResponse = async (prompt: string, profile: any, language: "fr" | "en") => {
    // STRATEGY: Hybrid approach.
    // 1. Check Offline Logic first for specific intents (Crisis, heavy emotions) that have pre-defined Actions.
    //    If the Offline engine finds a strong match with Actions, we prefer that (or mix it).
    //    The user explicitly mentioned missing buttons, which come from the offline logic.

    const offlineResult = await generateOfflineResponse(prompt, profile, language);

    // If offline result has specific actions, it means it detected a significant intent.
    // We should probably prioritize this to ensure the Buttons appear and the therapeutic text is used.
    if (offlineResult.actions && offlineResult.actions.length > 0) {
        console.log("Intent detected by Offline Engine. Using Offline response to ensure Actions appear.");
        return offlineResult;
    }

    // 2. If no specific triggered intent, try Online API for more dynamic conversation.
    if (!HF_API_KEY) {
        console.warn("No Hugging Face API Key set. Falling back to offline.");
        return offlineResult;
    }

    try {
        const systemPrompt = language === 'fr'
            ? `Tu es un assistant bienveillant nommé 'Guide' qui aide l'utilisateur (${profile?.name || 'Ami'}) avec sagesse, religion et psychologie. Réponds de manière courte et empathique.`
            : `You are a benevolent assistant named 'Guide' helping user (${profile?.name || 'Friend'}) with wisdom, religion and psychology. Keep answers short and empathetic.`;

        const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: `<s>[INST] ${systemPrompt} ${prompt} [/INST]`,
                parameters: { max_new_tokens: 250, temperature: 0.7 }
            })
        });

        if (!response.ok) return offlineResult; // Fallback to offline if API fails

        const json = await response.json();
        // HF returns [{ generated_text: "..." }]
        if (Array.isArray(json) && json.length > 0) {
            let answer = json[0].generated_text;
            // Clean up prompt from answer if included
            if (answer.includes("[/INST]")) {
                answer = answer.split("[/INST]")[1].trim();
            }
            // Return Online Text but potentially with Offline Actions (if we want to mix? For now, just Text)
            // If we want "general" actions, we could add them, but for now let's stick to text.
            return { text: answer, actions: [] };
        }
        return offlineResult;

    } catch (e) {
        console.error("AI API Error", e);
        return offlineResult;
    }
};
