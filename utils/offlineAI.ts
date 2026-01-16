/**
 * Offline AI Engine for GOOD APP
 * Provides immediate therapeutic responses based on keyword analysis.
 * Operates 100% offline.
 */

interface ResponsePattern {
    keywords: string[];
    responses: string[];
    actions?: { label: string; action: string; style?: "primary" | "secondary" }[];
}

// Database of therapeutic responses
const KNOWLEDGE_BASE: {
    fr: ResponsePattern[];
    en: ResponsePattern[]
} = {
    fr: [
        // --- EXISTING EMOTIONS ---
        {
            keywords: ["bonjour", "salut", "hello", "coucou", "hi", "bonsoir"],
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
            actions: [
                { label: "Faire des exercices", action: "navigate:exercises", style: "primary" },
                { label: "Continuer", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["stress", "stressé", "pression", "tendu", "nerveux", "surmené", "burnout"],
            responses: [
                "Le stress semble intense. Essayons de respirer ensemble. Inspirez profondément... et expirez doucement. Comment cela se passe-t-il dans votre corps ?",
                "Je comprends que vous soyez sous pression. Qu'est-ce qui vous stresse le plus en ce moment précis ?",
                "Le stress est une réaction normale, mais fatigante. Avez-vous pu prendre un petit moment pour vous aujourd'hui ?",
            ],
            actions: [
                { label: "Relaxation", action: "navigate:exercises", style: "primary" },
                { label: "Continuer", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["angoisse", "panique", "peur", "anxieux", "anxieuse", "tremble", "effrayé"],
            responses: [
                "Je suis là. Vous êtes en sécurité ici. Essayons de nous ancrer : pouvez-vous nommer 3 objets autour de vous ?",
                "L'angoisse est une vague qui finit par passer. Respirez calmement. Je reste avec vous jusqu'à ce que ça aille mieux.",
                "C'est effrayant, je sais. Mais ce n'est qu'une émotion, elle ne peut pas vous faire de mal. Concentrez-vous sur ma voix (ou ce message).",
            ],
            actions: [
                { label: "Calme", action: "navigate:exercises", style: "primary" },
                { label: "Continuer", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["fatigue", "fatigué", "épuisé", "dormir", "sommeil", "insomnie", "hs"],
            responses: [
                "La fatigue pèse sur le moral. Avez-vous réussi à dormir un peu dernièrement ?",
                "Il semble que votre corps réclame du repos. Est-ce possible pour vous de faire une pause, même courte ?",
                "L'épuisement émotionnel est réel. Soyez doux avec vous-même aujourd'hui. Ne vous en demandez pas trop.",
                "Le sommeil est réparateur. Si vous ne pouvez pas dormir, essayez juste de vous allonger et de fermer les yeux quelques instants.",
            ],
            actions: [
                { label: "Méditation", action: "navigate:exercises", style: "primary" },
                { label: "Continuer", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["colère", "énervé", "fâché", "haine", "rage", "injuste", "boule", "nerfs"],
            responses: [
                "Je sens de la colère. C'est une émotion qui dit souvent qu'une limite a été franchie. Voulez-vous me dire ce qui vous révolte ?",
                "La colère a besoin de sortir. Vous avez le droit d'être fâché(e). Expliquez-moi ce qui s'est passé.",
                "C'est frustrant, je comprends. Mettre des mots sur cette colère peut aider à la faire redescendre. Ne la gardez pas pour vous.",
            ],
            actions: [
                { label: "S'apaiser", action: "navigate:exercises", style: "primary" },
                { label: "Continuer", action: "dismiss", style: "secondary" }
            ]
        },

        // --- NEW CATEGORIES FOR BETTER TRAINING ---

        // 1. MOTIVATION / SUCCESS
        {
            keywords: ["motivation", "motivé", "procrastine", "avancer", "projet", "bloqué", "flemme", "échec", "réussir", "objectif"],
            responses: [
                "Le manque de motivation arrive à tout le monde. L'important est de faire juste un tout petit pas. Quel est le plus petit pas que vous pourriez faire maintenant ?",
                "Parfois, on est bloqué parce que la tâche semble trop grande. Essayez de la découper en morceaux minuscules.",
                "L'échec n'est pas une fin, c'est une leçon. Soyez fier(e) d'essayer. Je crois en votre capacité à rebondir.",
                "Rappelez-vous pourquoi vous avez commencé. Visualisez le résultat final. Courage, vous êtes capable de grandes choses.",
            ],
            actions: [
                { label: "Planifier", action: "dismiss", style: "primary" } // Placeholder for future planning tool
            ]
        },

        // 2. RELATIONSHIPS / LOVE
        {
            keywords: ["amour", "couple", "rupture", "ex", "mari", "femme", "copain", "copine", "aimer", "dispute", "cœur"],
            responses: [
                "Les relations humaines sont complexes. Il est normal d'être remué(e) par ces situations. Voulez-vous m'en dire plus ?",
                "Une peine de cœur est une douleur réelle. Prenez le temps de guérir. Vous méritez d'être aimé(e) et respecté(e).",
                "Dans une dispute, il est parfois utile de prendre du recul pour calmer les émotions avant de reparler. Comment vous sentez-vous face à cela ?",
                "L'amour (ou son absence) nous touche profondément. Sachez que votre valeur ne dépend pas des autres.",
            ],
        },

        // 3. FAMILY
        {
            keywords: ["famille", "père", "mère", "papa", "maman", "enfant", "fils", "fille", "frère", "sœur", "parents"],
            responses: [
                "La famille est souvent source de grandes joies mais aussi de grandes peines. Quel aspect vous pèse aujourd'hui ?",
                "C'est difficile quand les choses ne vont pas bien avec la famille. On se sent souvent impuissant. Vous avez le droit de mettre des limites.",
                "Les relations familiales peuvent être compliquées. Essayez de vous protéger si la situation est toxique, ou de communiquer avec douceur si c'est possible.",
            ],
        },

        // 4. HEALTH / BODY
        {
            keywords: ["mal", "douleur", "malade", "santé", "corps", "poids", "moche", "beau", "belle", "physique"],
            responses: [
                "Quand le corps souffre, le moral en prend un coup. Prenez soin de vous comme vous le feriez pour un ami malade.",
                "La santé est précieuse. Si vous êtes inquiet(e), n'hésitez pas à consulter un médecin. Je suis là pour le soutien moral.",
                "Votre corps est votre maison. Essayez d'être bienveillant(e) avec lui. Il fait de son mieux.",
                "Vous êtes bien plus que votre apparence physique. Votre valeur réside dans qui vous êtes à l'intérieur.",
            ],
        },

        // 5. FUTURE / UNCERTAINTY
        {
            keywords: ["futur", "avenir", "demain", "peur de l'avenir", "incertain", "doute", "perdu", "direction"],
            responses: [
                "L'avenir peut être effrayant car on ne le contrôle pas. Essayons de nous concentrer sur 'ici et maintenant'. Que pouvez-vous faire aujourd'hui ?",
                "C'est normal d'avoir des doutes. C'est souvent le signe que vous cherchez votre propre voie. Faites-vous confiance.",
                "Même si vous vous sentez perdu(e), chaque jour est une nouvelle chance de trouver votre chemin. Patience.",
            ],
        },

        // 6. FAITH / RELIGION (General)
        {
            keywords: ["prière", "prier", "foi", "dieu", "allah", "seigneur", "spiritualité", "croyance", "église", "mosquée"],
            responses: [
                "La foi peut être un grand refuge dans les moments difficiles. Trouvez-vous du réconfort dans la prière en ce moment ?",
                "Se tourner vers plus grand que soi aide souvent à trouver la paix. Gardez l'espoir.",
                "Quelle que soit votre croyance, la spiritualité est une force. N'hésitez pas à vous y appuyer.",
            ],
        },


        {
            keywords: ["merci", "remercier", "gentil", "aide", "top", "génial", "super"],
            responses: [
                "Je vous en prie. Je suis heureuse d'avoir pu vous apporter un peu de soutien.",
                "C'est moi qui vous remercie de votre confiance. Prenez soin de vous.",
                "Je suis là pour ça. N'hésitez pas à revenir si vous en avez besoin.",
                "Merci à vous. Votre bien-être est ma priorité.",
            ],
        },
        {
            keywords: ["suicide", "mourir", "finir", "tuer", "mort", "pendre", "adieu"],
            responses: [
                "Je perçois une grande souffrance. Si vous vous sentez en danger immédiat, s'il vous plaît, appelez les secours ou parlez à un proche maintenant. Vous n'êtes pas seul(e).",
                "Vos paroles m'inquiètent. Je suis une IA, mais il existe des personnes réelles prêtes à vous aider tout de suite. Voulez-vous les numéros d'urgence ?",
                "La douleur est intense, mais elle est temporaire. S'il vous plaît, ne restez pas seul(e) avec ces pensées noires.",
            ],
            actions: [
                { label: "Urgences", action: "call:emergency", style: "primary" },
                { label: "Parler à quelqu'un", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["seul", "solitude", "personne", "isolé", "abandonné"],
            responses: [
                "La solitude peut être très douloureuse. Même si je suis virtuelle, je suis là pour vous écouter. Vous connectez-vous avec moi est déjà un pas.",
                "Se sentir seul ne veut pas dire que vous l'êtes vraiment. Y a-t-il quelqu'un à qui vous pourriez envoyer un message aujourd'hui ?",
                "Je suis là. Parlons un peu. De quoi aimeriez-vous discuter pour vous changer les idées ?",
            ],
            actions: [
                { label: "Faire des exercices", action: "navigate:exercises", style: "primary" },
                { label: "Continuer", action: "dismiss", style: "secondary" }
            ]
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
            actions: [
                { label: "Consult an expert", action: "navigate:exercises", style: "primary" },
                { label: "Continue", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["stress", "stressed", "pressure", "tense", "nervous", "overwhelmed"],
            responses: [
                "The stress seems intense. Let's try to breathe together. Inhale deeply... and exhale slowly. How does that feel?",
                "I understand you're under pressure. What is stressing you out the most right now?",
                "Stress is a normal but tiring reaction. Were you able to take a moment for yourself today?",
            ],
            actions: [
                { label: "Relaxation", action: "navigate:exercises", style: "primary" },
                { label: "Continue", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["anxiety", "panic", "fear", "anxious", "scared", "afraid"],
            responses: [
                "I'm here. You are safe. Let's try to ground ourselves: can you name 3 objects around you?",
                "Anxiety is a wave that eventually passes. Breathe calmly. I'll stay with you until it gets better.",
                "It's scary, I know. But it's just an emotion, it can't hurt you. Focus on my voice (or this message).",
            ],
            actions: [
                { label: "Calm down", action: "navigate:exercises", style: "primary" },
                { label: "Continue", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["tired", "fatigue", "exhausted", "sleep", "insomnia"],
            responses: [
                "Fatigue weighs on the mind. Have you managed to sleep a little lately?",
                "It seems your body is craving rest. Is it possible for you to take a break, even a short one?",
                "Emotional exhaustion is real. Be gentle with yourself today. Don't ask too much of yourself.",
            ],
            actions: [
                { label: "Meditation", action: "navigate:exercises", style: "primary" },
                { label: "Continue", action: "dismiss", style: "secondary" }
            ]
        },
        {
            keywords: ["angry", "anger", "mad", "furious", "hate", "rage", "unfair"],
            responses: [
                "I sense anger. It often means a boundary has been crossed. Do you want to tell me what revolts you?",
                "Anger needs to come out. You have the right to be mad. Tell me what happened.",
                "It's frustrating, I understand. Putting words on this anger can help bring it down.",
            ],
            actions: [
                { label: "Calm down", action: "navigate:exercises", style: "primary" },
                { label: "Continue", action: "dismiss", style: "secondary" }
            ]
        },
        // IMPROVED EN CATEGORIES
        {
            keywords: ["motivation", "motivated", "procrastinate", "stuck", "lazy", "fail", "failure", "success", "goal"],
            responses: [
                "Lack of motivation happens to everyone. The important thing is to take just a tiny step. What is the smallest step you could take now?",
                "Sometimes we get stuck because the task seems too big. Try breaking it down into tiny pieces.",
                "Failure is not an end, it's a lesson. Be proud of trying. I believe in your ability to bounce back.",
            ],
        },
        {
            keywords: ["love", "relationship", "breakup", "ex", "husband", "wife", "boyfriend", "girlfriend", "fight"],
            responses: [
                "Human relationships are complex. It is normal to be shaken by these situations. Do you want to tell me more?",
                "Heartbreak is real pain. Take time to heal. You deserve to be loved and respected.",
                "In a fight, it is sometimes useful to step back to calm emotions before talking again.",
            ],
        },
        {
            keywords: ["thank", "thanks", "helpful", "kind", "help", "great", "awesome"],
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
            actions: [
                { label: "Emergency", action: "call:emergency", style: "primary" },
                { label: "Consult an expert", action: "navigate:exercises", style: "secondary" }
            ]
        },
        {
            keywords: ["alone", "lonely", "loneliness", "isolated"],
            responses: [
                "Loneliness can be very painful. Even though I am virtual, I am here to listen. Connecting with me is already a step.",
                "Feeling lonely doesn't mean you truly are. Is there someone you could message today?",
                "I am here. Let's talk a bit. What would you like to discuss to take your mind off things?",
            ],
            actions: [
                { label: "Consult an expert", action: "navigate:exercises", style: "primary" },
                { label: "Continue", action: "dismiss", style: "secondary" }
            ]
        },
    ]
};

const DEFAULT_RESPONSES = {
    fr: [
        "Je vous écoute. Pouvez-vous m'en dire plus ?",
        "Je comprends. Continuez, je suis là.",
        "Dites-m'en plus sur ce que vous ressentez. Je suis tout ouïe.",
        "Je suis là pour vous accompagner. Qu'est-ce qui vous préoccupe le plus ?",
        "C'est important ce que vous dites. Comment cela vous affecte-t-il ?",
        "Je vois. C'est une situation délicate. Que pensez-vous faire ?",
    ],
    en: [
        "I'm listening. Can you tell me more?",
        "I understand. Go on, I'm here.",
        "Tell me more about what you're feeling. I'm all ears.",
        "I'm here to support you. What's on your mind the most?",
        "That sounds important. How does it affect you?",
        "I see. That's a tricky situation. What do you plan to do?",
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

import { UserProfile } from "../contexte/AppContext";
import { searchTexts } from "../services/database";

/**
 * Main AI function
 */
export async function generateOfflineResponse(
    input: string,
    profile: UserProfile | null,
    language: "fr" | "en" = "fr"
): Promise<{ text: string, actions?: { label: string; action: string; style?: "primary" | "secondary" }[] }> {
    const normalizedInput = normalize(input);

    // Simulated Processing Delay
    const delay = Math.floor(Math.random() * 1000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    const knowledgeBase = KNOWLEDGE_BASE[language] || KNOWLEDGE_BASE.fr;
    const defaultResponses = DEFAULT_RESPONSES[language] || DEFAULT_RESPONSES.fr;

    let responseText = "";
    let responseActions: any[] | undefined;

    // 1. Check for Religious/Cultural Context (DB Search)
    // Keywords triggering DB search
    const dbKeywords = ["bible", "coran", "quran", "verset", "sourate", "proverbe", "allah", "dieu", "god", "jesus", "jésus", "sagesse", "paix", "peace"];
    const foundDbKeyword = dbKeywords.find(k => normalizedInput.includes(normalize(k)));

    if (foundDbKeyword) {
        // Search in DB
        const results = await searchTexts(foundDbKeyword);
        if (results && results.length > 0) {
            // Pick a random result
            const randomQuote = results[Math.floor(Math.random() * results.length)];
            const bookRef = `${randomQuote.book} ${randomQuote.chapter ? randomQuote.chapter + ':' + randomQuote.verse : ''}`;

            if (language === 'fr') {
                responseText = `Voici une parole de sagesse pour vous : "${randomQuote.content}" (${bookRef})`;
            } else {
                responseText = `Here is a word of wisdom for you: "${randomQuote.content}" (${bookRef})`;
            }
            // Enhance with relevant category actions if needed
            return { text: responseText };
        }
    }


    // Helper to get standard actions
    const getStandardActions = (lang: string) => [
        {
            label: lang === 'en' ? "Go to exercises" : "Voir les exercices",
            action: "navigate:exercises",
            style: "primary" as const
        },
        {
            label: lang === 'en' ? "Continue chatting" : "Continuer la discussion",
            action: "dismiss",
            style: "secondary" as const
        }
    ];

    // 2. Check Static Knowledge Base
    if (!responseText) {
        for (const pattern of knowledgeBase) {
            const match = pattern.keywords.some(k => normalizedInput.includes(normalize(k)));
            if (match) {
                const randomIndex = Math.floor(Math.random() * pattern.responses.length);
                responseText = pattern.responses[randomIndex];
                // Use defined actions OR fallback to standard actions if not a greeting/thank you
                if (pattern.actions) {
                    responseActions = pattern.actions;
                } else {
                    // Exclude greetings/thanks from having actions by checking keywords roughly
                    const isGreetingOrThanks = pattern.keywords.some(k =>
                        ["bonjour", "salut", "hello", "hi", "merci", "thanks", "thank"].includes(k)
                    );

                    if (!isGreetingOrThanks) {
                        responseActions = getStandardActions(language);
                    }
                }
                break;
            }
        }
    }

    // 3. Fallback
    if (!responseText) {
        const randomDefault = Math.floor(Math.random() * defaultResponses.length);
        responseText = defaultResponses[randomDefault];
        // Always add actions for fallback to be helpful
        responseActions = getStandardActions(language);
    }

    // 4. Personalize
    if (profile && profile.name) {
        // 30% chance to add name for natural feel, or always if it's a greeting
        const isGreeting = normalizedInput.includes("bonjour") || normalizedInput.includes("hello");
        if (isGreeting || Math.random() > 0.7) {
            // Ensure first letter is lowercase if we append
            // But actually we are PREPENDING the name usually: "Name, text..."
            // Let's fix the capitalization of the original text.
            const firstChar = responseText.charAt(0).toLowerCase();
            const rest = responseText.slice(1);
            responseText = `${profile.name}, ${firstChar}${rest}`;
        }
    }

    return { text: responseText, actions: responseActions };
}
