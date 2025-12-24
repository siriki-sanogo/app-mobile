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
  useColorScheme
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function ProfileScreen() {
  const { profile, setProfile, setCurrentScreen } = useAppContext();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";
  const t = useTranslation(profile?.language || "fr");

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [goal, setGoal] = useState(profile?.goal || "");
  const [photoUri, setPhotoUri] = useState(profile?.photoUri || null);
  const [showBible, setShowBible] = useState(profile?.preferences?.showBible ?? true);
  const [showCoran, setShowCoran] = useState(profile?.preferences?.showCoran ?? true);
  const [showAfrican, setShowAfrican] = useState(profile?.preferences?.showAfrican ?? true);

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

    setProfile(updatedProfile);
    setIsEditing(false);
    await HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Success);

    // Rediriger vers le dashboard
    setCurrentScreen("dashboard");
  };

  const handleGoBack = async () => {
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    router.back();
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
          darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "#065F46" }, // GREEN HEADER
          { paddingTop: IS_LARGE_SCREEN ? 60 : 50 }
        ]}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather
            name="arrow-left" // Standard arrow
            size={24}
            color={darkMode ? "#E5E7EB" : "white"}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}> {/* Centered Title */}
          <Text
            style={[
              styles.headerTitle,
              darkMode ? { color: "#E5E7EB" } : { color: "white" },
            ]}
          >
            {t("profileTitle")}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              darkMode ? { color: "#9CA3AF" } : { color: "#D1FAE5" },
            ]}
          >
            {t("managePreferences")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Feather
            name={isEditing ? "check" : "edit-2"}
            size={20}
            color={darkMode ? "#E5E7EB" : "white"}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Info Card */}
      <View
        style={[
          styles.card,
          darkMode
            ? { backgroundColor: "#1F2937", borderColor: "#374151" }
            : { backgroundColor: "white", borderColor: "#E5E7EB" },
        ]}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={isEditing ? 0.7 : 1}>
            <View
              style={[
                styles.avatar,
                darkMode
                  ? { backgroundColor: "#374151" }
                  : { backgroundColor: "#D1FAE5" }, // Light Green
              ]}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
              {isEditing && (
                <View style={styles.editIconOverlay}>
                  <Feather name="camera" size={12} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.label,
                darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
              ]}
            >
              {t("name")}
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  darkMode
                    ? { backgroundColor: "#0B1220", color: "#E5E7EB", borderColor: "#374151" }
                    : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" },
                ]}
                value={name}
                onChangeText={setName}
                placeholder={t("enterName")}
                placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
              />
            ) : (
              <Text
                style={[
                  styles.value,
                  darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
                ]}
              >
                {profile.name}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Goal Card */}
      <View
        style={[
          styles.card,
          darkMode
            ? { backgroundColor: "#1F2937", borderColor: "#374151" }
            : { backgroundColor: "white", borderColor: "#E5E7EB" },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
          ]}
        >
          {t("goal")}
        </Text>
        {isEditing ? (
          <TextInput
            style={[
              styles.input,
              darkMode
                ? { backgroundColor: "#0B1220", color: "#E5E7EB", borderColor: "#374151" }
                : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" },
            ]}
            value={goal}
            onChangeText={setGoal}
            placeholder={t("goalPlaceholder")}
            placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
            multiline
            numberOfLines={3}
          />
        ) : (
          <Text
            style={[
              styles.value,
              darkMode ? { color: "#9CA3AF" } : { color: "#4B5563" },
              { marginTop: 8 },
            ]}
          >
            {profile.goal || t("goalPlaceholder")}
          </Text>
        )}
      </View>

      {/* Language Card */}
      <View
        style={[
          styles.card,
          darkMode
            ? { backgroundColor: "#1F2937", borderColor: "#374151" }
            : { backgroundColor: "white", borderColor: "#E5E7EB" },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
          ]}
        >
          {t("language")}
        </Text>
        <View style={styles.settingRow}>
          <Text
            style={[
              styles.label,
              darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
            ]}
          >
            {profile.language === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
          </Text>
        </View>
      </View>

      {/* Content Preferences Card */}
      <View
        style={[
          styles.card,
          darkMode
            ? { backgroundColor: "#1F2937", borderColor: "#374151" }
            : { backgroundColor: "white", borderColor: "#E5E7EB" },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
          ]}
        >
          {t("sources")}
        </Text>

        <View style={styles.preferenceRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.label,
                darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
              ]}
            >
              📖 {t("bible")}
            </Text>
          </View>
          {isEditing ? (
            <Switch
              value={showBible}
              onValueChange={setShowBible}
              trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
              thumbColor={showBible ? "#22C55E" : "#9CA3AF"}
            />
          ) : (
            <Text
              style={[
                styles.value,
                showBible ? { color: "#10B981" } : { color: "#EF4444" },
              ]}
            >
              {showBible ? t("activated") : t("deactivated")}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.preferenceRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.label,
                darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
              ]}
            >
              📚 {t("coran")}
            </Text>
          </View>
          {isEditing ? (
            <Switch
              value={showCoran}
              onValueChange={setShowCoran}
              trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
              thumbColor={showCoran ? "#22C55E" : "#9CA3AF"}
            />
          ) : (
            <Text
              style={[
                styles.value,
                showCoran ? { color: "#10B981" } : { color: "#EF4444" },
              ]}
            >
              {showCoran ? t("activated") : t("deactivated")}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.preferenceRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.label,
                darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
              ]}
            >
              🌍 {t("africanTexts")}
            </Text>
          </View>
          {isEditing ? (
            <Switch
              value={showAfrican}
              onValueChange={setShowAfrican}
              trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
              thumbColor={showAfrican ? "#22C55E" : "#9CA3AF"}
            />
          ) : (
            <Text
              style={[
                styles.value,
                showAfrican ? { color: "#10B981" } : { color: "#EF4444" },
              ]}
            >
              {showAfrican ? t("activated") : t("deactivated")}
            </Text>
          )}
        </View>
      </View>

      {/* Save Button */}
      {isEditing && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          activeOpacity={0.7}
        >
          <Feather name="check" size={18} color="white" />
          <Text style={styles.saveButtonText}>{t("save")}</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#D1FAE5",
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    color: "#64748B",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  editIconOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: "#F97316", // ORANGE ACTION BUTTON
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
