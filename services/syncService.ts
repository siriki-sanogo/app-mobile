import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncServiceApi, SyncData } from "./api";
import { Platform } from "react-native";

const SYNC_Timestamp_KEY = "last_sync_timestamp";

// Pour SQLite, on utilise expo-sqlite.
// Note: Le code existant utilise peut-être déjà SQLite.
// On va supposer ici une implémentation simplifiée qui stocke les entrées offline en AsyncStorage 
// ou complète une implémentation SQLite existante si elle est fournie.
// D'après les fichiers vus, il n'y avait pas de service SQLite explicite montré en détail,
// mais `offlineAI.ts` était mentionné.

// Pour ce MVP, on va simuler le stockage offline des moods via AsyncStorage
// dans une vraie app, on utiliserait une table SQLite 'mood_queue'.

const MOOD_QUEUE_KEY = "mood_sync_queue";
const FAVORITES_QUEUE_KEY = "favorites_sync_queue";

export const syncService = {
    // Sauvegarder une entrée mood offline
    queueMoodEntry: async (entry: any) => {
        try {
            const queueJson = await AsyncStorage.getItem(MOOD_QUEUE_KEY);
            const queue = queueJson ? JSON.parse(queueJson) : [];
            queue.push(entry);
            await AsyncStorage.setItem(MOOD_QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.error("Error queuing mood", e);
        }
    },

    // Sauvegarder un favori offline
    queueFavorite: async (contentId: number) => {
        try {
            const queueJson = await AsyncStorage.getItem(FAVORITES_QUEUE_KEY);
            const queue = queueJson ? JSON.parse(queueJson) : [];
            if (!queue.includes(contentId)) {
                queue.push(contentId);
                await AsyncStorage.setItem(FAVORITES_QUEUE_KEY, JSON.stringify(queue));
            }
        } catch (e) {
            console.error("Error queuing favorite", e);
        }
    },

    // Synchroniser (Push & Pull)
    sync: async () => {
        try {
            console.log("Starting sync...");

            // 1. PUSH
            const moodQueueJson = await AsyncStorage.getItem(MOOD_QUEUE_KEY);
            const favQueueJson = await AsyncStorage.getItem(FAVORITES_QUEUE_KEY);

            const moodQueue = moodQueueJson ? JSON.parse(moodQueueJson) : [];
            const favQueue = favQueueJson ? JSON.parse(favQueueJson) : [];

            if (moodQueue.length > 0 || favQueue.length > 0) {
                const payload: SyncData = {
                    mood_entries: moodQueue,
                    favorites: favQueue
                };

                await syncServiceApi.push(payload);

                // Clear queues on success
                await AsyncStorage.removeItem(MOOD_QUEUE_KEY);
                await AsyncStorage.removeItem(FAVORITES_QUEUE_KEY);
                console.log("Push successful");
            }

            // 2. PULL
            const lastSync = await AsyncStorage.getItem(SYNC_Timestamp_KEY);
            const newContent = await syncServiceApi.pull(lastSync || undefined);

            if (newContent && newContent.length > 0) {
                console.log(`Pulled ${newContent.length} new items`);
                // Ici on stockerait le contenu dans SQLite pour l'usage offline
                // Pour l'instant on met juste à jour le timestamp
            }

            await AsyncStorage.setItem(SYNC_Timestamp_KEY, new Date().toISOString());

            return newContent;
        } catch (e) {
            console.error("Sync failed", e);
            throw e;
        }
    }
};
