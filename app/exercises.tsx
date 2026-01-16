import { Feather } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import ExerciseList from "../components/ExerciseList";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function ExercisesScreen() {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";
  const { setCurrentScreen, profile } = useAppContext();
  const t = useTranslation(profile?.language || "fr");

  return (
    <View style={[styles.container, darkMode ? { backgroundColor: "#071025" } : {}]}>
      {/* Header matching Profile/Onboarding style */}
      <View style={[styles.header, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#065F46" }]}>
        <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{t("exercises_title")}</Text>
          <Text style={styles.headerSubtitle}>{t("exercises_subtitle")}</Text>
        </View>

        {/* Placeholder for symmetry or search icon */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ExerciseList />
        <View style={{ height: 80 }} />
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
});
