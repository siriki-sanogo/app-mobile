import { Feather } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useAppContext } from "../contexte/AppContext";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";
  const { setCurrentScreen } = useAppContext();

  const bars = [45, 60, 55, 70, 75, 80, 85];

  return (
    <View style={[styles.container, darkMode ? { backgroundColor: "#071025" } : {}]}>
      {/* Custom Header (Green) */}
      <View style={[styles.header, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#065F46" }]}>
        <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Vos progrès</Text>
          <Text style={styles.headerSubtitle}>Analyse de votre évolution</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { marginBottom: 12 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Cette semaine</Text>
            <Feather name="trending-up" size={20} color="#16A34A" />
          </View>

          <View style={[styles.performanceBadge, { marginBottom: 8 }]}>
            <Text style={styles.performanceNumber}>+25%</Text>
            <Text style={styles.performanceLabel}>Amélioration</Text>
          </View>

          <View style={styles.chartContainer}>
            {bars.map((h, i) => (
              <View key={i} style={styles.chartColumnWrapper}>
                <View style={[styles.chartColumn, { height: `${h}%` }]} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exercices efficaces</Text>
          <View style={{ marginTop: 8 }}>
            {[
              { name: "Respiration 4-7-8", improvement: "+32%" },
              { name: "Méditation guidée", improvement: "+28%" },
            ].map((ex, idx) => (
              <View key={idx} style={styles.effectiveRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Feather name="heart" size={16} color="#EC4899" style={{ marginRight: 8 }} />
                  <Text style={styles.effectiveName}>{ex.name}</Text>
                </View>
                <Text style={styles.effectiveImprovement}>{ex.improvement}</Text>
              </View>
            ))}
          </View>
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
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1E3A8A" },
  performanceBadge: { backgroundColor: "#ECFDF5", padding: 10, borderRadius: 10 },
  performanceNumber: { fontSize: 22, fontWeight: "800", color: "#16A34A" },
  performanceLabel: { fontSize: 12, color: "#4B5563" },
  chartContainer: { height: 96, backgroundColor: "#F3F4F6", borderRadius: 8, flexDirection: "row", alignItems: "flex-end", padding: 8, marginTop: 8 },
  chartColumnWrapper: { flex: 1, alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 4 },
  chartColumn: { width: 18, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: "#60A5FA" },
  effectiveRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 8, backgroundColor: "#F8FAFC", borderRadius: 8, marginBottom: 8 },
  effectiveName: { fontSize: 14 },
  effectiveImprovement: { fontSize: 13, color: "#16A34A", fontWeight: "700" },
});
