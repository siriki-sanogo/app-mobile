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

import { useTranslation } from "../contexte/i18n";

export default function HistoryScreen() {
  const { sessions, profile, refreshSessions, setCurrentScreen, setPendingSessionId } = useAppContext();
  const t = useTranslation(profile?.language || "fr");
  const lang = profile?.language || "fr";

  React.useEffect(() => {
    refreshSessions();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return lang === 'en' ? 'Today' : "Aujourd'hui";
      if (diffDays === 1) return lang === 'en' ? 'Yesterday' : 'Hier';
      if (diffDays < 7) return lang === 'en' ? `${diffDays} days ago` : `Il y a ${diffDays} jours`;

      return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenSession = (sessionId: string) => {
    setPendingSessionId(sessionId);
    setCurrentScreen("assistant");
  };

  const renderSession = ({ item }: any) => (
    <TouchableOpacity style={styles.sessionCard} onPress={() => handleOpenSession(item.id)}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDate}>
            {formatDate(item.date)}
          </Text>
          <Text style={styles.sessionQuestion} numberOfLines={2}>
            {item.question || (lang === 'en' ? 'Conversation' : 'Conversation')}
          </Text>
        </View>
        <Text style={styles.moodIcon}>{MOOD_ICONS[item.mood] || "💬"}</Text>
      </View>
      <Text style={styles.viewButtonText}>{t("view_conversation")} →</Text>
    </TouchableOpacity>
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
          <Text style={styles.emptyTitle}>{t("history_empty_title")}</Text>
          <Text style={styles.emptySubtext}>
            {t("history_empty_subtitle")}
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
