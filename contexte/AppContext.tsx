import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService, UserRegisterData } from "../services/api";
import { initDatabase, seedDatabase } from "../services/database";

export type Mood = "happy" | "calm" | "anxious" | "stressed";
export type CurrentScreen = "onboarding" | "assistant" | "history" | "dashboard" | "exercises" | "progress" | "profile";
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
  // Auth Functions
  login: (email: string, pass: string) => Promise<void>;
  register: (data: UserRegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  moodHistory: Mood[]; // New
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initDatabase();
    seedDatabase();
  }, []);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>("onboarding");
  const [authScreen, setAuthScreen] = useState<AuthScreen>("welcome");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Global loading state

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      text: "Bonjour ! Comment puis-je vous accompagner aujourd'hui ?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      date: "02 Déc 2025, 14:30",
      date_fr: "02 Déc 2025, 14:30",
      date_en: "Dec 02, 2025, 2:30 PM",
      mood: "calm",
      question: "Comment gérer le stress au travail ?",
      question_fr: "Comment gérer le stress au travail ?",
      question_en: "How to manage stress at work?",
      messages: [],
    },
    {
      id: "2",
      date: "01 Déc 2025, 09:15",
      date_fr: "01 Déc 2025, 09:15",
      date_en: "Dec 01, 2025, 9:15 AM",
      mood: "anxious",
      question: "J'ai du mal à dormir ces derniers temps",
      question_fr: "J'ai du mal à dormir ces derniers temps",
      question_en: "I have trouble sleeping lately",
      messages: [],
    },
    {
      id: "3",
      date: "30 Nov 2025, 18:45",
      date_fr: "30 Nov 2025, 18:45",
      date_en: "Nov 30, 2025, 6:45 PM",
      mood: "happy",
      question: "Exercices de gratitude",
      question_fr: "Exercices de gratitude",
      question_en: "Gratitude exercises",
      messages: [],
    },
    {
      id: "4",
      date: "29 Nov 2025, 12:00",
      date_fr: "29 Nov 2025, 12:00",
      date_en: "Nov 29, 2025, 12:00 PM",
      mood: "stressed",
      question: "Techniques de respiration",
      question_fr: "Techniques de respiration",
      question_en: "Breathing techniques",
      messages: [],
    },
  ]);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]); // Added missing state

  // Initial Check for Token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          // Verify token or get profile
          const userData = await authService.getProfile();
          // Map backend user to local profile structure
          setProfile({
            id: userData.id,
            name: userData.full_name || userData.username,
            email: userData.email,
            language: userData.language as any,
            preferences: userData.preferences,
            createdAt: userData.created_at
          });
          setCurrentScreen("dashboard");
        }
      } catch (e) {
        console.log("Auth check failed", e);
        // Token invalid or expired
        await AsyncStorage.removeItem("user_token");
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, pass);
      await AsyncStorage.setItem("user_token", data.access_token);

      const user = data.user;
      setProfile({
        id: user.id,
        name: user.full_name || user.username,
        email: user.email,
        language: user.language as any,
        preferences: user.preferences,
        createdAt: user.created_at
      });
      setCurrentScreen("dashboard");
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
    await AsyncStorage.removeItem("user_token");
    setProfile(null);
    setAuthScreen("welcome");
  };

  function addSession(session: Session) {
    setSessions((prev) => [session, ...prev]);
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
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
        login,
        register,
        logout,
        isLoading,
        moodHistory, // Added to value
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