import { Platform } from 'react-native';

// Variable globale pour stocker le contexte Whisper
let whisperContext: any = null;

// Interface pour le résultat
interface TranscriptionResult {
    text: string;
    isOffline: boolean;
}

/**
 * Initialise le moteur Whisper (doit être appelé au démarrage ou à la première utilisation)
 */
const initWhisperEngine = async () => {
    if (whisperContext) return whisperContext;

    // Whisper n'est supporté que sur Android/iOS (binaire natif)
    if (Platform.OS === 'web') return null;

    try {
        console.log("🎤 Initialisation de Whisper Offline...");
        // Import dynamique pour éviter les erreurs sur Expo Go / Web
        const { initWhisper } = require('whisper.rn');

        // On suppose que le modèle est dans les assets
        // Note: Il faudra ajouter le fichier ggml-tiny.bin dans app.json > assetBundlePatterns
        whisperContext = await initWhisper({
            filePath: require('../assets/ggml-tiny.bin'),
        });
        console.log("✅ Whisper initialisé avec succès");
        return whisperContext;
    } catch (e) {
        console.warn("⚠️ Whisper n'est pas disponible (manque lib native ou modèle):", e);
        return null;
    }
};

/**
 * Transcrit un fichier audio localement
 */
export const transcribeAudioOffline = async (audioUri: string): Promise<TranscriptionResult> => {
    try {
        const context = await initWhisperEngine();

        if (!context) {
            throw new Error("Whisper context not available");
        }

        console.log("🎙️ Début transcription offline pour:", audioUri);
        const { result } = await context.transcribe(audioUri, {
            language: 'fr',
            maxLen: 0, // Pas de limite
            tokenTimestamps: false,
        });

        console.log("📝 Résultat Whisper:", result);
        return {
            text: result.trim(),
            isOffline: true
        };
    } catch (e) {
        console.error("❌ Erreur Whisper Offline:", e);
        // On renvoie une chaine vide ou on propage l'erreur
        return {
            text: "",
            isOffline: true
        };
    }
};
