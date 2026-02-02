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

    // Import dynamique pour éviter les cycles si nécessaire, ou utiliser l'import déjà présent si possible
    const { moodClassifier } = require('./moodClassifier');

    // 1. Analyse de l'humeur avec le classifieur avancé
    const moodResult = moodClassifier.classify(prompt);
    const dominantEmotion = moodResult.dominantEmotion;
    const moodLevel = moodResult.mood; // 'very_bad', 'bad', 'neutral', 'good', 'very_good'

    // 2. Sélection d'une réponse empathique basée sur l'humeur
    let empathicResponse = "";
    switch (dominantEmotion) {
        case 'sadness':
        case 'depression':
            empathicResponse = "Je sens beaucoup de tristesse. N'oubliez pas que vous n'êtes pas seul.";
            break;
        case 'anxiety':
        case 'stress':
        case 'fear':
            empathicResponse = "L'anxiété peut être envahissante. Prenons un moment pour respirer ensemble.";
            break;
        case 'anger':
        case 'frustration':
            empathicResponse = "C'est normal de ressentir de la colère. Essayons de comprendre ce qui vous touche.";
            break;
        case 'joy':
        case 'happiness':
            empathicResponse = "Quelle belle énergie ! C'est merveilleux de vous sentir ainsi.";
            break;
        case 'neutral':
        default:
            empathicResponse = "Je vous écoute. Dites-m'en plus.";
            break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Construction de la réponse finale
    let finalResponse = `[MOCK] (Emotion: ${dominantEmotion})\n\n${empathicResponse}`;

    if (context && context.length > 0) {
        finalResponse += `\n\n📚 Voici ce que j'ai trouvé pour vous aider :\n${context}`;
    } else {
        finalResponse += `\n\n(Je n'ai pas trouvé de textes spécifiques, mais je suis là pour vous.)`;
    }

    return {
        mood: dominantEmotion,
        response: finalResponse,
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

// --- WEB (Backend Proxy) ---
const webGenerate = async (prompt: string, context: string): Promise<AIResponse> => {
    try {
        // On importe api ici pour éviter les cycles d'imports circulaires si api.ts importe llm.ts
        const { default: api } = require('./api');

        console.log("🌐 [WEB MODE] Calling Backend AI...");

        // On envoie le prompt + contexte au backend qui gère (Groq/OpenAI/etc.)
        const response = await api.post('/ai/chat', {
            messages: [
                { role: "system", content: `Tu es un assistant bienveillant. Utilise ce contexte si utile: ${context}` },
                { role: "user", content: prompt }
            ],
            model: "llama3-8b-8192"
        });

        return {
            mood: "backend_ai",
            response: response.data.response,
            sources: []
        };
    } catch (error) {
        console.warn("⚠️ Backend AI failed (Missing Key?), falling back to Smart Mock", error);
        return await mockGenerate(prompt, context);
    }
};

export const generatePositiveContent = async (
    userInput: string
): Promise<AIResponse | null> => {
    try {
        const context = await getRAGContext(userInput);

        // 1. Android Native (Offline Llama)
        if (LlamaContext && Platform.OS === 'android') {
            return await nativeGenerate(userInput, context);
        }

        // 2. Web (Backend API -> Groq)
        if (Platform.OS === 'web') {
            return await webGenerate(userInput, context);
        }

        // 3. Fallback (iOS/Other) -> Smart Mock
        return await mockGenerate(userInput, context);

    } catch (error) {
        console.error("LLM Error:", error);
        return null;
    }
};
