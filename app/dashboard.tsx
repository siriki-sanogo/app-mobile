import GardenComponent from "@/components/GardenComponent";
import MoodButton from "@/components/MoodButton";
import SuggestionCard from "@/components/SuggestionCard";
import UniversalSearch from "@/components/UniversalSearch";
import { ALL_CARDS, MOODS } from "@/constants/data";
import { Feather } from "@expo/vector-icons";
import * as HapticFeedback from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
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
  const { profile, setProfile, sessions } = useAppContext();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const t = useTranslation(profile?.language || "fr");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Mood Effects
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const confettiRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Récupérer les préférences du profil
  const prefs = {
    show_bible: profile?.preferences?.showBible ?? true,
    show_coran: profile?.preferences?.showCoran ?? true,
    show_african: profile?.preferences?.showAfrican ?? true,
  };

  const userName = profile?.name || "ami";
  const currentLanguage = profile?.language || "fr";

  // Garden Level
  const sessionCount = sessions ? sessions.length : 0;
  const gardenLevel = sessionCount < 3 ? 1 : sessionCount < 6 ? 2 : sessionCount < 10 ? 3 : 4;

  // State for suggestions
  const [displayedCards, setDisplayedCards] = useState<typeof ALL_CARDS>([]);

  // Randomize suggestions on mount or when preferences change
  React.useEffect(() => {
    // 1. Filter
    const filtered = ALL_CARDS.filter((card) => {
      if (card.source === "bible" && !prefs.show_bible) return false;
      if (card.source === "coran" && !prefs.show_coran) return false;
      if (card.source === "african" && !prefs.show_african) return false;
      return true;
    });

    // 2. Shuffle
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());

    // 3. Keep top 6
    setDisplayedCards(shuffled.slice(0, 6));
  }, [prefs.show_bible, prefs.show_coran, prefs.show_african]);

  const triggerFeedback = (message: string, isPositive: boolean) => {
    // Reset
    setFeedbackMessage(message);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    if (isPositive) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    // Hide message after 3s
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setFeedbackMessage(null));
    }, 3000);
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    await HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);

    if (mood === "Super" || mood === "Bien") {
      triggerFeedback("Félicitations ! 🌟", true);
    } else {
      triggerFeedback("Courage ! 💪", false);
    }
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
    <View style={{ flex: 1 }}>
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

        {/* Serenity Garden (NEW) */}
        <View style={{ marginBottom: 28 }}>
          <Text style={[styles.sectionTitle, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>
            {t("garden_title")}
          </Text>
          <GardenComponent level={gardenLevel} />
        </View>

        {/* Mes Objectifs */}
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

        {/* Universal Search (NEW) */}
        <UniversalSearch />

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

          {displayedCards.length > 0 ? (
            <View>
              {displayedCards.map((card) => (
                <SuggestionCard
                  key={card.id}
                  title={currentLanguage === "en" ? (card as any).title_en : card.title}
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

      {/* Confetti Animation Layer */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <LottieView
            source={{ uri: "https://lottie.host/80e3c153-6a97-4767-9d41-3312c5bda2e3/lottie.json" }}
            autoPlay
            loop={false}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Feedback Message Toast */}
      {feedbackMessage && (
        <Animated.View
          style={[
            styles.feedbackToast,
            { opacity: fadeAnim },
            darkMode ? { backgroundColor: "#374151" } : { backgroundColor: "white" }
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.feedbackText, { color: darkMode ? "white" : "#1F2937" }]}>
            {feedbackMessage}
          </Text>
        </Animated.View>
      )}
    </View>
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
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackToast: {
    position: "absolute",
    top: 100, // Show below header
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 110,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
  }
});
