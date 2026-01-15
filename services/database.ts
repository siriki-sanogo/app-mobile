import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Lazy init
let db: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
    if (db) return db;

    try {
        if (Platform.OS === 'web') {
            // Web support specific
            db = await SQLite.openDatabaseAsync("dispositif.db");
        } else {
            db = await SQLite.openDatabaseAsync("dispositif.db"); // Async works on native too and is safer?
            // Actually openDatabaseSync is better for Native usage? 
            // Docs say: openDatabaseSync available on Android/iOS.
            // We'll stick to Async for universality if possible, 
            // BUT existing code uses "await db.execAsync".
            // Let's use openDatabaseAsync everywhere for consistency if supported.
            // If not supported in v16.0.10 (it should be), we fallback.
        }
    } catch (e) {
        console.error("Failed to open DB:", e);
        // Fallback for types
        throw e;
    }
    return db;
};
// Note: openDatabaseAsync returns Promise<SQLiteDatabase>
// But wait, openDatabaseSync returns SQLiteDatabase.
// If I use Async, I must await getDb() in every function.

// Interface definitions remain same...
// --- Interfaces ---
export interface TextItem {
    id: number;
    source: "bible" | "coran" | "african";
    book: string;
    chapter?: number;
    verse?: number;
    content: string;
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

// --- Initialization ---
export const initDatabase = async () => {
    try {
        const database = await getDb();
        if (!database) return;

        await database.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS texts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT,
                book TEXT,
                chapter INTEGER,
                verse INTEGER,
                content TEXT,
                language TEXT DEFAULT 'fr'
            );
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                title TEXT,
                created_at TEXT
            );
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                role TEXT,
                content TEXT,
                timestamp TEXT,
                FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
            );
            CREATE TABLE IF NOT EXISTS search_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT,
                category TEXT,
                timestamp TEXT
            );
        `);
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

// --- Seeding Data (Open Source Samples) ---
// --- Seeding Data (Open Source Samples) ---
export const seedDatabase = async () => {
    try {
        const db = await getDb();
        if (!db) return;

        // Check if Quran is seeded
        const quranCheck = await db.getFirstAsync<{ count: number }>("SELECT count(*) as count FROM texts WHERE source='coran'");
        if (quranCheck && quranCheck.count === 0) {
            console.log("Seeding Quran Sample...");
            try {
                const quranSample = require("../assets/data/quran_fr_sample.json");
                await importFromJSON(quranSample);
            } catch (e) { console.error("Quran seed failed", e); }
        }

        const result = await db.getFirstAsync<{ count: number }>("SELECT count(*) as count FROM texts");
        if (result && result.count === 0) {
            console.log("Seeding initial database...");
            // ... (rest of initial seed)
            try {
                const sampleData = require("../assets/data/sample_texts.json");
                await importFromJSON(sampleData);
            } catch (err) {
                console.error("Failed to load seed JSON:", err);
            }
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

const insertText = async (source: string, book: string, chapter: number, verse: number, content: string) => {
    const db = await getDb();
    if (!db) return;
    await db.runAsync(
        "INSERT INTO texts (source, book, chapter, verse, content) VALUES (?, ?, ?, ?, ?)",
        [source, book, chapter, verse, content]
    );
};

// Import Data from JSON (for bulk loading)
export const importFromJSON = async (jsonData: TextItem[]) => {
    const db = await getDb();
    if (!db) return;

    try {
        console.log(`Importing ${jsonData.length} items...`);
        // Use a transaction for speed
        await db.withTransactionAsync(async () => {
            for (const item of jsonData) {
                await db.runAsync(
                    "INSERT INTO texts (source, book, chapter, verse, content, language) VALUES (?, ?, ?, ?, ?, ?)",
                    [item.source, item.book, item.chapter || 0, item.verse || 0, item.content, "fr"] // Default to FR for now
                );
            }
        });
        console.log("Import success!");
    } catch (e) {
        console.error("Import failed:", e);
    }
}

// --- Helpers ---

// Search Texts
export const searchTexts = async (query: string, category?: string): Promise<TextItem[]> => {
    try {
        const db = await getDb();
        if (!db) return [];

        let sql = "SELECT * FROM texts WHERE (content LIKE ? OR book LIKE ? OR source LIKE ?)";
        let args: (string | number)[] = [`%${query}%`, `%${query}%`, `%${query}%`];

        if (category && category !== 'all') {
            sql += " AND source = ?";
            args.push(category);
        }

        console.log(`Searching DB: ${sql} with args ${JSON.stringify(args)}`);
        const results = await db.getAllAsync<TextItem>(sql, args);
        console.log(`Found ${results.length} results`);
        return results;
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
};

// Save Message
export const saveMessage = async (message: ChatMessage) => {
    try {
        const db = await getDb();
        if (!db) return;

        await db.runAsync(
            "INSERT INTO chat_messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
            [message.id, message.session_id, message.role, message.content, message.timestamp]
        );
    } catch (error) {
        console.error("Error saving message:", error);
    }
};

// Create Session
export const createSession = async (session: ChatSession) => {
    try {
        const db = await getDb();
        if (!db) return;

        await db.runAsync(
            "INSERT OR IGNORE INTO chat_sessions (id, title, created_at) VALUES (?, ?, ?)",
            [session.id, session.title, session.created_at]
        );
    } catch (error) {
        console.error("Error creating session:", error);
    }
};

// Load Messages for Session
export const loadMessages = async (sessionId: string): Promise<ChatMessage[]> => {
    try {
        const db = await getDb();
        if (!db) return [];

        const results = await db.getAllAsync<ChatMessage>(
            "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC",
            [sessionId]
        );
        return results;
    } catch (error) {
        console.error("Error loading messages:", error);
        return [];
    }
};
