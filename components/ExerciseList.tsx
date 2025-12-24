import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function ExerciseList() {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const exercises = [
    {
      category: "Respiration",
      icon: "💨",
      items: [
        { name: "Respiration 4-7-8", duration: "5 min", rating: 4.8 },
        { name: "Cohérence cardiaque", duration: "5 min", rating: 4.6 },
      ],
    },
    {
      category: "Méditation",
      icon: "🧠",
      items: [
        { name: "Scan corporel", duration: "10 min", rating: 4.7 },
        { name: "Pleine conscience", duration: "15 min", rating: 4.9 },
      ],
    },
    {
      category: "Gratitude",
      icon: "💖",
      items: [{ name: "Journal de gratitude", duration: "5 min", rating: 4.6 }],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, darkMode ? { color: "#E6EEF8" } : {}]}>Exercices</Text>
      {exercises.map((cat, idx) => (
        <View key={idx} style={{ marginBottom: 12 }}>
          <View style={styles.catHeader}>
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catTitle, darkMode ? { color: "#FFF" } : {}]}>{cat.category}</Text>
          </View>

          {cat.items.map((item, i) => (
            <View key={i} style={[styles.card, darkMode ? { backgroundColor: "#071025" } : {}]}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={[styles.itemName, darkMode ? { color: "#E6EEF8" } : {}]}>{item.name}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>⏱ {item.duration}</Text>
                    <Text style={styles.rating}>★ {item.rating}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.playButton} accessibilityLabel={`Démarrer ${item.name}`}>
                  <Feather name="play" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E3A8A", marginBottom: 8 },
  catHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  catIcon: { fontSize: 18 },
  catTitle: { fontSize: 15, fontWeight: "700", marginLeft: 8, color: "#0F172A" },
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
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center" },
  metaText: { fontSize: 12, color: "#64748B" },
  rating: { fontSize: 12, color: "#16A34A", marginLeft: 8 },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
