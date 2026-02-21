import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Nom de la base de données
const DB_NAME = "mobile_content_v2.db";
const DB_VERSION = "3"; // Increment to force re-copy from assets

let db: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<void> | null = null;
let dbReady = false;

export const getDB = async () => {
  if (db) return db;
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
  } catch (e) {
    console.error("Failed to open SQLite database:", e);
    if (Platform.OS === 'web') {
      console.warn("Falling back to in-memory store for web.");
      // In-memory storage for web
      const memSessions: any[] = [];
      const memMessages: any[] = [];

      // @ts-ignore
      const mockDb = {
        execAsync: async () => { },
        getFirstAsync: async () => null,
        getAllAsync: async (sql: string, params?: any[]) => {
          // Handle chat_sessions queries
          if (sql.includes('chat_sessions')) {
            return memSessions.map(s => ({
              ...s,
              last_message: memMessages.find(m => m.session_id === s.id && m.role === 'user')?.content || s.title,
              message_count: memMessages.filter(m => m.session_id === s.id).length,
            })).sort((a, b) => b.created_at.localeCompare(a.created_at));
          }
          // Handle chat_messages queries
          if (sql.includes('chat_messages') && params && params[0]) {
            return memMessages
              .filter(m => m.session_id === params[0])
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          }
          return [];
        },
        runAsync: async (sql: string, params?: any[]) => {
          if (!params) return;
          // Handle INSERT into chat_sessions
          if (sql.includes('chat_sessions')) {
            const exists = memSessions.find(s => s.id === params[0]);
            if (!exists) {
              memSessions.push({ id: params[0], title: params[1], created_at: params[2] });
            }
          }
          // Handle INSERT into chat_messages
          if (sql.includes('chat_messages')) {
            memMessages.push({
              id: params[0], session_id: params[1], role: params[2],
              content: params[3], timestamp: params[4]
            });
          }
        },
        withTransactionAsync: async (cb: any) => await cb()
      };
      // @ts-ignore — Cache so subsequent getDB() calls return same instance  
      db = mockDb;
      return mockDb;
    }
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

      // Check if we need to force re-copy (version changed)
      const currentVersion = await AsyncStorage.getItem('db_version');
      const needsCopy = currentVersion !== DB_VERSION;

      // @ts-ignore
      const fileInfo = await FileSystem.getInfoAsync(dbPath);

      if (!fileInfo.exists || needsCopy) {
        console.log(needsCopy ? `DB version changed (${currentVersion} → ${DB_VERSION}), re-copying...` : "Database not found, copying from assets...");

        // Close existing DB connection if any
        db = null;

        // Delete existing DB if it exists
        if (fileInfo.exists) {
          // @ts-ignore
          await FileSystem.deleteAsync(dbPath, { idempotent: true });
        }

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
          await AsyncStorage.setItem('db_version', DB_VERSION);
        } else {
          console.error("Asset URI is null, cannot copy database");
        }
      } else {
        console.log("Database already exists at correct version", DB_VERSION);
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

            CREATE TABLE IF NOT EXISTS proverbs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                author TEXT,
                source TEXT,
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

            CREATE TABLE IF NOT EXISTS encyclopedias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT NOT NULL,
                source TEXT,
                language TEXT DEFAULT 'fr'
            );

            CREATE INDEX IF NOT EXISTS idx_religious_source_book ON religious_texts(source, book);
            CREATE INDEX IF NOT EXISTS idx_dict_word ON dictionaries(word);
            CREATE INDEX IF NOT EXISTS idx_proverbs_language ON proverbs(language);
            CREATE INDEX IF NOT EXISTS idx_encyclo_category ON encyclopedias(category);
        `);

    console.log("Database initialized successfully");
    dbReady = true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Ensure database is initialized before querying
const ensureDbReady = async () => {
  if (!dbReady) {
    if (!dbInitPromise) {
      dbInitPromise = initDatabase();
    }
    await dbInitPromise;
  }
};

// --- Seeding Data (Optionnel pour le Web) ---
export const seedDatabase = async () => {
  if (Platform.OS !== 'web') return; // Déjà pré-rempli sur mobile
  try {
    const database = await getDB();
    // Check if already seeded
    const existing = await database.getFirstAsync('SELECT COUNT(*) as count FROM proverbs') as any;
    if (existing?.count > 0) {
      console.log("Database already seeded");
      return;
    }

    // Seed proverbs
    const proverbsSeed = [
      { content: "La patience est la clé du bien-être.", author: "Proverbe africain", source: "Sagesse africaine", language: "fr" },
      { content: "Celui qui a la santé a l'espoir, celui qui a l'espoir a tout.", author: "Proverbe arabe", source: "Sagesse orientale", language: "fr" },
      { content: "Le bonheur n'est pas au sommet de la montagne mais dans la façon de la gravir.", author: "Confucius", source: "Sagesse asiatique", language: "fr" },
      { content: "Quand la musique change, la danse change aussi.", author: "Proverbe haoussa", source: "Sagesse africaine", language: "fr" },
      { content: "L'arbre ne tombe pas au premier coup de hache.", author: "Proverbe africain", source: "Sagesse africaine", language: "fr" },
      { content: "Un esprit calme apporte la force intérieure et la confiance en soi.", author: "Dalaï Lama", source: "Sagesse bouddhiste", language: "fr" },
      { content: "La gratitude transforme ce que nous avons en suffisance.", author: "Aesop", source: "Sagesse classique", language: "fr" },
      { content: "Patience, patience, patience is the mother of a beautiful child.", author: "Bantu Proverb", source: "African Wisdom", language: "en" },
      { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", source: "Eastern Wisdom", language: "en" },
      { content: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb", source: "African Wisdom", language: "en" },
    ];

    for (const p of proverbsSeed) {
      await database.runAsync(
        'INSERT INTO proverbs (content, author, source, language) VALUES (?, ?, ?, ?)',
        [p.content, p.author, p.source, p.language]
      );
    }

    // Seed encyclopedias
    const encyclopediaSeed = [
      // Santé mentale
      { title: "Anxiété", content: "L'anxiété est une émotion caractérisée par un sentiment d'inquiétude, de nervosité ou de malaise face à un événement ou quelque chose dont l'issue est incertaine. Elle peut se manifester par des symptômes physiques (palpitations, transpiration, tension musculaire) et psychologiques (pensées intrusives, difficulté de concentration). Des techniques comme la respiration profonde, la méditation de pleine conscience et l'activité physique régulière peuvent aider à la gérer efficacement.", category: "santé mentale", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Dépression", content: "La dépression est un trouble de l'humeur courant mais grave qui affecte négativement la façon dont vous vous sentez, pensez et agissez. Elle provoque des sentiments de tristesse et une perte d'intérêt pour les activités autrefois appréciées. La dépression peut entraîner divers problèmes émotionnels et physiques. Il est important de chercher de l'aide professionnelle. Les approches thérapeutiques incluent la psychothérapie (TCC), les activités physiques, la méditation et dans certains cas un suivi médical.", category: "santé mentale", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Stress", content: "Le stress est une réaction physiologique et psychologique de l'organisme face à une situation perçue comme menaçante ou exigeante. Le stress chronique peut avoir des effets néfastes sur la santé : troubles du sommeil, problèmes digestifs, affaiblissement du système immunitaire. La gestion du stress passe par des techniques de relaxation, l'exercice physique, une alimentation équilibrée, le sommeil suffisant et la mise en place de limites saines.", category: "santé mentale", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Résilience", content: "La résilience est la capacité d'un individu à faire face à l'adversité, aux traumatismes, aux tragédies, aux menaces ou à des sources significatives de stress. Être résilient ne signifie pas ne pas éprouver de difficultés ou de détresse. Cela implique des comportements, des pensées et des actions qui peuvent être appris et développés. Les facteurs clés incluent les relations de soutien, l'acceptation du changement, la capacité de se fixer des objectifs réalistes.", category: "développement personnel", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Méditation de pleine conscience", content: "La méditation de pleine conscience (mindfulness) est une pratique qui consiste à porter attention au moment présent, de façon intentionnelle et sans jugement. Des études scientifiques montrent qu'elle réduit le stress, améliore la concentration, diminue les symptômes d'anxiété et de dépression, et favorise le bien-être émotionnel. La pratique régulière, même 10 minutes par jour, peut produire des changements mesurables dans le fonctionnement cérébral.", category: "bien-être", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Intelligence émotionnelle", content: "L'intelligence émotionnelle (IE) est la capacité de reconnaître, comprendre et gérer ses propres émotions, ainsi que celles des autres. Les cinq composantes de l'IE selon Daniel Goleman sont : la conscience de soi, la maîtrise de soi, la motivation, l'empathie et les aptitudes sociales. Développer son IE permet d'améliorer ses relations, sa prise de décision et son bien-être général.", category: "développement personnel", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Thérapie Cognitivo-Comportementale", content: "La TCC (Thérapie Cognitivo-Comportementale) est une approche psychothérapeutique qui vise à modifier les schémas de pensée négatifs et les comportements dysfonctionnels. Elle repose sur l'idée que nos pensées influencent nos émotions et nos comportements. Les techniques incluent la restructuration cognitive, l'exposition graduelle, la résolution de problèmes et la relaxation. C'est l'une des thérapies les plus efficaces pour l'anxiété et la dépression.", category: "santé mentale", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Sommeil et santé mentale", content: "Le sommeil joue un rôle crucial dans la santé mentale. Un adulte a besoin de 7 à 9 heures de sommeil par nuit. Le manque de sommeil augmente le risque de dépression, d'anxiété et de troubles de l'humeur. L'hygiène du sommeil comprend : maintenir des horaires réguliers, éviter les écrans avant le coucher, créer un environnement sombre et frais, limiter la caféine après 14h, et pratiquer des rituels de détente.", category: "bien-être", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Gratitude", content: "La pratique de la gratitude consiste à reconnaître et apprécier consciemment les aspects positifs de la vie. Des recherches en psychologie positive montrent que la gratitude régulière améliore le bien-être subjectif, réduit les symptômes dépressifs, améliore le sommeil et renforce les relations sociales. Tenir un journal de gratitude, écrire des lettres de remerciement, ou simplement noter trois choses positives chaque jour sont des pratiques efficaces.", category: "bien-être", source: "Encyclopédie du Bien-être", language: "fr" },
      { title: "Exercice physique et bien-être", content: "L'activité physique régulière est l'un des moyens les plus efficaces pour améliorer la santé mentale. L'exercice libère des endorphines, réduit le cortisol (hormone du stress), améliore le sommeil et renforce l'estime de soi. L'OMS recommande au moins 150 minutes d'activité modérée par semaine. Même une marche de 30 minutes par jour peut significativement réduire les symptômes d'anxiété et de dépression.", category: "bien-être", source: "Encyclopédie du Bien-être", language: "fr" },
      // Culture africaine (Encyclopédie Africaine)
      { title: "Ubuntu — Philosophie africaine", content: "Ubuntu est un concept philosophique africain qui se traduit par 'Je suis parce que nous sommes'. C'est une éthique humaniste centrée sur l'interconnexion entre les êtres humains. Ubuntu met l'accent sur la compassion, le respect, la dignité humaine et la solidarité communautaire. Cette philosophie enseigne que le bien-être individuel est inséparable du bien-être collectif. Desmond Tutu décrit Ubuntu comme : 'Mon humanité est liée à la vôtre'.", category: "culture africaine", source: "Encyclopédie Africaine", language: "fr" },
      { title: "W.E.B. Du Bois", content: "William Edward Burghardt Du Bois (1868-1963) est un sociologue, historien et militant afro-américain. Co-fondateur de la NAACP, il a consacré sa vie à la lutte contre la discrimination raciale et à la promotion de l'éducation des Noirs. Son concept de 'double conscience' décrit l'expérience de se percevoir à travers le regard de la société dominante. Il a dirigé l'Encyclopédie Africana, un projet encyclopédique visant à documenter systématiquement l'histoire et la culture africaines.", category: "culture africaine", source: "Encyclopédie Africaine", language: "fr" },
      { title: "Encyclopédie Africana", content: "L'Encyclopédie Africana est un projet encyclopédique initié par W.E.B. Du Bois visant à documenter l'ensemble des connaissances sur l'Afrique et la diaspora africaine. Le projet original a été lancé au Ghana en 1961. Il visait à couvrir l'histoire, la culture, les sciences, les arts et les réalisations des peuples africains. Ce projet a influencé de nombreuses publications ultérieures sur les études africaines et la diaspora.", category: "culture africaine", source: "Encyclopédie Africaine", language: "fr" },
      { title: "Sagesse Bantou", content: "La philosophie Bantou est un système de pensée partagé par les peuples bantous d'Afrique subsaharienne. Elle repose sur le concept de 'force vitale' (Muntu), l'interconnexion entre le monde visible et invisible, et le respect des ancêtres. Cette sagesse enseigne que chaque personne possède une énergie vitale qui se renforce ou s'affaiblit selon ses actions et ses relations. Le bien-être dépend de l'harmonie entre l'individu, la communauté et la nature.", category: "culture africaine", source: "Encyclopédie Africaine", language: "fr" },
      { title: "Négritude", content: "La Négritude est un mouvement littéraire et intellectuel fondé dans les années 1930 par Aimé Césaire, Léopold Sédar Senghor et Léon-Gontran Damas. Ce mouvement affirme et valorise l'identité culturelle noire face à la domination coloniale. Senghor définit la Négritude comme 'l'ensemble des valeurs culturelles du monde noir'. Ce mouvement a eu un impact profond sur la conscience identitaire des peuples africains et de la diaspora.", category: "culture africaine", source: "Encyclopédie Africaine", language: "fr" },
      // English entries
      { title: "Anxiety", content: "Anxiety is an emotion characterized by feelings of tension, worried thoughts, and physical changes like increased blood pressure. It becomes a disorder when it interferes with daily life. Effective management includes deep breathing exercises, progressive muscle relaxation, cognitive behavioral techniques, regular physical exercise, and mindfulness meditation. If symptoms persist, seeking professional help is recommended.", category: "mental health", source: "Wellness Encyclopedia", language: "en" },
      { title: "Mindfulness", content: "Mindfulness is the practice of purposely bringing one's attention to the present moment without judgment. Research shows that regular mindfulness practice reduces stress, improves focus, lowers anxiety and depression symptoms, and enhances emotional well-being. Techniques include body scanning, mindful breathing, walking meditation, and loving-kindness meditation. Even 10 minutes daily can produce measurable brain changes.", category: "well-being", source: "Wellness Encyclopedia", language: "en" },
      { title: "Resilience", content: "Resilience is the ability to adapt well in the face of adversity, trauma, tragedy, threats, or significant sources of stress. Building resilience involves maintaining good relationships, accepting change as part of life, taking decisive actions, nurturing a positive self-view, and keeping things in perspective. It is not a trait but a set of behaviors, thoughts, and actions that can be learned and developed.", category: "personal development", source: "Wellness Encyclopedia", language: "en" },
    ];

    for (const e of encyclopediaSeed) {
      await database.runAsync(
        'INSERT INTO encyclopedias (title, content, category, source, language) VALUES (?, ?, ?, ?, ?)',
        [e.title, e.content, e.category, e.source, e.language]
      );
    }

    console.log("Database seeded with proverbs and encyclopedias");
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
  // Simple keyword search for MVP RAG
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

// Comprehensive search across ALL content tables (religious_texts + texts)
export const searchAllContent = async (query: string, category?: string) => {
  // Ensure DB is initialized before searching
  await ensureDbReady();
  const db = await getDB();
  let allResults: any[] = [];

  // Diagnostic: check if table has data (only on first call)
  try {
    const countResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM religious_texts') as any;
    console.log("[searchAllContent] religious_texts total rows:", countResult?.count);
  } catch (diagErr) {
    console.log("[searchAllContent] DIAGNOSTIC ERROR - religious_texts table may not exist:", diagErr);
  }

  // 1. Search religious_texts table (pre-built mobile DB with actual Quran/Bible verses)
  try {
    let rtSql = "SELECT id, source, book, chapter, verse, content FROM religious_texts WHERE (content LIKE ? OR book LIKE ?)";
    let rtArgs: any[] = [`%${query}%`, `%${query}%`];

    if (category && category !== 'all') {
      rtSql += " AND source = ?";
      rtArgs.push(category);
    }

    rtSql += " LIMIT 20";
    console.log("[searchAllContent] Query:", query, "Category:", category);
    const rtResults = await db.getAllAsync(rtSql, rtArgs);
    console.log("[searchAllContent] religious_texts results:", (rtResults as any[]).length);
    if ((rtResults as any[]).length > 0) {
      console.log("[searchAllContent] First result:", JSON.stringify((rtResults as any[])[0]));
    }
    allResults = [...(rtResults as any[])];
  } catch (e) {
    console.log("Error searching religious_texts:", e);
  }

  // 2. Search texts table (web-seeded or imported data)
  try {
    let txtSql = "SELECT id, source, book, chapter, verse, content FROM texts WHERE (content LIKE ? OR book LIKE ? OR source LIKE ?)";
    let txtArgs: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (category && category !== 'all') {
      txtSql += " AND source = ?";
      txtArgs.push(category);
    }

    txtSql += " LIMIT 10";
    const txtResults = await db.getAllAsync(txtSql, txtArgs);
    console.log("[searchAllContent] texts results:", (txtResults as any[]).length);
    allResults = [...allResults, ...(txtResults as any[])];
  } catch (e) {
    console.log("Error searching texts:", e);
  }

  console.log("[searchAllContent] total results:", allResults.length);
  return allResults;
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

export const createSession = async (session: any) => {
  const db = await getDB();
  await db.runAsync(
    "INSERT OR IGNORE INTO chat_sessions (id, title, created_at) VALUES (?, ?, ?)",
    [session.id, session.title, session.created_at]
  );
};

export const getSessions = async () => {
  const db = await getDB();
  // Get sessions with the most recent user message as the "question" snippet
  return await db.getAllAsync(`
    SELECT s.*, 
      (SELECT m.content FROM chat_messages m WHERE m.session_id = s.id AND m.role = 'user' ORDER BY m.timestamp ASC LIMIT 1) as last_message,
      (SELECT COUNT(*) FROM chat_messages m2 WHERE m2.session_id = s.id) as message_count
    FROM chat_sessions s
    ORDER BY s.created_at DESC
  `);
};

// --- Dictionary Functions ---

export const searchDictionary = async (query: string, language?: string) => {
  const db = await getDB();
  let sql = "SELECT * FROM dictionaries WHERE word LIKE ?";
  let args: any[] = [`%${query}%`];

  if (language) {
    sql += " AND language = ?";
    args.push(language);
  }

  sql += " LIMIT 10";
  return await db.getAllAsync(sql, args);
};

export const getDefinition = async (word: string, language: string = 'fr') => {
  const db = await getDB();
  return await db.getFirstAsync(
    "SELECT * FROM dictionaries WHERE LOWER(word) = LOWER(?) AND language = ?",
    [word, language]
  );
};

// --- Proverbs Functions ---

export const searchProverbs = async (query: string, language?: string) => {
  const db = await getDB();
  let sql = "SELECT * FROM proverbs WHERE content LIKE ?";
  let args: any[] = [`%${query}%`];

  if (language) {
    sql += " AND language = ?";
    args.push(language);
  }

  sql += " LIMIT 5";
  return await db.getAllAsync(sql, args);
};

export const getRandomProverb = async (language: string = 'fr') => {
  const db = await getDB();
  return await db.getFirstAsync(
    "SELECT * FROM proverbs WHERE language = ? ORDER BY RANDOM() LIMIT 1",
    [language]
  );
};

export const getProverbsByAuthor = async (author: string) => {
  const db = await getDB();
  return await db.getAllAsync(
    "SELECT * FROM proverbs WHERE author LIKE ?",
    [`%${author}%`]
  );
};

// --- Encyclopedia Functions ---

export const searchEncyclopedia = async (query: string, language?: string) => {
  const db = await getDB();
  const lang = language || 'fr';
  return db.getAllAsync(
    'SELECT * FROM encyclopedias WHERE (title LIKE ? OR content LIKE ?) AND language = ? LIMIT 10',
    [`%${query}%`, `%${query}%`, lang]
  );
};
