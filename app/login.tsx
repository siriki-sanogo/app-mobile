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

export default function LoginScreen() {
  const { setAuthScreen, login } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < 4) {
      setError("Le mot de passe est trop court.");
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }

    setError("");
    setLoading(true);
    HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Échec de connexion. Vérifiez vos identifiants.";
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
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#F97316", "#FB923C"]}
                style={styles.logoGradient}
              >
                <Feather name="shield" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>GOOD APP</Text>
            <Text style={styles.tagline}>Votre compagnon de sérénité</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>Bon retour !</Text>
            <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

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
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.label}>Mot de passe</Text>
                <TouchableOpacity onPress={() => { /* Forgot password logic */ }}>
                  <Text style={styles.forgotText}>Oublié ?</Text>
                </TouchableOpacity>
              </View>
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

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Chargement..." : "Se connecter"}
              </Text>
              {!loading && <Feather name="arrow-right" size={20} color="white" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => setAuthScreen("register")}
            >
              <Text style={styles.noAccountText}>
                Nouveau ici ? <Text style={styles.registerText}>Créer un compte</Text>
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
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 24,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    height: 60,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 16,
  },
  forgotText: {
    fontSize: 13,
    color: "#F97316",
    fontWeight: "700",
  },
  loginButton: {
    backgroundColor: "#F97316",
    borderRadius: 18,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  registerLink: {
    alignItems: "center",
  },
  noAccountText: {
    fontSize: 15,
    color: "#6B7280",
  },
  registerText: {
    color: "#047857",
    fontWeight: "800",
  },
});
