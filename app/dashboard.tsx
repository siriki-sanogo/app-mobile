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
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

const { width, height } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function DashboardScreen() {
  const { profile, setProfile, sessions, updateMood } = useAppContext();
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

  // Entry Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 1000, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

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
    const userObjectives = profile?.objectives || [];

    // 1. Filter based on preferences and objectives
    const filtered = ALL_CARDS.filter((card) => {
      if (card.source === "bible" && !prefs.show_bible) return false;
      if (card.source === "coran" && !prefs.show_coran) return false;
      if (card.source === "african" && !prefs.show_african) return false;
      return true;
    });

    // 2. Score and Shuffle
    const scored = filtered.map(card => {
      let score = Math.random();
      // Boost score if card matches user objectives
      const matchesObjective = userObjectives.some(obj =>
        card.title.toLowerCase().includes(obj.toLowerCase()) ||
        (card as any).title_en?.toLowerCase().includes(obj.toLowerCase())
      );
      if (matchesObjective) score += 2;
      return { ...card, score };
    });

    const shuffled = scored.sort((a, b) => b.score - a.score);

    // 3. Keep top 6
    setDisplayedCards(shuffled.slice(0, 6));
  }, [prefs.show_bible, prefs.show_coran, prefs.show_african, profile?.objectives]);

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

    // Map internal key to Mood type if necessary
    // MOODS labels are mood_happy, mood_stressed etc.
    const moodKey = mood.replace("mood_", "") as any;
    await updateMood(moodKey);

    if (mood === "mood_happy" || mood === "Bien") {
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

  const handleSuggestionPress = (card: any) => {
    const text = currentLanguage === "en" ? card.title_en : card.title;
    router.push({
      pathname: "/assistant",
      params: { initialMessage: text }
    } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#0B1220" : "#F8FAFF" }}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={darkMode ? ["#0B1220", "#111827", "#1F2937"] : ["#F8FAFF", "#F0F5FF", "#E5E7EB"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.ScrollView
        contentContainerStyle={[
          styles.container,
          { opacity: contentFade, transform: [{ translateY: contentFade.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <Animated.View style={[styles.headerSection, { opacity: headerOpacity }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, darkMode ? { color: "#F9FAFB" } : { color: "#111827" }]}>
              {t("greeting")} <Text style={{ color: "#3B82F6" }}>{userName}</Text> 👋
            </Text>
            <Text
              style={[
                styles.subtitle,
                darkMode ? { color: "#9CA3AF" } : { color: "#4B5563" },
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
                  ? { backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "rgba(55, 65, 81, 0.5)" }
                  : { backgroundColor: "rgba(255, 255, 255, 0.9)", borderColor: "rgba(229, 231, 235, 0.5)" },
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
                  ? { backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "rgba(55, 65, 81, 0.5)" }
                  : { backgroundColor: "rgba(255, 255, 255, 0.9)", borderColor: "rgba(229, 231, 235, 0.5)" },
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
        </Animated.View>

        {/* Serenity Garden (NEW) */}
        <View style={styles.glassCardContainer}>
          <Text style={[styles.sectionTitle, darkMode ? { color: "#F9FAFB" } : { color: "#111827" }]}>
            {t("garden_title")}
          </Text>
          <View style={[
            styles.gardenCard,
            darkMode
              ? { backgroundColor: "rgba(31, 41, 55, 0.4)", borderColor: "rgba(55, 65, 81, 0.5)" }
              : { backgroundColor: "rgba(255, 255, 255, 0.6)", borderColor: "rgba(255, 255, 255, 0.8)" },
          ]}>
            <GardenComponent level={gardenLevel} />
          </View>
        </View>

        {/* Mes Objectifs */}
        {profile?.objectives && profile.objectives.length > 0 && (
          <View style={styles.objectivesSection}>
            <Text
              style={[
                styles.sectionTitle,
                darkMode ? { color: "#F9FAFB" } : { color: "#111827" },
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
                    darkMode ? { backgroundColor: "#374151" } : { backgroundColor: "rgba(59, 130, 246, 0.1)" }
                  ]}
                >
                  <Text style={[styles.objectiveText, darkMode ? { color: "#E5E7EB" } : { color: "#2563EB" }]}>
                    {t(obj as any)}
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
                label={t(mood.label as any)}
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
                  onPress={() => handleSuggestionPress(card)}
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
      </Animated.ScrollView>

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
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 44,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  profileImage: {
    width: 44,
    height: 44,
  },
  headerButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    fontSize: IS_LARGE_SCREEN ? 32 : 28,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  glassCardContainer: {
    marginBottom: 32,
  },
  gardenCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  objectivesSection: {
    marginBottom: 32,
  },
  objectivesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  objectiveChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  objectiveText: {
    fontSize: 14,
    fontWeight: "700",
  },
  moodSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  modsScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  suggestionsSection: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
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
    top: 120,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 110,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "800",
  }
});
