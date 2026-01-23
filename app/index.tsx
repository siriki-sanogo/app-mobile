import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import SideMenu from "../components/SideMenu";
import { useAppContext } from "../contexte/AppContext";
import AssistantScreenNew from "./assistant";
import DashboardScreen from "./dashboard";
import ExercisesScreen from "./exercises";
import HistoryScreen from "./history";
import LoginScreen from "./login";
import OnboardingScreen from "./onboarding";
import ProfileScreen from "./profile";
import ProgressScreen from "./progress";
import RegisterScreen from "./register";
import WelcomeScreen from "./welcome";
import InsightsScreen from "./insights";
import SettingsScreen from "./settings";
import HelpScreen from "./help";
import SourcesScreen from "./sources";
import PrivacyScreen from "./privacy";

// Bottom navigation removed as requested (no buttons at bottom)

export default function HomeScreen() {
  const { currentScreen, setCurrentScreen, profile, authScreen } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  // Si l'utilisateur n'a pas de profil, montrer l'écran d'authentification
  if (!profile) {
    if (authScreen === "register") {
      return <RegisterScreen />;
    }
    if (authScreen === "login") {
      return <LoginScreen />;
    }
    return <WelcomeScreen />;
  }

  // Si aucun écran n'est sélectionné, afficher le dashboard par défaut
  const screenToRender = currentScreen || "dashboard";

  // Screens that handle their own headers
  const HAS_CUSTOM_HEADER = [
    "onboarding", "assistant", "profile", "exercises", "progress",
    "insights", "settings", "help", "sources", "privacy"
  ];
  const showGenericHeader = !HAS_CUSTOM_HEADER.includes(screenToRender);

  const SCREEN_TITLES: Record<string, string> = {
    dashboard: "Good App",
    history: "Historique",
    insights: "Bilan Émotionnel",
    settings: "Paramètres",
    help: "Aide & Support",
    sources: "Sources et Références",
    privacy: "Confidentialité",
  };

  const currentTitle = SCREEN_TITLES[screenToRender] || "Good App";

  return (
    <View style={styles.container}>
      {/* Generic Header (Only for Dashboard/History) */}
      {showGenericHeader && (
        <View style={[styles.appHeader, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#065F46" }]}>
          {/* Changed Blue #3B82F6 to Green #065F46 */}
          {screenToRender === "dashboard" ? (
            <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ padding: 8 }} accessibilityLabel="Ouvrir le menu">
              <Feather name="menu" size={22} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={{ padding: 8 }} accessibilityLabel="Retour">
              <Feather name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.appHeaderTitle}>{currentTitle}</Text>
          <View style={{ width: 44 }} />
        </View>
      )}

      {/* Render current screen */}
      {screenToRender === "onboarding" && <OnboardingScreen />}
      {screenToRender === "assistant" && <AssistantScreenNew />}
      {screenToRender === "history" && <HistoryScreen />}
      {screenToRender === "dashboard" && <DashboardScreen />}
      {screenToRender === "exercises" && <ExercisesScreen />}
      {screenToRender === "progress" && <ProgressScreen />}
      {screenToRender === "profile" && <ProfileScreen />}
      {screenToRender === "insights" && <InsightsScreen />}
      {screenToRender === "settings" && <SettingsScreen />}
      {screenToRender === "help" && <HelpScreen />}
      {screenToRender === "sources" && <SourcesScreen />}
      {screenToRender === "privacy" && <PrivacyScreen />}

      {/* Side menu */}
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} currentScreen={screenToRender} setCurrentScreen={(s) => { setCurrentScreen(s); setMenuOpen(false); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Grey 100
  },
  appHeader: {
    height: 64,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appHeaderTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
});
