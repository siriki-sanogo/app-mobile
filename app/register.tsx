import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as HapticFeedback from "expo-haptics";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";

const { width, height } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function RegisterScreen() {
  const { setAuthScreen, register } = useAppContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Merci d'indiquer votre nom.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Adresse email invalide.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une majuscule.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une minuscule.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins un chiffre.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins un caractère spécial.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (!gender) {
      setError("Veuillez sélectionner votre genre.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }

    setError("");
    setLoading(true);
    HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);

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
      await register(userProfile);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Erreur lors de l'inscription.";
      setError(msg);
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#064E3B", "#065F46", "#047857"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => setAuthScreen("welcome")}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.topSection}>
            <Text style={styles.brandName}>Rejoignez GOOD APP</Text>
            <Text style={styles.tagline}>Commencez votre voyage vers la sérénité</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Création de compte</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Jean Dupont"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse Email</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nom@exemple.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <View style={{ marginTop: 8, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name={password.length >= 8 ? "check-circle" : "x-circle"} size={14} color={password.length >= 8 ? "#16A34A" : "#9CA3AF"} />
                  <Text style={{ fontSize: 12, color: password.length >= 8 ? "#16A34A" : "#9CA3AF", fontWeight: "500" }}>8 caractères minimum</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name={/[A-Z]/.test(password) ? "check-circle" : "x-circle"} size={14} color={/[A-Z]/.test(password) ? "#16A34A" : "#9CA3AF"} />
                  <Text style={{ fontSize: 12, color: /[A-Z]/.test(password) ? "#16A34A" : "#9CA3AF", fontWeight: "500" }}>Une lettre majuscule</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name={/[a-z]/.test(password) ? "check-circle" : "x-circle"} size={14} color={/[a-z]/.test(password) ? "#16A34A" : "#9CA3AF"} />
                  <Text style={{ fontSize: 12, color: /[a-z]/.test(password) ? "#16A34A" : "#9CA3AF", fontWeight: "500" }}>Une lettre minuscule</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name={/[0-9]/.test(password) ? "check-circle" : "x-circle"} size={14} color={/[0-9]/.test(password) ? "#16A34A" : "#9CA3AF"} />
                  <Text style={{ fontSize: 12, color: /[0-9]/.test(password) ? "#16A34A" : "#9CA3AF", fontWeight: "500" }}>Un chiffre</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name={/[^A-Za-z0-9]/.test(password) ? "check-circle" : "x-circle"} size={14} color={/[^A-Za-z0-9]/.test(password) ? "#16A34A" : "#9CA3AF"} />
                  <Text style={{ fontSize: 12, color: /[^A-Za-z0-9]/.test(password) ? "#16A34A" : "#9CA3AF", fontWeight: "500" }}>Un caractère spécial (!@#$...)</Text>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Genre</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderBtn, gender === "masculin" && styles.genderBtnActive]}
                  onPress={() => setGender("masculin")}
                >
                  <Text style={[styles.genderBtnText, gender === "masculin" && styles.genderBtnTextActive]}>Homme</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderBtn, gender === "feminin" && styles.genderBtnActive]}
                  onPress={() => setGender("feminin")}
                >
                  <Text style={[styles.genderBtnText, gender === "feminin" && styles.genderBtnTextActive]}>Femme</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Création..." : "S'inscrire"}
              </Text>
              {!loading && <Feather name="chevron-right" size={22} color="white" style={{ marginLeft: 6 }} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => setAuthScreen("login")}
            >
              <Text style={styles.alreadyAccountText}>
                Déjà un compte ? <Text style={styles.loginText}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#064E3B",
  },
  scrollContent: {
    paddingBottom: 40,
    minHeight: height,
  },
  backButton: {
    marginTop: Platform.OS === "ios" ? 50 : 30,
    marginLeft: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  topSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  brandName: {
    fontSize: 26,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    height: 54,
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 14,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  genderBtnActive: {
    borderColor: "#047857",
    backgroundColor: "#ECFDF5",
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  genderBtnTextActive: {
    color: "#047857",
  },
  submitButton: {
    backgroundColor: "#F97316",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
  },
  alreadyAccountText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginText: {
    color: "#047857",
    fontWeight: "800",
  },
});
