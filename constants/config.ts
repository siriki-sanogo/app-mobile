import { Platform } from "react-native";

// === CONFIGURATION RESEAU ===

// 1. Android Emulator : 10.0.2.2 corresponds à localhost
// 2. iOS Simulator : localhost fonctionne
// 3. Expo Go (Physique) : Vous devez utiliser l'IP locale de votre ordinateur.
//    D'après votre ipconfig, votre IP est : 192.168.241.83
//    Si cela change, remplacez cette valeur.

// Choisissez l'IP en fonction de votre mode de test :
const SERVER_IP = "192.168.241.83"; // <--- Mettre VOTRE IP locale ici pour Expo Go

const HOST = Platform.select({
    android: "10.0.2.2", // Utiliser SERVER_IP si vous testez sur un vrai téléphone Android
    ios: "localhost",    // Utiliser SERVER_IP si vous testez sur un vrai iPhone
    default: "localhost",
});

// Pour forcer l'utilisation de l'IP locale (recommandé pour Expo Go) :
// Décommentez la ligne ci-dessous :
const API_HOST = SERVER_IP;
// const API_HOST = HOST;

export const API_URL = `http://${API_HOST}:8000/api/v1`;
export const BASE_URL = `http://${API_HOST}:8000`;
