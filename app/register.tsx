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

export default function RegisterScreen() {
  const { setProfile, setCurrentScreen, setAuthScreen, register } = useAppContext();
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [goal, setGoal] = useState(""); // Removed per user request
  const [gender, setGender] = useState<"masculin" | "feminin" | null>(null);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [showBible, setShowBible] = useState(true);
  const [showCoran, setShowCoran] = useState(true);
  const [showAfrican, setShowAfrican] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      setError("Merci d'indiquer un prénom ou pseudo.");
      await HapticFeedback.notificationAsync(
        HapticFeedback.NotificationFeedbackType.Error
      );
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Merci d'indiquer une adresse email valide.");
      await HapticFeedback.notificationAsync(
        HapticFeedback.NotificationFeedbackType.Error
      );
      return;
    }
    if (password.length < 4) {
      setError("Le mot de passe doit faire au moins 4 caractères.");
      await HapticFeedback.notificationAsync(
        HapticFeedback.NotificationFeedbackType.Error
      );
      return;
    }
    if (!gender) {
      setError("Merci de sélectionner un genre.");
      await HapticFeedback.notificationAsync(
        HapticFeedback.NotificationFeedbackType.Error
      );
      return;
    }

    setError("");
    setLoading(true);
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);

    try {
      const userProfile = {
        name: name.trim(),
        email: email.trim(),
        password,
        gender,
        language: lang,
        preferences: {
          showBible,
          showCoran,
          showAfrican,
        },
      };

      // Call the register function from the context
      await register(userProfile);

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Erreur lors de l'inscription.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={[styles.header, { paddingTop: IS_LARGE_SCREEN ? 60 : 50 }]}>
          <TouchableOpacity
            onPress={() => setAuthScreen("welcome")}
            style={{ position: "absolute", left: 16, top: IS_LARGE_SCREEN ? 56 : 46, zIndex: 10, padding: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 }}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          {/* Logo Circle */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>GOOD APP</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Error message */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#FECACA" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Prénom ou pseudo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nom & Prénoms</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#047857" style={{ marginLeft: 16 }} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Alexander"
                placeholderTextColor="rgba(4, 120, 87, 0.5)"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#047857" style={{ marginLeft: 16 }} />
              <TextInput
                style={styles.input}
                placeholder="exemple@email.com"
                placeholderTextColor="rgba(4, 120, 87, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#047857" style={{ marginLeft: 16 }} />
              <TextInput
                style={styles.input}
                placeholder="Votre mot de passe"
                placeholderTextColor="rgba(4, 120, 87, 0.5)"
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
                  size={20}
                  color="#047857"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Ce mot de passe garantit votre anonymat.</Text>
          </View>

          {/* Gender Selection */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Genre</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === "masculin" && styles.genderButtonActive]}
                onPress={() => setGender("masculin")}
                activeOpacity={0.8}
              >
                <Feather name="user" size={20} color={gender === "masculin" ? "white" : "#047857"} />
                <Text style={[styles.genderText, gender === "masculin" && { color: "white" }]}>Masculin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderButton, gender === "feminin" && styles.genderButtonActive]}
                onPress={() => setGender("feminin")}
                activeOpacity={0.8}
              >
                <Feather name="user" size={20} color={gender === "feminin" ? "white" : "#047857"} />
                <Text style={[styles.genderText, gender === "feminin" && { color: "white" }]}>Féminin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton d'inscription */}
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>{loading ? "Chargement..." : "Suivant"}</Text>
            {!loading && <Feather name="arrow-right" size={20} color="white" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

          {/* Lien vers la connexion */}
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => setAuthScreen("login")}
          >
            <Text style={styles.linkText}>
              Tu as déjà un compte ? <Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
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
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    fontSize: 20,
    fontWeight: "900",
    color: "#065F46", // Green text matching bg
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "rgba(254, 202, 202, 0.9)",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 0,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#064E3B", // Dark Green text
  },
  iconButton: {
    padding: 16,
  },
  helperText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 6,
    marginLeft: 4,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 16,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
  },
  genderButtonActive: {
    backgroundColor: "#F97316", // Orange
  },
  genderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
  },
  submitButton: {
    backgroundColor: "#F97316", // Orange
    borderRadius: 99, // Pill shape
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "center",
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
    alignItems: "center",
  },
  linkText: {
    color: "white",
    fontSize: 15,
  },
});
