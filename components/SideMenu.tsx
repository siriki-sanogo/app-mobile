import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

const windowWidth = Dimensions.get("window").width;
const MENU_WIDTH = Math.min(340, windowWidth * 0.78);

type Props = {
  visible: boolean;
  onClose: () => void;
  currentScreen: string;
  setCurrentScreen: (s: any) => void;
};

export default function SideMenu({ visible, onClose, currentScreen, setCurrentScreen }: Props) {
  const { profile } = useAppContext();
  const t = useTranslation(profile?.language || "fr");
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";
  const userName = profile?.name || "Utilisateur";

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -MENU_WIDTH, duration: 260, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, translateX, overlayOpacity]);

  const items = [
    { id: "home", target: "dashboard", label: t("menu_home"), icon: "home" },
    { id: "assistant", target: "assistant", label: t("menu_assistant"), icon: "message-square" },
    { id: "history", target: "history", label: t("menu_history"), icon: "clock" },
    { id: "exercises", target: "exercises", label: t("menu_exercises"), icon: "book" },
    { id: "progress", target: "progress", label: t("menu_progress"), icon: "bar-chart" },
    { id: "insights", target: "insights", label: t("menu_insights"), icon: "pie-chart" },
    { id: "profile", target: "profile", label: t("menu_profile"), icon: "user" },
  ];

  const bottomItems = [
    { id: "settings", label: t("menu_settings"), icon: "settings" },
    { id: "help", label: t("menu_help"), icon: "help-circle" },
    { id: "sources", label: t("menu_sources"), icon: "file-text" },
    { id: "privacy", label: t("menu_privacy"), icon: "shield" },
  ];

  return (
    <>
      {/* Overlay */}
      {/** TouchableWithoutFeedback lets us close when tapping outside the menu */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View pointerEvents={visible ? "auto" : "none"} style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sliding menu */}
      <Animated.View style={[styles.menu, { transform: [{ translateX }] }, darkMode ? { backgroundColor: "#0B1220" } : {}]}>
        <View style={styles.menuHeader}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text></View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.profileName, darkMode ? { color: "#E6EEF8" } : {}]}>{userName}</Text>
              <Text style={[styles.profileEmail, darkMode ? { color: "#9CA3AF" } : {}]}>{t("menu_hello")} 👋</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Fermer le menu">
            <Feather name="x" size={20} color={darkMode ? "#E6EEF8" : "#111827"} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {items.map((it) => {
            const target = (it as any).target || it.id;
            const isActive = currentScreen === target;
            return (
              <TouchableOpacity
                key={it.id}
                style={[styles.item, isActive && styles.itemActive]}
                onPress={() => {
                  setCurrentScreen(target as any);
                  onClose();
                }}
              >
                <Feather name={(it as any).icon as any} size={18} color={isActive ? "#3B82F6" : "#6B7280"} />
                <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>{it.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          {bottomItems.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={styles.item}
              onPress={() => {
                setCurrentScreen(it.id as any);
                onClose();
              }}
            >
              <Feather name={it.icon as any} size={18} color="#6B7280" />
              <Text style={styles.itemLabel}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dark mode toggle */}
        <View style={styles.bottomRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="moon" size={18} color="#6B7280" />
            <Text style={[styles.itemLabel, { marginLeft: 10 }]}>{t("menu_darkmode")}</Text>
          </View>
          <Switch value={darkMode} onValueChange={() => { }} />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  menu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: MENU_WIDTH,
    backgroundColor: "#FFFFFF",
    paddingTop: 36,
    paddingHorizontal: 16,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 16,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "700", color: "#6B21A8" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  profileEmail: { fontSize: 12, color: "#6B7280" },
  closeButton: {
    padding: 6,
    borderRadius: 8,
  },
  section: {
    marginTop: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 12,
  },
  itemActive: { backgroundColor: "#E0E7FF" },
  itemLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  itemLabelActive: { color: "#3B82F6", fontWeight: "700" },
  separator: { height: 1, backgroundColor: "#EEF2FF", marginVertical: 10, borderRadius: 2 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
});
