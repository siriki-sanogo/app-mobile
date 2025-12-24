import MoodButton from "@/components/MoodButton";
import SuggestionCard from "@/components/SuggestionCard";
import { ALL_CARDS, MOODS } from "@/constants/data";
import { Feather } from "@expo/vector-icons";
import * as HapticFeedback from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function DashboardScreen() {
  const { profile, setProfile } = useAppContext();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const t = useTranslation(profile?.language || "fr");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Récupérer les préférences du profil
  const prefs = {
    show_bible: profile?.preferences?.showBible ?? true,
    show_coran: profile?.preferences?.showCoran ?? true,
    show_african: profile?.preferences?.showAfrican ?? true,
  };

  const userName = profile?.name || "ami";
  const currentLanguage = profile?.language || "fr";

  const filteredCards = ALL_CARDS.filter((card) => {
    if (card.source === "bible" && !prefs.show_bible) return false;
    if (card.source === "coran" && !prefs.show_coran) return false;
    if (card.source === "african" && !prefs.show_african) return false;
    return true;
  });

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
  };

  const handleLanguageChange = async () => {
    const newLanguage = currentLanguage === "fr" ? "en" : "fr";
    if (profile) {
      setProfile({ ...profile, language: newLanguage });
    }
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
  };

  const handleProfilePress = async () => {
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    router.push("/profile" as any);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F0F5FF" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, darkMode ? { color: "#E5E7EB" } : {}]}>
            {t("greeting")} {userName} 👋
          </Text>
          <Text
            style={[
              styles.subtitle,
              darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
            ]}
          >
            {t("moodQuestion")}
          </Text>
        </View>

        {/* Boutons en haut à droite */}
        <View style={styles.headerButtons}>
          {/* Bouton Langue */}
          <TouchableOpacity
            style={[
              styles.headerButton,
              darkMode
                ? { backgroundColor: "#1F2937", borderColor: "#374151" }
                : { backgroundColor: "white", borderColor: "#E5E7EB" },
            ]}
            onPress={handleLanguageChange}
            activeOpacity={0.7}
          >
            <Feather
              name="globe"
              size={18}
              color={darkMode ? "#E5E7EB" : "#1F2937"}
            />
            <Text
              style={[
                styles.headerButtonText,
                darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
              ]}
            >
              {currentLanguage.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Bouton Profil */}
          <TouchableOpacity
            style={[
              styles.headerButton,
              darkMode
                ? { backgroundColor: "#1F2937", borderColor: "#374151" }
                : { backgroundColor: "white", borderColor: "#E5E7EB" },
              styles.profileButton
            ]}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            {profile?.photoUri ? (
              <Image
                source={{ uri: profile.photoUri }}
                style={styles.profileImage}
              />
            ) : (
              <Feather
                name="user"
                size={18}
                color={darkMode ? "#E5E7EB" : "#1F2937"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mes Objectifs (New Section) */}
      {profile?.objectives && profile.objectives.length > 0 && (
        <View style={styles.objectivesSection}>
          <Text
            style={[
              styles.sectionTitle,
              darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
            ]}
          >
            {t("objectives")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.objectivesScroll}>
            {profile.objectives.map((obj, index) => (
              <View
                key={index}
                style={[
                  styles.objectiveChip,
                  darkMode ? { backgroundColor: "#374151" } : { backgroundColor: "#DBEAFE" }
                ]}
              >
                <Text style={[styles.objectiveText, darkMode ? { color: "#E5E7EB" } : { color: "#1E40AF" }]}>
                  {t(obj)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Humeur */}
      <View style={styles.moodSection}>
        <Text
          style={[
            styles.sectionTitle,
            darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
          ]}
        >
          {t("myMood")}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.modsScrollView}
        >
          {MOODS.map((mood) => (
            <MoodButton
              key={mood.label}
              label={t(mood.label)}
              emoji={mood.emoji}
              color={mood.color}
              isSelected={selectedMood === mood.label}
              onPress={() => handleMoodSelect(mood.label)}
              darkMode={darkMode}
            />
          ))}
        </ScrollView>
      </View>

      {/* Suggestions */}
      <View style={styles.suggestionsSection}>
        <Text
          style={[
            styles.sectionTitle,
            darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
          ]}
        >
          {t("suggestions")}
        </Text>

        {filteredCards.length > 0 ? (
          <View>
            {filteredCards.map((card) => (
              <SuggestionCard
                key={card.id}
                title={card.title}
                source={card.source}
                emoji={card.emoji}
                darkMode={darkMode}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather
              name="inbox"
              size={48}
              color={darkMode ? "#6B7280" : "#D1D5DB"}
            />
            <Text
              style={[
                styles.emptyStateText,
                darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
              ]}
            >
              {t("noContent")}
            </Text>
          </View>
        )}
      </View>

      {/* Espaceur */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
  },
  profileButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 40,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  title: {
    fontSize: IS_LARGE_SCREEN ? 28 : 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  objectivesSection: {
    marginBottom: 28,
  },
  objectivesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  objectiveChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  objectiveText: {
    fontSize: 14,
    fontWeight: "600",
  },
  moodSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  modsScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
});
