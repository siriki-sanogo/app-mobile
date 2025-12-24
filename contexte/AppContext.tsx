import React, { createContext, ReactNode, useContext, useState } from "react";

export type Mood = "happy" | "calm" | "anxious" | "stressed";
export type CurrentScreen = "onboarding" | "assistant" | "history" | "dashboard" | "exercises" | "progress" | "profile";
export type AuthScreen = "welcome" | "register" | "login";

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

export interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  timestamp: string;
  helpful?: boolean | null;
}

export interface Session {
  id: string;
  date: string;
  mood: Mood;
  question: string;
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
  setMessages: (messages: Message[]) => void;
  sessions: Session[];
  addSession: (session: Session) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
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
      mood: "calm",
      question: "Comment gérer le stress au travail ?",
      messages: [],
    },
    {
      id: "2",
      date: "01 Déc 2025, 09:15",
      mood: "anxious",
      question: "J'ai du mal à dormir ces derniers temps",
      messages: [],
    },
    {
      id: "3",
      date: "30 Nov 2025, 18:45",
      mood: "happy",
      question: "Exercices de gratitude",
      messages: [],
    },
    {
      id: "4",
      date: "29 Nov 2025, 12:00",
      mood: "stressed",
      question: "Techniques de respiration",
      messages: [],
    },
  ]);

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