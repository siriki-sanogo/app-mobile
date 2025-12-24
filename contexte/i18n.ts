export const translations = {
    fr: {
        // General
        greeting: "Bonjour",
        moodQuestion: "Comment te sens-tu aujourd'hui ?",
        myMood: "Mon humeur",
        suggestions: "Suggestions pour toi",
        noContent: "Aucun contenu selon tes préférences",

        // Onboarding
        language: "Langue",
        age: "Tranche d'âge",
        religion: "Religion",
        objectives: "Objectifs",
        books: "Livres",
        next: "Suivant",
        start: "Commencer",

        // Profile
        profileTitle: "Mon Profil",
        managePreferences: "Gérez vos préférences",
        name: "Nom",
        goal: "Mon Objectif",
        goalPlaceholder: "Décrivez votre objectif",
        sources: "Sources d'inspiration",
        save: "Enregistrer les modifications",
        bible: "Bible",
        coran: "Coran",
        africanTexts: "Textes africains",
        activated: "Activé",
        deactivated: "Désactivé",
        profileIncomplete: "Profil non complété",
        enterName: "Entrez votre nom",
        photoLibrary: "Choisir une photo",

        // Assistant
        assistantName: "GOOD APP",
        online: "En ligne",
        typing: "En train d'écrire...",
        listen: "Je vous écoute...",
        messagePlaceholder: "Message...",

        // Moods
        mood_happy: "Bien",
        mood_stressed: "Stressé",
        mood_sad: "Triste",
        mood_tired: "Fatigué",
        mood_neutral: "Neutre",

        // Objectives
        obj_anxiety: "Gérer mon anxiété au quotidien",
        obj_stress: "Gérer le stress",
        obj_resilience: "Développer ma résilience",
        obj_confidence: "Avoir la confiance en soi",
        obj_share_story: "Partager mon histoire",
        obj_help_others: "Témoigner pour aider d'autres",

        // Legacy (kept to avoid breaks if used somewhere although deprecated)
        happy: "Joyeux",
        calm: "Calme",
        anxious: "Anxieux",
        stressed: "Stressé",
        sad: "Triste",
        angry: "En colère",
    },
    en: {
        // General
        greeting: "Hello",
        moodQuestion: "How are you feeling today?",
        myMood: "My Mood",
        suggestions: "Suggestions for you",
        noContent: "No content matching your preferences",

        // Onboarding
        language: "Language",
        age: "Age Range",
        religion: "Religion",
        objectives: "Objectives",
        books: "Books",
        next: "Next",
        start: "Get Started",

        // Profile
        profileTitle: "My Profile",
        managePreferences: "Manage your preferences",
        name: "Name",
        goal: "My Goal",
        goalPlaceholder: "Describe your goal",
        sources: "Inspiration Sources",
        save: "Save Changes",
        bible: "Bible",
        coran: "Quran",
        africanTexts: "African Texts",
        activated: "On",
        deactivated: "Off",
        profileIncomplete: "Profile incomplete",
        enterName: "Enter your name",
        photoLibrary: "Choose a Photo",

        // Assistant
        assistantName: "GOOD APP",
        online: "Online",
        typing: "Typing...",
        listen: "I'm listening...",
        messagePlaceholder: "Message...",

        // Moods
        mood_happy: "Good",
        mood_stressed: "Stressed",
        mood_sad: "Sad",
        mood_tired: "Tired",
        mood_neutral: "Neutral",

        // Objectives
        obj_anxiety: "Manage my anxiety daily",
        obj_stress: "Manage stress",
        obj_resilience: "Develop my resilience",
        obj_confidence: "Build self-confidence",
        obj_share_story: "Share my story",
        obj_help_others: "Testify to help others",

        // Legacy
        happy: "Happy",
        calm: "Calm",
        anxious: "Anxious",
        stressed: "Stressed",
        sad: "Sad",
        angry: "Angry",
    }
};

export type Language = "fr" | "en";
export type TranslationKey = keyof typeof translations.fr;

export function useTranslation(lang: Language) {
    return (key: string) => {
        const translationsForLang = translations[lang];
        return translationsForLang[key as keyof typeof translationsForLang] || key;
    };
}
