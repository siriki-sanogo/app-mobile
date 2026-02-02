/**
 * Speech Service - TTS Offline pour GOOD APP
 * Utilise expo-speech pour synthèse vocale native hors-ligne
 */
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface SpeechOptions {
    language?: 'fr' | 'en';
    rate?: number;      // 0.1 to 2.0 (1.0 = normal)
    pitch?: number;     // 0.5 to 2.0 (1.0 = normal)
    volume?: number;    // 0.0 to 1.0
}

const DEFAULT_OPTIONS: SpeechOptions = {
    language: 'fr',
    rate: 0.95,
    pitch: 1.0,
    volume: 1.0,
};

// Map des voix préférées par langue (dépend du device)
const VOICE_PREFERENCES: Record<string, string[]> = {
    fr: ['fr-FR', 'fr_FR', 'fra-FRA'],
    en: ['en-US', 'en_US', 'eng-USA', 'en-GB'],
};

class SpeechService {
    private currentUtteranceId: string | null = null;

    /**
     * Parle le texte fourni avec TTS natif
     */
    async speak(text: string, options: SpeechOptions = {}): Promise<void> {
        const opts = { ...DEFAULT_OPTIONS, ...options };

        // Stop any ongoing speech
        await this.stop();

        // Nettoyer le texte (enlever markdown, emojis excessifs, etc.)
        const cleanedText = this.cleanTextForSpeech(text);

        if (!cleanedText.trim()) {
            console.log('SpeechService: Empty text, skipping');
            return;
        }

        const speechOptions: Speech.SpeechOptions = {
            language: opts.language === 'en' ? 'en-US' : 'fr-FR',
            rate: opts.rate,
            pitch: opts.pitch,
            volume: opts.volume,
            onStart: () => {
                console.log('SpeechService: Started speaking');
            },
            onDone: () => {
                console.log('SpeechService: Finished speaking');
                this.currentUtteranceId = null;
            },
            onError: (error) => {
                console.error('SpeechService: Error', error);
                this.currentUtteranceId = null;
            },
        };

        // Sur iOS, on peut spécifier une voix
        if (Platform.OS === 'ios') {
            const voices = await Speech.getAvailableVoicesAsync();
            const preferredVoiceIds = VOICE_PREFERENCES[opts.language || 'fr'];
            const matchedVoice = voices.find(v =>
                preferredVoiceIds.some(pref => v.identifier.includes(pref) || v.language.includes(pref))
            );
            if (matchedVoice) {
                speechOptions.voice = matchedVoice.identifier;
            }
        }

        this.currentUtteranceId = `speech_${Date.now()}`;
        Speech.speak(cleanedText, speechOptions);
    }

    /**
     * Arrête la lecture vocale en cours
     */
    async stop(): Promise<void> {
        const isSpeaking = await Speech.isSpeakingAsync();
        if (isSpeaking) {
            Speech.stop();
            this.currentUtteranceId = null;
        }
    }

    /**
     * Vérifie si une lecture est en cours
     */
    async isSpeaking(): Promise<boolean> {
        return Speech.isSpeakingAsync();
    }

    /**
     * Pause/Resume (si supporté)
     */
    async pause(): Promise<void> {
        if (Platform.OS === 'ios') {
            Speech.pause();
        }
    }

    async resume(): Promise<void> {
        if (Platform.OS === 'ios') {
            Speech.resume();
        }
    }

    /**
     * Récupère les voix disponibles
     */
    async getAvailableVoices(): Promise<Speech.Voice[]> {
        return Speech.getAvailableVoicesAsync();
    }

    /**
     * Nettoie le texte pour une meilleure lecture
     */
    private cleanTextForSpeech(text: string): string {
        return text
            // Supprimer les balises markdown
            .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold**
            .replace(/\*([^*]+)\*/g, '$1')        // *italic*
            .replace(/`([^`]+)`/g, '$1')          // `code`
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link](url)
            // Supprimer les emojis excessifs (garder le premier de chaque groupe)
            .replace(/([😀-🙏🌀-🗿🚀-🛿🇦-🇿])\1+/gu, '$1')
            // Remplacer les signes par des mots
            .replace(/&/g, ' et ')
            .replace(/\+/g, ' plus ')
            // Supprimer les caractères de contrôle
            .replace(/[\x00-\x1F\x7F]/g, '')
            // Normaliser les espaces
            .replace(/\s+/g, ' ')
            .trim();
    }
}

// Export singleton
export const speechService = new SpeechService();
