import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { initDatabase, seedDatabase } from "../services/database";

export type Mood = "happy" | "calm" | "anxious" | "stressed";
export type CurrentScreen = "onboarding" | "assistant" | "history" | "dashboard" | "exercises" | "progress" | "profile";
export type AuthScreen = "welcome" | "register" | "login";

// ... Types (UserProfile, MessageAction, Message, Session, AppContextType) ...

export interface UserProfile {
  name: string;
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
  setProfile: (p: UserProfile) => void;
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