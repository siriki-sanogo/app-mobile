/**
 * Offline AI Engine for GOOD APP
 * Provides immediate therapeutic responses based on keyword analysis.
 * Operates 100% offline.
 */

interface ResponsePattern {
    keywords: string[];
    responses: string[];
}

// Database of therapeutic responses
const KNOWLEDGE_BASE: {
    fr: ResponsePattern[];
    en: ResponsePattern[]
} = {
    fr: [
        {
            keywords: ["bonjour", "salut", "hello", "coucou", "hi"],
            responses: [
                "Bonjour ! Je suis là pour vous écouter. Comment vous sentez-vous en ce moment ?",
                "Salut ! Je suis ravie de vous retrouver. Qu'est-ce qui vous préoccupe aujourd'hui ?",
                "Bonjour. Je suis à votre écoute. Voulez-vous parler de ce que vous ressentez ?",
            ],
        },
        {
            keywords: ["triste", "tristesse", "pleurer", "chagrin", "déprime", "malheureux", "malheureuse"],
            responses: [
                "Je sens beaucoup de tristesse dans vos mots. C'est normal de ressentir cela. Voulez-vous m'expliquer ce qui a déclenché ce sentiment ?",
                "La tristesse est une émotion lourde à porter. Prenez le temps de l'accueillir. Je suis là pour vous accompagner.",
                "Il est important d'exprimer cette tristesse. Pleurer peut parfois soulager. Je suis là avec vous.",
            ],
        },
        {
            keywords: ["stress", "stressé", "pression", "tendu", "nerveux", "surmené"],
            responses: [
                "Le stress semble intense. Essayons de respirer ensemble. Inspirez profondément... et expirez doucement. Comment cela se passe-t-il dans votre corps ?",
                "Je comprends que vous soyez sous pression. Qu'est-ce qui vous stresse le plus en ce moment précis ?",
                "Le stress est une réaction normale, mais fatigante. Avez-vous pu prendre un petit moment pour vous aujourd'hui ?",
            ],
        },
        {
            keywords: ["angoisse", "panique", "peur", "anxieux", "anxieuse", "tremble"],
            responses: [
                "Je suis là. Vous êtes en sécurité ici. Essayons de nous ancrer : pouvez-vous nommer 3 objets autour de vous ?",
                "L'angoisse est une vague qui finit par passer. Respirez calmement. Je reste avec vous jusqu'à ce que ça aille mieux.",
                "C'est effrayant, je sais. Mais ce n'est qu'une émotion, elle ne peut pas vous faire de mal. Concentrez-vous sur ma voix (ou ce message).",
            ],
        },
        {
            keywords: ["fatigue", "fatigué", "épuisé", "dormir", "sommeil", "insomnie"],
            responses: [
                "La fatigue pèse sur le moral. Avez-vous réussi à dormir un peu dernièrement ?",
                "Il semble que votre corps réclame du repos. Est-ce possible pour vous de faire une pause, même courte ?",
                "L'épuisement émotionnel est réel. Soyez doux avec vous-même aujourd'hui. Ne vous en demandez pas trop.",
            ],
        },
        {
            keywords: ["colère", "énervé", "fâché", "haine", "rage", "injuste"],
            responses: [
                "Je sens de la colère. C'est une émotion qui dit souvent qu'une limite a été franchie. Voulez-vous me dire ce qui vous révolte ?",
                "La colère a besoin de sortir. Vous avez le droit d'être fâché(e). Expliquez-moi ce qui s'est passé.",
                "C'est frustrant, je comprends. Mettre des mots sur cette colère peut aider à la faire redescendre.",
            ],
        },
        {
            keywords: ["merci", "remercier", "gentil", "aide"],
            responses: [
                "Je vous en prie. Je suis heureuse d'avoir pu vous apporter un peu de soutien.",
                "C'est moi qui vous remercie de votre confiance. Prenez soin de vous.",
                "Je suis là pour ça. N'hésitez pas à revenir si vous en avez besoin.",
            ],
        },
        {
            keywords: ["suicide", "mourir", "finir", "tuer", "mort"],
            responses: [
                "Je perçois une grande souffrance. Si vous vous sentez en danger immédiat, s'il vous plaît, appelez les secours ou parlez à un proche maintenant. Vous n'êtes pas seul(e).",
                "Vos paroles m'inquiètent. Je suis une IA, mais il existe des personnes réelles prêtes à vous aider tout de suite. Voulez-vous les numéros d'urgence ?",
                "La douleur est intense, mais elle est temporaire. S'il vous plaît, ne restez pas seul(e) avec ces pensées noires.",
            ],
        },
        {
            keywords: ["seul", "solitude", "personne", "isolé"],
            responses: [
                "La solitude peut être très douloureuse. Même si je suis virtuelle, je suis là pour vous écouter. Vous connectez-vous avec moi est déjà un pas.",
                "Se sentir seul ne veut pas dire que vous l'êtes vraiment. Y a-t-il quelqu'un à qui vous pourriez envoyer un message aujourd'hui ?",
                "Je suis là. Parlons un peu. De quoi aimeriez-vous discuter pour vous changer les idées ?",
            ],
        },
    ],
    en: [
        {
            keywords: ["bonjour", "salut", "hello", "coucou", "hi", "hey"],
            responses: [
                "Hello! I'm here to listen. How are you feeling right now?",
                "Hi there! Glad to see you. What's on your mind today?",
                "Hello. I'm listening. Would you like to talk about how you feel?",
            ],
        },
        {
            keywords: ["sad", "sadness", "cry", "crying", "unhappy", "depressed"],
            responses: [
                "I sense a lot of sadness in your words. It's okay to feel this way. Do you want to tell me what triggered this?",
                "Sadness is a heavy emotion. Take time to welcome it. I'm here to support you.",
                "It's important to express this sadness. Crying can be a relief. I'm here with you.",
            ],
        },
        {
            keywords: ["stress", "stressed", "pressure", "tense", "nervous", "overwhelmed"],
            responses: [
                "The stress seems intense. Let's try to breathe together. Inhale deeply... and exhale slowly. How does that feel?",
                "I understand you're under pressure. What is stressing you out the most right now?",
                "Stress is a normal but tiring reaction. Were you able to take a moment for yourself today?",
            ],
        },
        {
            keywords: ["anxiety", "panic", "fear", "anxious", "scared", "afraid"],
            responses: [
                "I'm here. You are safe. Let's try to ground ourselves: can you name 3 objects around you?",
                "Anxiety is a wave that eventually passes. Breathe calmly. I'll stay with you until it gets better.",
                "It's scary, I know. But it's just an emotion, it can't hurt you. Focus on my voice (or this message).",
            ],
        },
        {
            keywords: ["tired", "fatigue", "exhausted", "sleep", "insomnia"],
            responses: [
                "Fatigue weighs on the mind. Have you managed to sleep a little lately?",
                "It seems your body is craving rest. Is it possible for you to take a break, even a short one?",
                "Emotional exhaustion is real. Be gentle with yourself today. Don't ask too much of yourself.",
            ],
        },
        {
            keywords: ["angry", "anger", "mad", "furious", "hate", "rage", "unfair"],
            responses: [
                "I sense anger. It often means a boundary has been crossed. Do you want to tell me what revolts you?",
                "Anger needs to come out. You have the right to be mad. Tell me what happened.",
                "It's frustrating, I understand. Putting words on this anger can help bring it down.",
            ],
        },
        {
            keywords: ["thank", "thanks", "helpful", "kind", "help"],
            responses: [
                "You are welcome. I am happy to have been able to support you.",
                "Thank you for your trust. Take care of yourself.",
                "That's what I'm here for. Don't hesitate to come back if you need to.",
            ],
        },
        {
            keywords: ["suicide", "die", "kill", "death", "end it"],
            responses: [
                "I sense great suffering. If you feel in immediate danger, please call emergency services or talk to a loved one now. You are not alone.",
                "Your words worry me. I am an AI, but there are real people ready to help you right away. Do you want emergency numbers?",
                "The pain is intense, but it is temporary. Please do not remain alone with these dark thoughts.",
            ],
        },
        {
            keywords: ["alone", "lonely", "loneliness", "isolated"],
            responses: [
                "Loneliness can be very painful. Even though I am virtual, I am here to listen. Connecting with me is already a step.",
                "Feeling lonely doesn't mean you truly are. Is there someone you could message today?",
                "I am here. Let's talk a bit. What would you like to discuss to take your mind off things?",
            ],
        },
    ]
};

const DEFAULT_RESPONSES = {
    fr: [
        "Je vous écoute. Pouvez-vous m'en dire plus ?",
        "Je comprends. Continuez, je suis là.",
        "Dites-m'en plus sur ce que vous ressentez.",
        "Je suis là pour vous accompagner. Qu'est-ce qui vous préoccupe ?",
        "C'est important ce que vous dites. Comment cela vous affecte-t-il ?",
    ],
    en: [
        "I'm listening. Can you tell me more?",
        "I understand. Go on, I'm here.",
        "Tell me more about what you're feeling.",
        "I'm here to support you. What's on your mind?",
        "That sounds important. How does it affect you?",
    ]
};

/**
 * Normalizes text: lowercase, remove accents
 */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Main AI function
 */
export async function generateOfflineResponse(input: string, language: "fr" | "en" = "fr"): Promise<string> {
    const normalizedInput = normalize(input);

    // Simulated Processing Delay (random between 800ms and 2000ms for realism)
    const delay = Math.floor(Math.random() * 1200) + 800;
    await new Promise(resolve => setTimeout(resolve, delay));

    const knowledgeBase = KNOWLEDGE_BASE[language] || KNOWLEDGE_BASE.fr;
    const defaultResponses = DEFAULT_RESPONSES[language] || DEFAULT_RESPONSES.fr;

    // 1. Check Knowledge Base
    for (const pattern of knowledgeBase) {
        const match = pattern.keywords.some(k => normalizedInput.includes(normalize(k)));
        if (match) {
            // Return a random response from this category
            const randomIndex = Math.floor(Math.random() * pattern.responses.length);
            return pattern.responses[randomIndex];
        }
    }

    // 2. Fallback
    const randomDefault = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomDefault];
}
