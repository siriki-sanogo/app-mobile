import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

// --- Configuration Axios ---
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Services ---

export const authService = {
    // Inscription
    register: async (data: UserRegisterData) => {
        const response = await api.post<AuthResponse>("/auth/register", data);
        return response.data;
    },

    // Connexion
    login: async (email: string, password: string) => {
        // Le backend attend "username" ou "email" dans le body, selon le schéma UserLogin
        const response = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
        });
        return response.data;
    },

    // Récupérer le profil
    getProfile: async () => {
        const response = await api.get("/users/me");
        return response.data;
    },
};

export const syncServiceApi = {
    // Pousser les données offline vers le serveur
    push: async (data: SyncData) => {
        const response = await api.post("/sync/push", data);
        return response.data;
    },

    // Récupérer les nouvelles données depuis le serveur
    pull: async (lastSync?: string) => {
        const params = lastSync ? { last_sync: lastSync } : {};
        const response = await api.get("/sync/pull", { params });
        return response.data;
    },
};

export default api;
