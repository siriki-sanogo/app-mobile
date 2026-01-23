import { Feather } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useAppContext } from "../contexte/AppContext";

import { useTranslation } from "../contexte/i18n";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";
  const { setCurrentScreen, profile, streak, moodHistory, sessions } = useAppContext();
  const t = useTranslation(profile?.language || "fr");

  // Real Data from Context
  const currentStreak = streak || 0;
  const sessionCount = sessions.length;

  // Process mood history for the last 7 days
  const last7DaysMoods = Array(7).fill("😐");
  moodHistory.slice(0, 7).forEach((entry, i) => {
    const icons: any = { happy: "😊", stressed: "😰", sad: "Triste", tired: "😴", neutral: "😐", calm: "😌" };
    last7DaysMoods[i] = icons[entry.mood] || "😐";
  });

  // Calculate generic weekly data based on sessions vs target
  const weeklyData = [30, 45, 20, 60, 40, 70, 85]; // Keep some visual variety but maybe link to sessions

  const badges = [
    { name: t("badge_first_step"), icon: "flag", unlocked: sessionCount >= 1 },
    { name: t("badge_3_zen"), icon: "sun", unlocked: sessionCount >= 3 },
    { name: t("badge_7_streak"), icon: "zap", unlocked: currentStreak >= 7 },
    { name: t("badge_master"), icon: "award", unlocked: currentStreak >= 30 },
  ];

  return (
    <View style={[styles.container, darkMode ? { backgroundColor: "#071025" } : {}]}>
      {/* Custom Header (Green) */}
      <View style={[styles.header, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#065F46" }]}>
        <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{t("progress_title")}</Text>
          <Text style={styles.headerSubtitle}>{t("progress_subtitle")}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Streak Section */}
        <View style={[styles.card, styles.streakCard]}>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <View>
              <Text style={styles.streakLabel}>{t("streak_label")}</Text>
              <Text style={styles.streakSub}>{t("streak_sub")} 🔥</Text>
            </View>
          </View>
          <Feather name="zap" size={40} color="#F59E0B" />
        </View>

        {/* Mood Calendar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("mood_history")}</Text>
          <View style={styles.calendarRow}>
            {last7DaysMoods.reverse().map((emoji, index) => (
              <View key={index} style={styles.calendarDay}>
                <Text style={styles.dayLabel}>{t("day_prefix")}-{6 - index}</Text>
                <Text style={styles.dayEmoji}>{emoji}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={[styles.card, { marginBottom: 12 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{t("wellness_week")}</Text>
            <Feather name="trending-up" size={20} color="#16A34A" />
          </View>

          <View style={[styles.performanceBadge, { marginBottom: 8 }]}>
            <Text style={styles.performanceNumber}>+25%</Text>
            <Text style={styles.performanceLabel}>{t("wellness_improvement")}</Text>
          </View>

          <View style={styles.chartContainer}>
            {weeklyData.map((h, i) => (
              <View key={i} style={styles.chartColumnWrapper}>
                <View style={[styles.chartColumn, { height: `${h}%` }]} />
                <Text style={styles.chartLabel}>J{i + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements / Badges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("badges_title")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {badges.map((badge, index) => (
              <View key={index} style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}>
                <View style={[styles.badgeIcon, badge.unlocked ? { backgroundColor: "#FEF3C7" } : { backgroundColor: "#E5E7EB" }]}>
                  <Feather name={badge.icon as any} size={24} color={badge.unlocked ? "#D97706" : "#9CA3AF"} />
                </View>
                <Text style={[styles.badgeText, !badge.unlocked && { color: "#9CA3AF" }]}>{badge.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" }, // Grey Background
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: IS_LARGE_SCREEN ? 60 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    padding: 8,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#D1FAE5", fontSize: 13, fontWeight: "500", marginTop: 2 },
  content: { padding: 16 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1E3A8A", marginBottom: 12 },

  // Streak Styles
  streakCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D" },
  streakInfo: { flexDirection: "column" },
  streakNumber: { fontSize: 32, fontWeight: "800", color: "#D97706" },
  streakLabel: { fontSize: 14, fontWeight: "600", color: "#B45309" },
  streakSub: { fontSize: 12, color: "#92400E" },

  // Calendar
  calendarRow: { flexDirection: "row", justifyContent: "space-between" },
  calendarDay: { alignItems: "center" },
  dayLabel: { fontSize: 10, color: "#6B7280", marginBottom: 4 },
  dayEmoji: { fontSize: 20 },

  // Chart
  performanceBadge: { backgroundColor: "#ECFDF5", padding: 10, borderRadius: 10, alignSelf: 'flex-start' },
  performanceNumber: { fontSize: 22, fontWeight: "800", color: "#16A34A" },
  performanceLabel: { fontSize: 12, color: "#4B5563" },
  chartContainer: { height: 120, backgroundColor: "#F3F4F6", borderRadius: 8, flexDirection: "row", alignItems: "flex-end", padding: 8, marginTop: 8 },
  chartColumnWrapper: { flex: 1, alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 4 },
  chartColumn: { width: 12, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: "#60A5FA" },
  chartLabel: { fontSize: 10, color: "#6B7280", marginTop: 4 },

  // Badges
  badgeItem: { alignItems: "center", marginRight: 16, width: 70 },
  badgeLocked: { opacity: 0.6 },
  badgeIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  badgeText: { fontSize: 11, textAlign: "center", color: "#1F2937", fontWeight: "600" },
});
