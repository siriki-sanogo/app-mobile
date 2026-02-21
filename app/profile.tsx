import { Feather } from "@expo/vector-icons";
import * as HapticFeedback from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function ProfileScreen() {
  const { profile, setProfile, updateProfile, setCurrentScreen, darkMode } = useAppContext();
  const router = useRouter();
  const t = useTranslation(profile?.language || "fr");

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [goal, setGoal] = useState(profile?.goal || "");
  const [photoUri, setPhotoUri] = useState(profile?.photoUri || null);
  const [showBible, setShowBible] = useState(profile?.preferences?.showBible ?? true);
  const [showCoran, setShowCoran] = useState(profile?.preferences?.showCoran ?? true);
  const [showAfrican, setShowAfrican] = useState(profile?.preferences?.showAfrican ?? true);

  // New Settings State
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  if (!profile) {
    return (
      <View
        style={[
          styles.container,
          darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F3F4F6" },
        ]}
      >
        <Text style={[styles.emptyText, darkMode ? { color: "#9CA3AF" } : {}]}>
          {t("profileIncomplete")}
        </Text>
      </View>
    );
  }

  const pickImage = async () => {
    if (!isEditing) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      await HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Error);
      return;
    }

    const updatedProfile = {
      ...profile,
      name: name.trim(),
      goal: goal.trim(),
      photoUri: photoUri || undefined,
      preferences: {
        showBible,
        showCoran,
        showAfrican,
      },
    };

    updateProfile(updatedProfile);
    setIsEditing(false);
    await HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Success);

    // Rediriger vers le dashboard
    setCurrentScreen("dashboard");
  };

  const handleGoBack = async () => {
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    setCurrentScreen("dashboard");
    // Also try router.back() for stack navigation consistency
    try { router.back(); } catch (e) { }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F3F4F6" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "#065F46" },
          { paddingTop: IS_LARGE_SCREEN ? 60 : 50 }
        ]}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={darkMode ? "#E5E7EB" : "white"} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.headerTitle, darkMode ? { color: "#E5E7EB" } : { color: "white" }]}>
            {t("settingsTitle") || "Paramètres"}
          </Text>
          <Text style={[styles.headerSubtitle, darkMode ? { color: "#9CA3AF" } : { color: "#D1FAE5" }]}>
            {t("manageAccount") || "Gérez votre compte et vos préférences"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Feather name={isEditing ? "check" : "edit-2"} size={20} color={darkMode ? "#E5E7EB" : "white"} />
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, darkMode ? { color: "#E5E7EB" } : { color: "#374151" }]}>{t("section_profile")}</Text>
      </View>

      {/* Profile Info Card (Existing) */}
      <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937", borderColor: "#374151" } : { backgroundColor: "white", borderColor: "#E5E7EB" }]}>
        <View style={styles.avatarSection}>
          {/* Avatar Logic */}
          <TouchableOpacity onPress={pickImage} activeOpacity={isEditing ? 0.7 : 1}>
            <View style={[styles.avatar, darkMode ? { backgroundColor: "#374151" } : { backgroundColor: "#D1FAE5" }]}>
              {photoUri ? <Image source={{ uri: photoUri }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>👤</Text>}
              {isEditing && <View style={styles.editIconOverlay}><Feather name="camera" size={12} color="white" /></View>}
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" }]}>{t("name")}</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, darkMode ? { backgroundColor: "#0B1220", color: "#E5E7EB", borderColor: "#374151" } : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }]}
                value={name} onChangeText={setName} placeholder={t("enterName")} placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
              />
            ) : (
              <Text style={[styles.value, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{profile.name}</Text>
            )}
          </View>
        </View>
      </View>

      {/* General Settings */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, darkMode ? { color: "#E5E7EB" } : { color: "#374151" }]}>{t("section_general")}</Text>
      </View>

      {/* Notifications */}
      <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937", borderColor: "#374151" } : { backgroundColor: "white", borderColor: "#E5E7EB" }]}>
        <View style={styles.settingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="bell" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} style={{ marginRight: 12 }} />
            <Text style={[styles.settingLabel, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{t("notifications")}</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#D1D5DB", true: "#86EFAC" }} thumbColor={notifications ? "#22C55E" : "#9CA3AF"} />
        </View>
      </View>

      {/* Language (Existing) */}
      <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937", borderColor: "#374151" } : { backgroundColor: "white", borderColor: "#E5E7EB" }]}>
        <View style={styles.settingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="globe" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} style={{ marginRight: 12 }} />
            <Text style={[styles.settingLabel, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{t("language")}</Text>
          </View>
          <Text style={[styles.value, darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" }]}>
            {profile.language === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
          </Text>
        </View>
      </View>

      {/* Security */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, darkMode ? { color: "#E5E7EB" } : { color: "#374151" }]}>{t("section_security")}</Text>
      </View>

      <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937", borderColor: "#374151" } : { backgroundColor: "white", borderColor: "#E5E7EB" }]}>
        <View style={styles.settingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="shield" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} style={{ marginRight: 12 }} />
            <Text style={[styles.settingLabel, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{t("face_id")}</Text>
          </View>
          <Switch value={biometrics} onValueChange={setBiometrics} trackColor={{ false: "#D1D5DB", true: "#86EFAC" }} thumbColor={biometrics ? "#22C55E" : "#9CA3AF"} />
        </View>
      </View>

      {/* Content Sources (Existing) */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, darkMode ? { color: "#E5E7EB" } : { color: "#374151" }]}>{t("section_content")}</Text>
      </View>

      <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937", borderColor: "#374151" } : { backgroundColor: "white", borderColor: "#E5E7EB" }]}>
        {/* ... (Existing Source Switches Logic - Bible/Coran/African) ... */}
        {/* Simplified visual for brevity in replace - keeping logic */}
        <View style={styles.preferenceRow}>
          <Text style={[styles.label, darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" }]}>📖 {t("bible")}</Text>
          <Switch value={showBible} onValueChange={setShowBible} trackColor={{ false: "#D1D5DB", true: "#86EFAC" }} thumbColor={showBible ? "#22C55E" : "#9CA3AF"} disabled={!isEditing} />
        </View>
        <View style={styles.divider} />
        <View style={styles.preferenceRow}>
          <Text style={[styles.label, darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" }]}>📚 {t("coran")}</Text>
          <Switch value={showCoran} onValueChange={setShowCoran} trackColor={{ false: "#D1D5DB", true: "#86EFAC" }} thumbColor={showCoran ? "#22C55E" : "#9CA3AF"} disabled={!isEditing} />
        </View>
        <View style={styles.divider} />
        <View style={styles.preferenceRow}>
          <Text style={[styles.label, darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" }]}>🌍 {t("africanTexts")}</Text>
          <Switch value={showAfrican} onValueChange={setShowAfrican} trackColor={{ false: "#D1D5DB", true: "#86EFAC" }} thumbColor={showAfrican ? "#22C55E" : "#9CA3AF"} disabled={!isEditing} />
        </View>
      </View>

      {/* Save Button */}
      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} activeOpacity={0.7}>
          <Feather name="check" size={18} color="white" />
          <Text style={styles.saveButtonText}>{t("save")}</Text>
        </TouchableOpacity>
      )}

      {/* Support & Legal */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, darkMode ? { color: "#E5E7EB" } : { color: "#374151" }]}>{t("section_support")}</Text>
      </View>

      <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937", borderColor: "#374151" } : { backgroundColor: "white", borderColor: "#E5E7EB" }]}>
        <TouchableOpacity style={styles.settingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="help-circle" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} style={{ marginRight: 12 }} />
            <Text style={[styles.settingLabel, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{t("help_support")}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="lock" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} style={{ marginRight: 12 }} />
            <Text style={[styles.settingLabel, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>{t("privacy_policy")}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 16, marginBottom: 8, fontSize: 12 }}>{t("version")} 1.0.0</Text>

      {/* Danger Zone */}
      <TouchableOpacity style={[styles.card, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', marginTop: 20 }]}>
        <View style={[styles.settingRow, { justifyContent: 'center' }]}>
          <Text style={{ color: '#DC2626', fontWeight: '700' }}>{t("delete_account")}</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  header: { paddingHorizontal: 16, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSubtitle: { fontSize: 12, color: "#D1FAE5", marginTop: 2 },
  editButton: { padding: 8 },
  emptyText: { textAlign: "center", marginTop: 100, fontSize: 16, color: "#64748B" },
  sectionHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "700", opacity: 0.7 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, marginHorizontal: 16, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  avatarSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#D1FAE5", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  editIconOverlay: { position: "absolute", bottom: 0, right: 0, left: 0, height: 20, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 28 },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 4 },
  value: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#1F2937" },

  // Settings specific
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  settingLabel: { fontSize: 16, fontWeight: "500" },
  preferenceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },

  // Buttons
  saveButton: { backgroundColor: "#F97316", marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 8, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, shadowColor: "#F97316", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: "white", fontWeight: "700", fontSize: 16 },
});
