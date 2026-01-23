import { useAppContext } from "./AppContext";

export const translations = {
    fr: {
        // General
        greeting: "Bonjour",
        moodQuestion: "Comment te sens-tu aujourd'hui ?",
        myMood: "Mon humeur",
        suggestions: "Suggestions pour toi",
        noContent: "Aucun contenu selon tes préférences",

        // Onboarding
        religion: "Religion",
        objectives: "Objectifs",
        language_label: "Langue",
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

        // Profile & Settings
        settingsTitle: "Paramètres",
        manageAccount: "Gérez votre compte et vos préférences",
        section_profile: "PROFIL",
        section_general: "GÉNÉRAL",
        section_security: "SÉCURITÉ",
        section_content: "CONTENU",
        section_support: "SUPPORT",
        notifications: "Notifications",
        face_id: "Face ID / Touch ID",
        help_support: "Aide & Support",
        privacy_policy: "Politique de confidentialité",
        delete_account: "Supprimer mon compte",
        version: "Version",
        language: "Langue",

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
        // Side Menu
        menu_home: "Accueil",
        menu_assistant: "Assistant",
        menu_history: "Historique",
        menu_exercises: "Exercices",
        menu_progress: "Progrès",
        menu_profile: "Profil",
        menu_settings: "Paramètres",
        menu_help: "Aide & Support",
        menu_sources: "Sources et Références",
        menu_privacy: "Confidentialité",
        menu_darkmode: "Mode sombre",
        menu_logout: "Déconnexion",
        menu_hello: "Bonjour",

        // Exercises
        exercises_title: "Exercices",
        exercises_subtitle: "Bibliothèque de pratiques",

        // History
        history_empty_title: "Aucune interaction",
        history_empty_subtitle: "Commencez à parler avec l'assistant pour voir votre historique",
        view_conversation: "Voir la conversation",

        // Progress
        progress_title: "Vos Progrès",
        progress_subtitle: "Suivez votre évolution",
        streak_label: "Jours consécutifs",
        streak_sub: "Continuez comme ça !",
        mood_history: "Humeur (7 derniers jours)",
        wellness_week: "Bien-être cette semaine",
        wellness_improvement: "Amélioration",
        badges_title: "Succès & Badges",
        badge_first_step: "Premier pas",
        badge_3_zen: "3 Jours Zen",
        badge_7_streak: "7 Jours Série",
        badge_master: "Maître Zen",

        // New Features
        garden_title: "Mon Jardin de Sérénité",
        insights_title: "Bilan Émotionnel",
        insights_subtitle: "Comprenez vos tendances",
        score_label: "Score Bien-être",
        advice_title: "Conseil IA",
        stat_sessions: "Sessions Totales",
        stat_mood: "Humeur Dominante",
        menu_insights: "Bilan Émotionnel",
        garden_stage_1: "Graine",
        garden_stage_2: "Jeune Pousse",
        garden_stage_3: "Arbuste",
        garden_stage_4: "Grand Arbre",
        garden_keep_going: "Continuez vos efforts pour faire grandir votre jardin !",
        level: "Niveau",
        insight_excellent: "Excellent ! Vous maintenez un bon équilibre.",
        insight_fluctuation: "Quelques fluctuations, prenez du temps pour vous.",
        date_format: "fr-FR",
        day_prefix: "J",

        // Universal Search
        search_title: "Recherches de Référence",
        search_placeholder: "Rechercher (Bible, Coran, Textes...)",
        source_fr: "Français",
        source_enfr: "Anglais-Fr",
        source_en: "Anglais",
        source_quran: "Coran",
        source_bible: "Bible",
        source_african: "Textes africains",
    },
    en: {
        // General
        greeting: "Hello",
        moodQuestion: "How are you feeling today?",
        myMood: "My Mood",
        suggestions: "Suggestions for you",
        noContent: "No content matching your preferences",

        // Onboarding
        language_label: "Language", // Corrected from 'language'
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

        // Profile & Settings
        settingsTitle: "Settings",
        manageAccount: "Manage your account & preferences",
        section_profile: "PROFILE",
        section_general: "GENERAL",
        section_security: "SECURITY",
        section_content: "CONTENT",
        section_support: "SUPPORT",
        notifications: "Notifications",
        face_id: "Face ID / Touch ID",
        help_support: "Help & Support",
        privacy_policy: "Privacy Policy",
        delete_account: "Delete my account",
        version: "Version",
        language: "Language", // Added missing key

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

        // Side Menu
        menu_home: "Home",
        menu_assistant: "Assistant",
        menu_history: "History",
        menu_exercises: "Exercises",
        menu_progress: "Progress",
        menu_profile: "Profile",
        menu_settings: "Settings",
        menu_help: "Help & Support",
        menu_sources: "Sources & References",
        menu_privacy: "Privacy",
        menu_darkmode: "Dark Mode",
        menu_logout: "Logout",
        menu_hello: "Hello",
        menu_insights: "Emotional Insights",

        // Exercises
        exercises_title: "Exercises",
        exercises_subtitle: "Library of practices",

        // History
        history_empty_title: "No interactions",
        history_empty_subtitle: "Start talking with the assistant to see your history",
        view_conversation: "View conversation",

        // Progress
        progress_title: "Your Progress",
        progress_subtitle: "Track your evolution",
        streak_label: "Consecutive Days",
        streak_sub: "Keep it up!",
        mood_history: "Mood (Last 7 days)",
        wellness_week: "Wellness this week",
        wellness_improvement: "Improvement",
        badges_title: "Success & Badges",
        badge_first_step: "First Step",
        badge_3_zen: "3 Days Zen",
        badge_7_streak: "7 Days Streak",
        badge_master: "Zen Master",

        // New Features
        garden_title: "My Serenity Garden",
        insights_title: "Emotional Insights",
        insights_subtitle: "Understand your patterns",
        score_label: "Wellness Score",
        advice_title: "AI Advice",
        stat_sessions: "Total Sessions",
        stat_mood: "Dominant Mood",
        garden_stage_1: "Seed",
        garden_stage_2: "Sprout",
        garden_stage_3: "Plant",
        garden_stage_4: "Tree",
        garden_keep_going: "Keep going to grow your garden!",
        level: "Level",
        insight_excellent: "Excellent! You maintain a good balance.",
        insight_fluctuation: "Some fluctuations, take time for yourself.",

        // Dates & Progress
        day_prefix: "D",
        date_format: "en-US",

        // Universal Search
        search_title: "Reference Search",
        search_placeholder: "Search (Bible, Quran, Texts...)",
        source_fr: "French",
        source_enfr: "English-French",
        source_en: "English",
        source_quran: "Quran",
        source_bible: "Bible",
        source_african: "African Texts",
    }
};

export type Language = "fr" | "en";
export type TranslationKey = keyof typeof translations.fr;

export function useTranslation(lang: Language): (key: TranslationKey) => string {
    return (key: TranslationKey) => {
        const translationsForLang = translations[lang];
        return translationsForLang[key] || key;
    };
}
