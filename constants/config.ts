import { Platform } from "react-native";

// === CONFIGURATION RESEAU ===

// 1. CHERCHEZ VOTRE IP : Tapez 'ipconfig' et cherchez "Adresse IPv4" (ex: 192.168.1.15)
// 2. OU UTILISEZ NGROK : Lancez 'ngrok http 8000' et copiez l'URL https

const USE_NGROK = false; // <--- Mettez à 'true' si vous utilisez Ngrok
const NGROK_URL = "https://4f65f5506cc7.ngrok-free.app";
const LOCAL_IP = Platform.OS === 'web' ? "localhost" : "10.204.86.83"; // <--- Auto-switch for Web

const API_HOST = USE_NGROK ? NGROK_URL.replace("https://", "") : LOCAL_IP;

export const API_URL = USE_NGROK
    ? `${NGROK_URL}/api/v1`
    : `http://${LOCAL_IP}:8000/api/v1`;

export const BASE_URL = USE_NGROK
    ? NGROK_URL
    : `http://${LOCAL_IP}:8000`;
