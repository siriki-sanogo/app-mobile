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

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

// État du contexte Llama (singleton)
let contextInstance: any = null;

// --- MOCK (Fallback enrichi — Moteur thérapeutique local) ---
const mockGenerate = async (prompt: string, context: string, language: string = 'fr'): Promise<AIResponse> => {
    console.log("🤖 Local AI Inference");

    const { moodClassifier } = require('./moodClassifier');

    // 1. Analyse de l'humeur
    const moodResult = moodClassifier.classify(prompt);
    const dominantEmotion = moodResult.dominantEmotion;

    // 2. Détection de SUJET/THÈME (en plus de l'émotion)
    const lowerPrompt = prompt.toLowerCase();
    const detectTopic = (text: string): string | null => {
        const topicKeywords: Record<string, string[]> = {
            spirituality: ['prière', 'prières', 'prier', 'dieu', 'allah', 'spirituel', 'spirituelle',
                'spirituellement', 'foi', 'croyance', 'religion', 'religieux', 'âme', 'mosquée',
                'église', 'bible', 'coran', 'sourate', 'verset', 'méditer', 'jeûne', 'ramadan',
                'salat', 'prayer', 'faith', 'god', 'soul', 'worship', 'church', 'mosque'],
            motivation: ['démotivé', 'démotivée', 'motivation', 'motivé', 'découragé', 'découragement',
                'abandon', 'abandonner', 'baisser les bras', 'plus envie', 'sens de la vie', 'objectif',
                'avancer', 'purpose', 'unmotivated', 'give up', 'pointless', 'no motivation'],
            relationships: ['famille', 'couple', 'amitié', 'relation', 'dispute',
                'conflit', 'parents', 'enfants', 'mari', 'femme', 'copain', 'copine', 'rupture',
                'trahison', 'friend', 'family', 'relationship', 'breakup'],
            sleep: ['dormir', 'sommeil', 'insomnie', 'cauchemar', 'fatigue', 'épuisé',
                'fatigué', 'sleep', 'nightmare', 'insomnia', 'exhausted'],
            health: ['maladie', 'malade', 'santé', 'douleur', 'souffrir', 'physique',
                'sick', 'pain', 'health', 'illness'],
        };

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(kw => {
                // Use word boundary matching for short keywords to avoid false positives
                if (kw.length <= 4) {
                    const regex = new RegExp(`\\b${kw}\\b`, 'i');
                    return regex.test(text);
                }
                return text.includes(kw);
            })) {
                return topic;
            }
        }
        return null;
    };

    const detectedTopic = detectTopic(lowerPrompt);
    console.log(`  🎯 Émotion: ${dominantEmotion} | Sujet: ${detectedTopic || 'général'}`);

    // 3. Réponses par SUJET
    const topicResponsesFr: Record<string, string[]> = {
        spirituality: [
            "La spiritualité est un chemin personnel et profond. Comme le dit le Coran : « N'est-ce point par le souvenir de Dieu que se tranquillisent les cœurs ? » (Sourate 13:28). Qu'est-ce qui nourrit votre vie spirituelle ?",
            "La foi peut être un ancrage puissant dans les moments difficiles. Prenez un instant pour respirer profondément et vous connecter à ce qui est sacré pour vous.",
            "La prière ou la méditation sont des outils thérapeutiques reconnus scientifiquement pour réduire l'anxiété et renforcer la résilience. Pratiquez-vous régulièrement ?",
        ],
        motivation: [
            "Quand la motivation manque, la discipline prend le relais. Mais plutôt que de forcer, commencez par une micro-action de 2 minutes. Le cerveau a besoin de petites victoires pour relancer le circuit de la récompense.",
            "La perte de motivation est souvent liée à un objectif trop vague ou trop grand. Technique : découpez votre objectif en 3 étapes simples. Concentrez-vous uniquement sur la première. Un pas à la fois.",
            "Je comprends ce sentiment de vide motivationnel. Comme le dit la sagesse africaine : « Celui qui avance lentement finit toujours par dépasser celui qui reste assis. » Quel est le plus petit pas que vous pourriez faire ?",
        ],
        relationships: [
            "Les relations humaines sont au cœur de notre bien-être. Quand elles sont difficiles, c'est toute notre vie qui est affectée. Pouvez-vous me dire ce qui se passe ? Je suis là pour vous écouter sans jugement.",
            "Les conflits relationnels sont douloureux mais normaux. La communication non-violente nous enseigne : exprimez ce que vous ressentez (pas ce que l'autre fait), ce dont vous avez besoin, et ce que vous demandez concrètement.",
        ],
        sleep: [
            "Le sommeil est fondamental pour le bien-être mental. Quelques conseils d'hygiène du sommeil : maintenez des horaires réguliers, évitez les écrans 1h avant le coucher, créez un rituel de détente.",
            "Les troubles du sommeil sont souvent liés au stress. Un exercice pour mieux dormir : la relaxation progressive. Allongé, contractez puis relâchez chaque groupe musculaire.",
        ],
        health: [
            "Votre santé physique et mentale sont interconnectées. N'hésitez pas à consulter un professionnel. En attendant, qu'est-ce qui pourrait vous soulager aujourd'hui ?",
            "Prendre soin de sa santé, c'est aussi prendre soin de son moral. Que vous dit votre corps en ce moment ?",
        ],
    };

    const topicResponsesEn: Record<string, string[]> = {
        spirituality: [
            "Spirituality is a deeply personal journey. As the Quran says: 'Verily, in the remembrance of God do hearts find rest' (13:28). What nourishes your spiritual life?",
            "Faith can be a powerful anchor in difficult times. Take a moment to breathe deeply and connect with what is sacred to you.",
            "Prayer and meditation are scientifically recognized tools for reducing anxiety and building resilience. Do you practice regularly?",
        ],
        motivation: [
            "When motivation is lacking, discipline takes over. But rather than forcing it, start with a micro-action of just 2 minutes. Your brain needs small wins to restart its reward circuit.",
            "Loss of motivation is often linked to a goal that's too vague or too big. Try breaking your goal into 3 simple steps. Focus only on the first one. One step at a time.",
            "I understand that feeling of emptiness. As African wisdom says: 'The one who walks slowly always ends up passing the one who sits still.' What's the smallest step you could take?",
        ],
        relationships: [
            "Human relationships are at the heart of our well-being. When they're difficult, our whole life is affected. Can you tell me what's going on? I'm here to listen without judgment.",
            "Relationship conflicts are painful but normal. Non-violent communication teaches us: express what you feel (not what the other person does), what you need, and what you're concretely asking for.",
        ],
        sleep: [
            "Sleep is fundamental for mental well-being. Some sleep hygiene tips: maintain regular hours, avoid screens 1 hour before bed, create a relaxation ritual.",
            "Sleep issues are often linked to stress. Try progressive muscle relaxation: lie down, tense then release each muscle group from feet to head.",
        ],
        health: [
            "Your physical and mental health are interconnected. Don't hesitate to consult a professional. In the meantime, what could bring you relief today?",
            "Taking care of your health means taking care of your mood too. What is your body telling you right now?",
        ],
    };

    const topicResponses = language === 'en' ? topicResponsesEn : topicResponsesFr;

    // 4. Réponses par ÉMOTION (fallback si pas de sujet détecté)
    const emotionResponsesFr: Record<string, string[]> = {
        sadness: [
            "Je perçois de la tristesse dans vos mots. C'est une émotion valide et naturelle. Permettez-vous de la ressentir sans jugement.",
            "La tristesse fait partie du spectre des émotions humaines. Posez une main sur votre cœur et respirez profondément trois fois.",
            "Votre ressenti est important. Partager ses émotions est un premier pas vers le mieux-être. Vous n'êtes pas seul(e).",
        ],
        depression: [
            "Ce que vous décrivez semble très lourd à porter. Si ces sentiments persistent, je vous encourage à consulter un professionnel. Essayez la technique d'ancrage 5-4-3-2-1.",
            "La dépression n'est pas une faiblesse — c'est une condition qui se traite. Même un petit pas aujourd'hui peut faire une différence.",
        ],
        anxiety: [
            "L'anxiété peut être envahissante, mais elle est gérable. Respiration carrée : inspirez 4s, retenez 4s, expirez 4s, retenez 4s. Répétez 4 fois.",
            "Votre corps réagit à une menace perçue. Concentrez-vous sur vos pieds posés au sol. Vous êtes ici, maintenant, en sécurité.",
        ],
        stress: [
            "Le stress peut sembler accablant, mais vous avez les ressources pour y faire face. Quelle est la chose la plus importante dans les 30 prochaines minutes ?",
            "Décomposer un gros problème en petites étapes gérables transforme l'accablement en plan d'action. Par quoi commencer ?",
        ],
        anger: [
            "La colère signale qu'une limite a été franchie. Règle des 90 secondes : physiologiquement, une émotion dure 90 secondes. Respirez et observez-la passer.",
            "La colère a souvent une émotion cachée dessous — de la tristesse, de la peur, ou de l'injustice ressentie. Qu'est-ce qui se cache derrière ?",
        ],
        frustration: [
            "La frustration naît souvent de l'écart entre nos attentes et la réalité. Peut-on explorer ensemble comment adapter votre approche ?",
        ],
        joy: [
            "Quelle belle énergie ! Savourer consciemment les moments de joie amplifie leur effet. Prenez un instant pour vraiment ressentir ce bonheur.",
        ],
        happiness: [
            "Votre bonheur rayonne ! La gratitude renforce les circuits neuronaux du bien-être.",
        ],
        neutral: [
            "Je suis là pour vous accompagner. Qu'est-ce qui vous préoccupe ou que souhaitez-vous explorer ensemble ?",
            "Comment vous sentez-vous sur une échelle de 1 à 10 ? Parfois, évaluer notre état émotionnel aide à mieux se comprendre.",
        ],
    };

    const emotionResponsesEn: Record<string, string[]> = {
        sadness: [
            "I sense sadness in your words. It's a valid and natural emotion. Allow yourself to feel it without judgment.",
            "Sadness is part of the spectrum of human emotions. Place a hand on your heart and take three deep breaths.",
            "Your feelings matter. Sharing your emotions is a first step toward feeling better. You are not alone.",
        ],
        depression: [
            "What you're describing sounds very heavy to carry. If these feelings persist, I encourage you to consult a professional. Try the 5-4-3-2-1 grounding technique.",
            "Depression is not a weakness — it's a condition that can be treated. Even a small step today can make a difference.",
        ],
        anxiety: [
            "Anxiety can be overwhelming, but it's manageable. Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.",
            "Your body is reacting to a perceived threat. Focus on your feet on the ground. You are here, now, and safe.",
        ],
        stress: [
            "Stress can feel overwhelming, but you have the resources to face it. What's the most important thing you can do in the next 30 minutes?",
            "Breaking a big problem into small manageable steps turns overwhelm into an action plan. Where would you like to start?",
        ],
        anger: [
            "Anger signals that a boundary has been crossed. The 90-second rule: physiologically, an emotion lasts 90 seconds. Breathe and observe it pass.",
            "Anger often hides another emotion underneath — sadness, fear, or a sense of injustice. What's hiding behind it?",
        ],
        frustration: [
            "Frustration often comes from the gap between our expectations and reality. Can we explore together how to adapt your approach?",
        ],
        joy: [
            "What wonderful energy! Consciously savoring moments of joy amplifies their effect. Take a moment to truly feel this happiness.",
        ],
        happiness: [
            "Your happiness is radiant! Gratitude strengthens the brain's well-being circuits.",
        ],
        neutral: [
            "I'm here for you. What's on your mind, or what would you like to explore together?",
            "How are you feeling on a scale of 1 to 10? Sometimes just evaluating our emotional state helps us understand ourselves better.",
        ],
    };

    const emotionResponses = language === 'en' ? emotionResponsesEn : emotionResponsesFr;

    // 5. Sélection intelligente : sujet d'abord, émotion ensuite
    let selectedResponse: string;
    if (detectedTopic && topicResponses[detectedTopic]) {
        const topicBank = topicResponses[detectedTopic];
        selectedResponse = topicBank[Math.floor(Math.random() * topicBank.length)];
    } else {
        // Map mood classifier categories to available response banks
        const emotionMap: Record<string, string> = {
            loneliness: 'sadness',
            fear: 'anxiety',
            fatigue: 'stress',
            pain: 'sadness',
            crisis: 'depression',
        };
        const mappedEmotion = emotionMap[dominantEmotion] || dominantEmotion;
        const emotionBank = emotionResponses[mappedEmotion] || emotionResponses['neutral'];
        selectedResponse = emotionBank[Math.floor(Math.random() * emotionBank.length)];
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    // 6. Construction de la réponse finale
    let finalResponse = selectedResponse;

    if (context && context.length > 0) {
        finalResponse += `\n\n${context}`;
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
            console.log("Loading model from native Android assets...");
            contextInstance = await LlamaContext.createContext({
                model: "model.gguf",
                is_model_asset: true,
            });
        } else {
            throw new Error("Native inference only supported on Android");
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
        const systemPrompt = `Tu es un assistant bienveillant spécialisé en bien-être mental. Utilise le contexte pour répondre avec empathie et propose des techniques concrètes.`;
        const fullPrompt = `System: ${systemPrompt}\n\nContext: ${context}\n\nUser: ${prompt}\n\nAssistant:`;

        const { text } = await ctx.completion({
            prompt: fullPrompt,
            n_predict: 250,
            stop: ["User:", "Assistant:", "System:"],
        }, (_data: any) => { });

        return {
            mood: "analysed_by_llm",
            response: text.trim(),
            sources: []
        };
    } catch (e) {
        console.error("Native Inference Failed:", e);
        return mockGenerate(prompt, context);
    }
};

const webGenerate = async (
    prompt: string,
    context: string,
    history: ChatMessage[] = [],
    profile?: any,
    language: string = 'fr'
): Promise<AIResponse> => {
    try {
        const { default: api } = require('./api');

        console.log("🌐 Calling Backend AI (Groq Llama 3.3 70B)...");

        const userName = profile?.name || (language === 'en' ? "friend" : "ami(e)");

        const systemPrompt = language === 'en'
            ? `You are a warm and empathetic assistant named "Good App", specialized in mental well-being and personal development.
You are speaking to ${userName}. You use an approach inspired by Cognitive Behavioral Therapy (CBT), positive psychology, and African & religious wisdom.

Your personality:
- Warm, caring, and always kind
- You remember what the user said in the conversation and refer back to it
- You ask open-ended questions to better understand
- You suggest concrete techniques when appropriate (breathing, grounding, gratitude, mindfulness)
- You integrate wisdom from different cultures (African proverbs, religious verses) when relevant
- Warm responses of 2-4 sentences maximum. No bullet points. Speak naturally like a caring friend.
- You always give hope without minimizing suffering
- You NEVER give medical diagnoses
- You MUST respond in English unless the user explicitly writes in another language

${context ? `Relevant context from the knowledge base:\n${context}` : ''}`
            : `Tu es un assistant bienveillant et empathique nommé "Good App", spécialisé en bien-être mental et développement personnel.
Tu parles à ${userName}. Tu adoptes une approche inspirée de la Thérapie Cognitivo-Comportementale (TCC), de la psychologie positive et de la sagesse africaine et religieuse.

Ta personnalité :
- Chaleureux, attentionné et toujours bienveillant
- Tu te souviens de ce que l'utilisateur a dit dans la conversation et tu y fais référence
- Tu poses des questions ouvertes pour mieux comprendre
- Tu proposes des techniques concrètes quand c'est approprié (respiration, ancrage, gratitude, mindfulness)
- Tu intègres la sagesse de différentes cultures (proverbes africains, versets religieux) quand c'est pertinent
- Réponses chaleureuses de 2-4 phrases maximum. Pas de listes à puces. Parle naturellement comme un ami bienveillant.
- Tu donnes toujours de l'espoir sans minimiser la souffrance
- Tu ne donnes JAMAIS de diagnostic médical
- Tu DOIS répondre en français sauf si l'utilisateur écrit explicitement dans une autre langue

${context ? `Contexte pertinent de la base de connaissances :\n${context}` : ''}`;

        //  Build messages with history
        const messages: { role: string; content: string }[] = [
            { role: "system", content: systemPrompt },
        ];

        // Add last 10 messages of conversation history
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            messages.push({ role: msg.role, content: msg.content });
        }

        // Add current user message
        messages.push({ role: "user", content: prompt });

        const response = await api.post('/ai/chat', {
            messages,
            model: "llama-3.3-70b-versatile"
        });

        return {
            mood: "backend_ai",
            response: response.data.response,
            sources: []
        };
    } catch (error) {
        console.warn("⚠️ Backend AI unavailable, using local AI", error);
        return await mockGenerate(prompt, context, language);
    }
};

export const generatePositiveContent = async (
    userInput: string,
    history: ChatMessage[] = [],
    profile?: any,
    language: string = 'fr'
): Promise<AIResponse | null> => {
    try {
        const context = await getRAGContext(userInput);

        // 1. Essayer le backend Groq (toutes plateformes, nécessite internet)
        try {
            const groqResult = await webGenerate(userInput, context, history, profile, language);
            if (groqResult && groqResult.mood === "backend_ai") {
                return groqResult; // Groq a répondu avec succès
            }
        } catch (_e) {
            console.log("Groq unavailable, trying next option...");
        }

        // 2. Android Native (Offline Llama — si modèle GGUF présent)
        if (LlamaContext && Platform.OS === 'android') {
            return await nativeGenerate(userInput, context);
        }

        // 3. Moteur thérapeutique local enrichi (toujours disponible)
        return await mockGenerate(userInput, context, language);

    } catch (error) {
        console.error("LLM Error:", error);
        return null;
    }
};
