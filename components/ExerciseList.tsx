import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useAppContext } from "../contexte/AppContext";
import VideoPlayerModal from "./VideoPlayerModal";

export default function ExerciseList() {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const [modalVisible, setModalVisible] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(undefined);

  const { profile } = useAppContext();
  const currentLanguage = profile?.language || "fr";

  // YouTube Video IDs (From User Request)
  const ID_COHERENCE = "r2wCA9SN4i4"; // Cohérence cardiaque
  const ID_RESPIRATION = "FZZPXR_5s_c"; // Respiration
  const ID_SCAN_CORPOREL = "1WAXGcKi9i8"; // Scan corporel
  const ID_PLEINE_CONSCIENCE = "tfsSXtjHZiU"; // Pleine conscience
  const ID_GRATITUDE = "R1cZ4s30WLQ"; // Journal de gratitude

  const exercises = [
    {
      category_fr: "Respiration",
      category_en: "Breathing",
      icon: "💨",
      items: [
        { name_fr: "Respiration 4-7-8", name_en: "4-7-8 Breathing", duration: "5 min", rating: 4.8, videoId: ID_RESPIRATION },
        { name_fr: "Cohérence cardiaque", name_en: "Cardiac Coherence", duration: "5 min", rating: 4.6, videoId: ID_COHERENCE },
      ],
    },
    {
      category_fr: "Méditation",
      category_en: "Meditation",
      icon: "🧠",
      items: [
        { name_fr: "Scan corporel", name_en: "Body Scan", duration: "10 min", rating: 4.7, videoId: ID_SCAN_CORPOREL },
        { name_fr: "Pleine conscience", name_en: "Mindfulness", duration: "15 min", rating: 4.9, videoId: ID_PLEINE_CONSCIENCE },
      ],
    },
    {
      category_fr: "Gratitude",
      category_en: "Gratitude",
      icon: "💖",
      items: [{ name_fr: "Journal de gratitude", name_en: "Gratitude Journal", duration: "5 min", rating: 4.6, videoId: ID_GRATITUDE }],
    },
  ];

  const handlePlay = (videoId?: string) => {
    if (videoId) {
      setCurrentVideoId(videoId);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, darkMode ? { color: "#E6EEF8" } : {}]}>Exercices</Text>
      {exercises.map((cat, idx) => (
        <View key={idx} style={{ marginBottom: 12 }}>
          <View style={styles.catHeader}>
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catTitle, darkMode ? { color: "#FFF" } : {}]}>
              {currentLanguage === 'en' ? cat.category_en : cat.category_fr}
            </Text>
          </View>

          {cat.items.map((item, i) => (
            <View key={i} style={[styles.card, darkMode ? { backgroundColor: "#071025" } : {}]}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={[styles.itemName, darkMode ? { color: "#E6EEF8" } : {}]}>
                    {currentLanguage === 'en' ? item.name_en : item.name_fr}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>⏱ {item.duration}</Text>
                    <Text style={styles.rating}>★ {item.rating}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.playButton}
                  accessibilityLabel={`Démarrer ${currentLanguage === 'en' ? item.name_en : item.name_fr}`}
                  onPress={() => handlePlay(item.videoId)}
                >
                  <Feather name="play" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ))}

      <VideoPlayerModal
        visible={modalVisible}
        videoId={currentVideoId}
        onClose={() => setModalVisible(false)}
      />
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
