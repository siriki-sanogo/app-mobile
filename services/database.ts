import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Nom de la base de données
const DB_NAME = "mobile_content.db";

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
  if (db) return db;
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
  } catch (e) {
    console.error("Failed to open DB:", e);
    throw e;
  }
  return db;
};

// Initialisation des tables
export const initDatabase = async () => {
  try {
    // --- 1. Copie de la base de données depuis les Assets (Mobile Uniquement) ---
    if (Platform.OS !== 'web') {
      // @ts-ignore
      const dbDir = `${FileSystem.documentDirectory}SQLite`;
      const dbPath = `${dbDir}/${DB_NAME}`;

      // @ts-ignore
      const fileInfo = await FileSystem.getInfoAsync(dbPath);

      if (!fileInfo.exists) {
        console.log("Database not found, copying from assets...");

        // Créer le dossier SQLite s'il n'existe pas
        // @ts-ignore
        if (!(await FileSystem.getInfoAsync(dbDir)).exists) {
          // @ts-ignore
          await FileSystem.makeDirectoryAsync(dbDir);
        }

        // Charger l'asset
        const asset = Asset.fromModule(require("../assets/mobile_content.db"));
        await asset.downloadAsync();

        if (asset.localUri || asset.uri) {
          // @ts-ignore
          await FileSystem.copyAsync({
            from: asset.localUri || asset.uri,
            to: dbPath,
          });
          console.log("Database copied successfully to", dbPath);
        }
      }
    }

    // --- 2. Ouvrir la base de données ---
    const database = await getDB();

    // --- 3. Créer ou mettre à jour la structure ---
    // On garde les tables d'origine (Bible/Coran) + les nouvelles tables du collaborateur
    await database.execAsync(`
            PRAGMA journal_mode = WAL;
            
            -- Table pour le lecteur (Mobile)
            CREATE TABLE IF NOT EXISTS religious_texts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL, 
                book TEXT NOT NULL,
                chapter INTEGER NOT NULL,
                verse INTEGER NOT NULL,
                content TEXT NOT NULL
            );

            -- Table générique (Collaborateur / Web Seed)
            CREATE TABLE IF NOT EXISTS texts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT,
                book TEXT,
                chapter INTEGER,
                verse INTEGER,
                content TEXT,
                language TEXT DEFAULT 'fr'
            );

            CREATE TABLE IF NOT EXISTS dictionaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                definition TEXT NOT NULL,
                language TEXT NOT NULL,
                source TEXT
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

            CREATE INDEX IF NOT EXISTS idx_religious_source_book ON religious_texts(source, book);
            CREATE INDEX IF NOT EXISTS idx_dict_word ON dictionaries(word);
        `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// --- Seeding Data (Optionnel pour le Web) ---
export const seedDatabase = async () => {
  if (Platform.OS !== 'web') return; // Déjà pré-rempli sur mobile

  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ count: number }>("SELECT count(*) as count FROM texts");
    if (result && result.count === 0) {
      console.log("Seeding initial database (Web)...");
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

export const importFromJSON = async (jsonData: any[]) => {
  const db = await getDB();
  try {
    await db.withTransactionAsync(async () => {
      for (const item of jsonData) {
        await db.runAsync(
          "INSERT INTO texts (source, book, chapter, verse, content, language) VALUES (?, ?, ?, ?, ?, ?)",
          [item.source, item.book, item.chapter || 0, item.verse || 0, item.content, "fr"]
        );
      }
    });
  } catch (e) {
    console.error("Import failed:", e);
  }
};

// --- Helpers pour la lecture de données (API Originale) ---

export const getVerse = async (source: string, book: string, chapter: number, verse: number) => {
  const database = await getDB();
  return await database.getFirstAsync(
    "SELECT * FROM religious_texts WHERE source = ? AND book = ? AND chapter = ? AND verse = ?",
    [source, book, chapter, verse]
  );
};

export const getSurahList = async () => {
  const database = await getDB();
  return await database.getAllAsync(
    "SELECT DISTINCT chapter, book FROM religious_texts WHERE source = 'coran' ORDER BY chapter"
  );
};

export const getSurahVerses = async (surahNumber: number) => {
  const database = await getDB();
  return await database.getAllAsync(
    "SELECT * FROM religious_texts WHERE source = 'coran' AND chapter = ? ORDER BY verse",
    [surahNumber]
  );
};

export const searchReligiousTexts = async (query: string) => {
  const database = await getDB();
  return await database.getAllAsync(
    "SELECT * FROM religious_texts WHERE content LIKE ? LIMIT 5",
    [`%${query}%`]
  );
};

// --- Helpers pour les nouvelles fonctionnalités (API Collaborateur) ---

export const searchTexts = async (query: string, category?: string) => {
  const db = await getDB();
  let sql = "SELECT * FROM texts WHERE (content LIKE ? OR book LIKE ? OR source LIKE ?)";
  let args: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

  if (category && category !== 'all') {
    sql += " AND source = ?";
    args.push(category);
  }

  return await db.getAllAsync(sql, args);
};

export const saveMessage = async (message: any) => {
  const db = await getDB();
  await db.runAsync(
    "INSERT INTO chat_messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
    [message.id, message.session_id, message.role, message.content, message.timestamp]
  );
};

export const loadMessages = async (sessionId: string) => {
  const db = await getDB();
  return await db.getAllAsync(
    "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC",
    [sessionId]
  );
};
