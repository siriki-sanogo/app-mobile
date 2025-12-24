import { Feather } from "@expo/vector-icons";
import * as HapticFeedback from "expo-haptics";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function LoginScreen() {
  const { setProfile, setCurrentScreen, setAuthScreen } = useAppContext();
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) {
      setError("Merci d'indiquer ton prénom ou pseudo.");
      await HapticFeedback.notificationAsync(
        HapticFeedback.NotificationFeedbackType.Error
      );
      return;
    }
    if (password.length < 4) {
      setError("Mot de passe incorrect.");
      await HapticFeedback.notificationAsync(
        HapticFeedback.NotificationFeedbackType.Error
      );
      return;
    }

    setError("");
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);

    // Créer un profil utilisateur temporaire (sans vérification de base de données pour l'instant)
    const userProfile = {
      name: name.trim(),
      password,
      language: "fr" as const,
      createdAt: new Date().toISOString(),
    };

    // Mettre à jour le contexte avec le profil
    setProfile(userProfile);

    // Rediriger vers le dashboard
    setCurrentScreen("dashboard");
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button and Logo */}
        <View style={[styles.header, { paddingTop: IS_LARGE_SCREEN ? 60 : 50 }]}>
          <TouchableOpacity
            onPress={() => setAuthScreen("welcome")}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>GOOD APP</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Connexion</Text>

        <View style={styles.content}>
          {/* Error message */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#EF4444" />
              <Text style={[styles.errorText, { marginLeft: 8 }]}>{error}</Text>
            </View>
          ) : null}

          {/* Prénom ou pseudo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Prénom ou pseudo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex : Makan"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Ton mot de passe"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconButton}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Se connecter</Text>
          </TouchableOpacity>

          {/* Lien vers l'inscription */}
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => setAuthScreen("register")}
          >
            <Text style={styles.linkText}>
              Pas encore de compte ? <Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>S&apos;inscrire</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#065F46", // Dark Green
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    justifyContent: "center",
    flexDirection: "row"
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 0,
    zIndex: 10,
    padding: 8,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#065F46",
    textAlign: "center",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "white",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: "#1F2937",
  },
  iconButton: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: "#F97316", // Orange
    borderRadius: 99,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  linkContainer: {
    marginTop: 24,
    paddingVertical: 8,
  },
  linkText: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontSize: 15,
  },
});
