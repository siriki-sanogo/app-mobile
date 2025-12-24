import { Feather } from "@expo/vector-icons";
import * as HapticFeedback from "expo-haptics";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useAppContext } from "../contexte/AppContext";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function WelcomeScreen() {
  const { setAuthScreen } = useAppContext();
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const handleSignUp = async () => {
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    setAuthScreen("register");
  };

  const handleLogin = async () => {
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    setAuthScreen("login");
  };

  return (
    <View style={[styles.container, { paddingTop: IS_LARGE_SCREEN ? 60 : 40 }]}>

      {/* Spacer for top */}
      <View style={{ flex: 1 }} />

      {/* Decorative floating elements (bubbles) - Green and Orange accents */}
      <View style={[styles.bubble, { top: "10%", left: "10%", backgroundColor: "rgba(6, 95, 70, 0.1)", width: 20, height: 20 }]} />
      <View style={[styles.bubble, { top: "15%", right: "20%", backgroundColor: "rgba(249, 115, 22, 0.2)", width: 15, height: 15 }]} />
      <View style={[styles.bubble, { bottom: "30%", left: "5%", backgroundColor: "rgba(6, 95, 70, 0.05)", width: 24, height: 24 }]} />
      <View style={[styles.bubble, { bottom: "40%", right: "10%", backgroundColor: "rgba(249, 115, 22, 0.15)", width: 12, height: 12 }]} />


      {/* Main Content Centered */}
      <View style={styles.contentContainer}>
        {/* Placeholder for illustration if needed, or just text */}

        {/* Logo / Nom de l'app */}
        <Text style={styles.appName}>
          GOOD APP
        </Text>

        {/* Phrase de mission - sous-titre */}
        <Text style={styles.subtitle}>
          Un compagnon intelligent qui te propose des contenus positifs
        </Text>

        {/* Description */}
        <Text style={styles.missionText}>
          Bible, Coran, textes africains, bien-être — même sans connexion
        </Text>
      </View>

      {/* Boutons d'action */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Suivant</Text>
          <Feather name="arrow-right" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Link to login */}
        <TouchableOpacity
          style={styles.textLinkButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.textLink}>
            J'ai déjà un compte
          </Text>
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: "#FDFAEF", // Reverted to Cream
    alignItems: "center",
    justifyContent: "space-between",
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.6,
  },
  contentContainer: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  appName: {
    fontSize: IS_LARGE_SCREEN ? 48 : 36,
    fontWeight: "900",
    marginBottom: 16,
    color: "#EA580C", // Orange
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: IS_LARGE_SCREEN ? 20 : 18,
    fontWeight: "600",
    color: "#4B5563", // Grey
    textAlign: "center",
    marginBottom: 12,
  },
  missionText: {
    fontSize: 16,
    color: "#6B7280", // Lighter Grey
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 300,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#F97316", // Orange to match theme
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 99, // Pill shape
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  textLinkButton: {
    marginBottom: 24,
    padding: 8,
  },
  textLink: {
    color: "#065F46", // Dark Green for link
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#F97316", // Orange active dot
  },
});
