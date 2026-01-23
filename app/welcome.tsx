import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as HapticFeedback from "expo-haptics";
import React from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppContext } from "../contexte/AppContext";

const { width, height } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function WelcomeScreen() {
  const { setAuthScreen } = useAppContext();

  const handleSignUp = async () => {
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
    setAuthScreen("register");
  };

  const handleLogin = async () => {
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    setAuthScreen("login");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#064E3B", "#065F46", "#047857"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Circles */}
      <View style={[styles.circle, { top: -50, right: -50, width: 200, height: 200, backgroundColor: "rgba(249, 115, 22, 0.1)" }]} />
      <View style={[styles.circle, { bottom: -80, left: -80, width: 250, height: 250, backgroundColor: "rgba(255, 255, 255, 0.05)" }]} />

      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <LinearGradient
            colors={["#F97316", "#FB923C"]}
            style={styles.logoGradient}
          >
            <Feather name="shield" size={60} color="white" />
          </LinearGradient>
        </View>

        <Text style={styles.appName}>GOOD APP</Text>
        <Text style={styles.tagline}>
          Votre voyage vers la sérénité commence ici
        </Text>

        <View style={styles.descriptionBox}>
          <View style={styles.featureItem}>
            <Feather name="check-circle" size={18} color="#F97316" />
            <Text style={styles.featureText}>IA Prévenante & Inspirante</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="check-circle" size={18} color="#F97316" />
            <Text style={styles.featureText}>Textes Sacrés & Bien-être</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="check-circle" size={18} color="#F97316" />
            <Text style={styles.featureText}>Fonctionnement 100% Offline</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>S&apos;inscrire gratuitement</Text>
          <Feather name="arrow-right" size={20} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>
            Déjà un compte ? <Text style={{ fontWeight: "800" }}>Se connecter</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0 • Sécurisé & Privé</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#064E3B",
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: "white",
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
    lineHeight: 26,
  },
  descriptionBox: {
    marginTop: 40,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  primaryButton: {
    backgroundColor: "#F97316",
    height: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 20,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 15,
  },
  versionText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 30,
    fontWeight: "500",
  },
});
