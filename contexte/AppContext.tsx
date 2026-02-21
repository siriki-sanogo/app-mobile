import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService, UserRegisterData } from "../services/api";
import { initDatabase, seedDatabase, getSessions } from "../services/database";

export type Mood = "happy" | "calm" | "anxious" | "stressed";
export type CurrentScreen = "onboarding" | "assistant" | "history" | "dashboard" | "exercises" | "progress" | "profile" | "insights" | "settings" | "help" | "sources" | "privacy";
export type AuthScreen = "welcome" | "register" | "login";

// ... Types (UserProfile, MessageAction, Message, Session, AppContextType) ...

export interface UserProfile {
  id?: number; // Backend ID
  name: string;
  email?: string; // Added email
  ageRange?: string; // Changed from age
  religion?: string; // New
  photoUri?: string; // New
  goal?: string;
  objectives?: string[]; // Renamed/Clarified from concerns/goals overlap
  selectedBooks?: string[]; // New
  language: "fr" | "en";
  preferences?: {
    showBible: boolean;
    showCoran: boolean;
    showAfrican: boolean;
  };
  createdAt?: string;
}

export interface MessageAction {
  label: string;
  action: string; // e.g., "navigate:exercises"
  style?: "primary" | "secondary";
}

export interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  timestamp: string;
  helpful?: boolean | null;
  actions?: MessageAction[];
  audioUri?: string; // [NEW] for voice notes
  status?: "sent" | "sending" | "error"; // [NEW] for voice notes
}

export interface Session {
  id: string;
  date: string;
  date_fr?: string;
  date_en?: string;
  mood: Mood;
  question: string; // Keep for backward compatibility if needed, or deprecate
  question_fr?: string;
  question_en?: string;
  messages: Message[];
}

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  currentScreen: CurrentScreen;
  setCurrentScreen: (screen: CurrentScreen) => void;
  authScreen: AuthScreen;
  setAuthScreen: (screen: AuthScreen) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessions: Session[];
  addSession: (session: Session) => void;
  refreshSessions: () => Promise<void>;
  // Auth Functions
  login: (email: string, pass: string) => Promise<void>;
  register: (data: UserRegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  moodHistory: { date: string; mood: Mood }[];
  streak: number;
  updateMood: (mood: Mood) => Promise<void>;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  pendingMessage: string | null;
  setPendingMessage: (msg: string | null) => void;
  pendingSessionId: string | null;
  setPendingSessionId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initDatabase();
    seedDatabase();
    // Load persisted dark mode preference
    AsyncStorage.getItem('darkMode').then(val => {
      if (val !== null) setDarkModeState(JSON.parse(val));
    });
  }, []);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>("onboarding");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>("welcome");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Global loading state
  const [darkMode, setDarkModeState] = useState(false); // Light mode by default

  // Dark mode with persistence
  const setDarkMode = async (val: boolean) => {
    setDarkModeState(val);
    await AsyncStorage.setItem('darkMode', JSON.stringify(val));
  };

  // Update profile with local persistence (preferences survive app restart)
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...data };
    setProfile(newProfile);
    console.log('[updateProfile] Saving profile locally...', JSON.stringify(data.preferences));
    // Save full profile to cache
    await AsyncStorage.setItem('user_profile_cache', JSON.stringify(newProfile));
    // Save preferences separately as local override (survives backend sync)
    if (data.preferences) {
      await AsyncStorage.setItem('local_preferences', JSON.stringify(data.preferences));
      console.log('[updateProfile] local_preferences saved to AsyncStorage');
    }
    // Try to sync with backend
    try {
      const backendData: any = {};
      if (data.preferences) backendData.preferences = data.preferences;
      if (data.name) backendData.full_name = data.name;
      console.log('[updateProfile] Syncing to backend (PUT /users/me):', JSON.stringify(backendData));
      await authService.updateProfile(backendData);
      console.log('[updateProfile] Backend sync successful');
    } catch (e: any) {
      console.log('[updateProfile] Backend sync failed:', e?.response?.status, e?.message);
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      text: "Bonjour ! Comment puis-je vous accompagner aujourd'hui ?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [moodHistory, setMoodHistory] = useState<{ date: string; mood: Mood }[]>([]);
  const [streak, setStreak] = useState(0);

  const calculateStreak = (history: { date: string; mood: Mood }[]) => {
    if (history.length === 0) return 0;
    // Simple logic: count consecutive days starting from today or yesterday
    const dates = history.map(h => new Date(h.date).toDateString());
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let today = new Date();
    let checkDate = new Date(today);

    // If last activity wasn't today or yesterday, streak is 0
    const lastDate = new Date(uniqueDates[0]);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays > 1) return 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      const d = new Date(uniqueDates[i]);
      const diff = Math.floor((checkDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diff === 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const updateMood = async (mood: Mood) => {
    const today = new Date().toISOString();
    const newEntry = { date: today, mood };
    const newHistory = [newEntry, ...moodHistory].slice(0, 30); // Keep last 30
    setMoodHistory(newHistory);
    setStreak(calculateStreak(newHistory));
    await AsyncStorage.setItem("mood_history", JSON.stringify(newHistory));
  };

  const refreshSessions = async () => {
    try {
      const dbSessions = await getSessions();
      // Map DB sessions to the Session interface
      const mappedSessions: Session[] = dbSessions.map((s: any) => ({
        id: s.id,
        date: s.created_at,
        mood: "calm", // Default or could be extracted from messages if analyzed
        question: s.last_message || s.title || "Conversation",
        messages: [],
      }));
      setSessions(mappedSessions);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await seedDatabase();
      await refreshSessions();
    };
    init();
  }, []);

  // Initial Check for Token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Load cached profile for instant startup
        const cachedProfile = await AsyncStorage.getItem('user_profile_cache');
        console.log('[checkAuth] cachedProfile exists:', !!cachedProfile);
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
          setCurrentScreen('dashboard');
        }

        const token = await AsyncStorage.getItem('user_token');
        console.log('[checkAuth] token exists:', !!token);
        if (token) {
          // 2. Get fresh profile from backend
          const userData = await authService.getProfile();
          console.log('[checkAuth] backend prefs:', JSON.stringify(userData.preferences));

          // 3. Load local preferences override (these are authoritative)
          const localPrefsJson = await AsyncStorage.getItem('local_preferences');
          const localPrefs = localPrefsJson ? JSON.parse(localPrefsJson) : null;
          console.log('[checkAuth] local_preferences:', localPrefsJson);

          // 4. Build profile, with local prefs taking priority over backend
          const mergedPrefs = localPrefs || userData.preferences;
          console.log('[checkAuth] using prefs:', JSON.stringify(mergedPrefs));
          const freshProfile = {
            id: userData.id,
            name: userData.full_name || userData.username,
            email: userData.email,
            language: userData.language as any,
            preferences: mergedPrefs,
            createdAt: userData.created_at
          };
          setProfile(freshProfile);
          await AsyncStorage.setItem('user_profile_cache', JSON.stringify(freshProfile));

          if (!cachedProfile) setCurrentScreen('dashboard');
        }
      } catch (e) {
        console.log('Auth check failed', e);
        // Don't remove token on network error
      }
    };
    const loadData = async () => {
      try {
        const savedMoods = await AsyncStorage.getItem('mood_history');
        if (savedMoods) {
          const history = JSON.parse(savedMoods);
          setMoodHistory(history);
          setStreak(calculateStreak(history));
        }
      } catch (e) {
        console.error('Failed to load mood history', e);
      }
    };
    loadData();
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, pass);
      await AsyncStorage.setItem('user_token', data.access_token);

      const user = data.user;

      // Load local preferences override if any
      const localPrefsJson = await AsyncStorage.getItem('local_preferences');
      const localPrefs = localPrefsJson ? JSON.parse(localPrefsJson) : null;

      const newProfile = {
        id: user.id,
        name: user.full_name || user.username,
        email: user.email,
        language: user.language as any,
        preferences: localPrefs || user.preferences,
        createdAt: user.created_at
      };
      setProfile(newProfile);
      await AsyncStorage.setItem('user_profile_cache', JSON.stringify(newProfile));
      setCurrentScreen('dashboard');
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: UserRegisterData) => {
    setIsLoading(true);
    try {
      // 1. Register
      await authService.register(data);
      // 2. Auto Login
      await login(data.email, data.password);
      setCurrentScreen("onboarding"); // Go to onboarding logic instead of dashboard directly?
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_profile_cache');
    await AsyncStorage.removeItem('local_preferences');
    setProfile(null);
    setAuthScreen('welcome');
  };

  function addSession(session: Session) {
    setSessions((prev) => [session, ...prev]);
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        currentScreen,
        setCurrentScreen,
        authScreen,
        setAuthScreen,
        onboardingStep,
        setOnboardingStep,
        messages,
        setMessages,
        sessions,
        addSession,
        refreshSessions,
        login,
        register,
        logout,
        isLoading,
        moodHistory,
        streak,
        updateMood,
        darkMode,
        setDarkMode,
        pendingMessage,
        setPendingMessage,
        pendingSessionId,
        setPendingSessionId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext doit être utilisé à l'intérieur d'AppProvider");
  return ctx;
}