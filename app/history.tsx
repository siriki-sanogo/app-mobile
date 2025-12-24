import React from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";

import { MOOD_ICONS } from "@/constants/data";

export default function HistoryScreen() {
  const { sessions } = useAppContext();

  const renderSession = ({ item }: any) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDate}>{item.date}</Text>
          <Text style={styles.sessionQuestion}>{item.question}</Text>
        </View>
        <Text style={styles.moodIcon}>{MOOD_ICONS[item.mood]}</Text>
      </View>
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>Voir la conversation →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* Header removed - using global header */}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <ScrollView
          style={styles.emptyContainer}
          contentContainerStyle={styles.emptyContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.emptyIcon}>💭</Text>
          <Text style={styles.emptyTitle}>Aucune interaction</Text>
          <Text style={styles.emptySubtext}>
            Commencez à parler avec l&apos;assistant pour voir votre historique
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F5FF",
  },
  header: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BFDBFE",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  sessionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
    fontWeight: "600",
  },
  sessionQuestion: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
    lineHeight: 20,
  },
  moodIcon: {
    fontSize: 28,
  },
  viewButton: {
    paddingVertical: 8,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },
});
