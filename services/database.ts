import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

// Nom de la base de données
const DB_NAME = "mobile_content.db";

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return db;
};

// Initialisation des tables
export const initDatabase = async () => {
  try {
    // 1. Copie de la base de données depuis les Assets si elle n'existe pas
    const dbDir = `${FileSystem.documentDirectory}SQLite`;
    const dbPath = `${dbDir}/${DB_NAME}`;

    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    if (!fileInfo.exists) {
      console.log("Database not found, copying from assets...");

      // Créer le dossier SQLite s'il n'existe pas
      if (!(await FileSystem.getInfoAsync(dbDir)).exists) {
        await FileSystem.makeDirectoryAsync(dbDir);
      }

      // Charger l'asset
      const asset = Asset.fromModule(require("../assets/mobile_content.db"));
      await asset.downloadAsync();

      if (asset.localUri || asset.uri) {
        await FileSystem.copyAsync({
          from: asset.localUri || asset.uri,
          to: dbPath,
        });
        console.log("Database copied successfully to", dbPath);
      } else {
        console.error("Asset URI is null, cannot copy database");
      }
    } else {
      console.log("Database already exists at", dbPath);
    }

    // 2. Ouvrir la base de données
    const database = await getDB();

    // 3. Créer les tables MANQUANTES (si on a ajouté des tables après la création du fichier .db)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS religious_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL, 
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        content TEXT NOT NULL
      );
    `);

    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_religious_source_book ON religious_texts(source, book);
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS dictionaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        definition TEXT NOT NULL,
        language TEXT NOT NULL,
        source TEXT
      );
    `);

    await database.execAsync(`
       CREATE INDEX IF NOT EXISTS idx_dict_word ON dictionaries(word);
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_content (
        id INTEGER PRIMARY KEY,
        title TEXT,
        body TEXT,
        type TEXT,
        author TEXT,
        source TEXT,
        is_favorite BOOLEAN DEFAULT 0,
        view_count INTEGER DEFAULT 0
      );
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// --- Helpers pour la lecture de données ---

export const getVerse = async (
  source: string,
  book: string,
  chapter: number,
  verse: number
) => {
  const database = await getDB();
  return await database.getFirstAsync(
    "SELECT * FROM religious_texts WHERE source = ? AND book = ? AND chapter = ? AND verse = ?",
    source,
    book,
    chapter,
    verse
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
    surahNumber
  );
};

export const searchDictionary = async (word: string) => {
  const database = await getDB();
  return await database.getAllAsync(
    "SELECT * FROM dictionaries WHERE word LIKE ? LIMIT 10",
    `${word}%`
  );
};
