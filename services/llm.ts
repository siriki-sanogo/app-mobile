import { getRAGContext } from "./rag";
import { Platform } from "react-native";

// On tente d'importer llama.rn de manière conditionnelle ou on gère l'erreur
// NOTE: llama.rn ne marchera que dans un build natif (Development Build)
let LlamaContext: any;
try {
    const llama = require('llama.rn');
    LlamaContext = llama.LlamaContext;
} catch (e) {
    console.log("Llama.rn not available (Simulating for Expo Go/Web)");
}

export interface AIResponse {
    mood: string;
    response: string;
    sources?: string[];
}

// État du contexte Llama (singleton)
let contextInstance: any = null;

// --- MOCK (Fallback) ---
const mockGenerate = async (prompt: string, context: string): Promise<AIResponse> => {
    console.log("⚠️ [MOCK MODE] LLM Inference");
    const lowerPrompt = prompt.toLowerCase();
    let detectedMood = "neutre";

    if (lowerPrompt.includes("triste") || lowerPrompt.includes("mal") || lowerPrompt.includes("peur")) {
        detectedMood = "triste";
    } else if (lowerPrompt.includes("joie") || lowerPrompt.includes("heureux") || lowerPrompt.includes("bien")) {
        detectedMood = "joyeux";
    } else if (lowerPrompt.includes("colère") || lowerPrompt.includes("énervé")) {
        detectedMood = "colère";
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
        mood: detectedMood,
        response: context.length > 0
            ? `[MOCK] J'ai détecté : ${detectedMood}.\n\nPour vous aider :\n\n${context}`
            : `[MOCK] J'ai détecté : ${detectedMood}.\n\nGardez espoir.`,
        sources: [],
    };
};

// --- REAL LLAMA (Native) ---
const initLlama = async () => {
    if (contextInstance) return contextInstance;
    if (!LlamaContext) throw new Error("Llama.rn module not loaded");

    console.log("Initializing Llama Context...");

    try {
        if (Platform.OS === 'android') {
            // Sur Android, on utilise directement le fichier dans android/app/src/main/assets
            // sans passer par le bundler JS (car le fichier est trop gros : 1GB+)
            console.log("Loading model from native Android assets...");
            contextInstance = await LlamaContext.createContext({
                model: "model.gguf",
                is_model_asset: true,
            });
        } else {
            throw new Error("Native inference only supported on Android for now");
        }
        return contextInstance;
    } catch (error) {
        console.error("Failed to load model asset:", error);
        throw error;
    }
};

const nativeGenerate = async (prompt: string, context: string): Promise<AIResponse> => {
    try {
        const ctx = await initLlama();

        const systemPrompt = "Tu es un assistant bienveillant et sage. Utilise le contexte suivant pour répondre courtement.";
        const fullPrompt = `<s>[INST] ${systemPrompt}\nContexte: ${context}\nQuestion: ${prompt} [/INST]`;

        const { text } = await ctx.completion({
            prompt: fullPrompt,
            n_predict: 200,
            stop: ["</s>", "User:", "Assistant:"],
        }, (data: any) => {
            // Callback pour le stream (optionnel)
            // console.log("Token:", data.token);
        });

        return {
            mood: "analysed_by_llm", // On pourrait demander au LLM de sortir le mood en JSON
            response: text.trim(),
            sources: []
        };
    } catch (e) {
        console.error("Native Inference Failed:", e);
        return mockGenerate(prompt, context); // Fallback si le modèle crash
    }
};

export const generatePositiveContent = async (
    userInput: string
): Promise<AIResponse | null> => {
    try {
        const context = await getRAGContext(userInput);

        // Si LlamaContext est dispo et qu'on n'est pas sur Web, on tente le natif
        if (LlamaContext && Platform.OS !== 'web') {
            return await nativeGenerate(userInput, context);
        } else {
            return await mockGenerate(userInput, context);
        }
    } catch (error) {
        console.error("LLM Error:", error);
        return null; // Return null to allow fallback to keyword-based offline AI
    }
};
