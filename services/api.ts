import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_URL } from "../constants/config";

// --- Types ---

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: any;
}

export interface UserRegisterData {
    name: string;
    email: string;
    password: string;
    gender?: string;
    language?: string;
    preferences?: any;
}

export interface SyncData {
    mood_entries: any[];
    favorites: number[];
}

export interface ApiResult {
    source: string;
    title: string;
    description: string;
    data: any;
}

// --- URLs et Clés ---

export const API_URLS = {
    dictionary: "https://api.dictionaryapi.dev/api/v2/entries/fr/",
    quran: "http://api.alquran.cloud/v1/search/",
    bible: "https://bolls.life/get-text/LSV/"
};

// NOTE: Hugging Face API Key (Optionnel pour l'instant)
const HF_API_KEY = "";
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

// --- Configuration Axios (pour notre Backend) ---

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Bypass ngrok free tier landing page
    },
    timeout: 30000, // 30s — LLM calls (Groq 70B) can take a few seconds
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Services Backend (Auth & Sync) ---

export const authService = {
    register: async (data: UserRegisterData) => {
        const response = await api.post<AuthResponse>("/auth/register", data);
        return response.data;
    },
    login: async (email: string, password: string) => {
        const response = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
        });
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get("/users/me");
        return response.data;
    },
    updateProfile: async (data: any) => {
        const response = await api.put("/users/me", data);
        return response.data;
    },
};

export const syncServiceApi = {
    push: async (data: SyncData) => {
        const response = await api.post("/sync/push", data);
        return response.data;
    },
    pull: async (lastSync?: string) => {
        const params = lastSync ? { last_sync: lastSync } : {};
        const response = await api.get("/sync/pull", { params });
        return response.data;
    },
};

// --- Services Externes (Dictionnaire, Coran, AI, Audio) ---

export const audioService = {
    transcribe: async (uri: string) => {
        const formData = new FormData();

        if (Platform.OS === 'web') {
            // Web: fetch the blob from the blob URL and create a proper File
            const response = await fetch(uri);
            const blob = await response.blob();
            const file = new File([blob], "recording.webm", { type: "audio/webm" });
            formData.append("file", file);
        } else {
            // Native: use React Native FormData pattern
            const filename = uri.split("/").pop() || "recording.m4a";
            const type = "audio/m4a";
            // @ts-ignore
            formData.append("file", { uri, name: filename, type });
        }

        const res = await api.post("/audio/transcribe", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // Transcription can take time
        });
        return res.data;
    },
};

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

export const searchQuran = async (query: string): Promise<ApiResult[]> => {
    try {
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
};

export const searchOnline = async (query: string, category?: string) => {
    let results: ApiResult[] = [];
    const promises = [];
    if (!category || category === 'all' || category === 'dictionary') promises.push(searchDictionary(query));
    if (!category || category === 'all' || category === 'coran') promises.push(searchQuran(query));
    const responses = await Promise.all(promises);
    responses.forEach(r => results = [...results, ...r]);
    return results;
};

// Import de notre nouveau service LLM offline
import { generatePositiveContent } from "./llm";

export const fetchAIResponse = async (
    prompt: string,
    profile: any,
    language: "fr" | "en",
    messagesHistory: { role: "user" | "assistant"; content: string }[] = []
) => {
    try {
        // On utilise notre moteur IA (RAG + Groq/Llama) with conversation history
        const result = await generatePositiveContent(prompt, messagesHistory, profile);

        if (!result) return null;

        return {
            text: result.response,
            actions: [],
        };
    } catch (e) {
        console.log("fetchAIResponse failed:", e);
        return null;
    }
};

export default api;
