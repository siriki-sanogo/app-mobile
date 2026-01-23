import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme, Switch, Alert } from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
    const { profile, setProfile, setCurrentScreen, logout } = useAppContext();
    const colorScheme = useColorScheme();
    const darkMode = colorScheme === "dark";
    const t = useTranslation(profile?.language || "fr");

    const handleToggle = async (key: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Logic to toggle notifications etc would go here and persist to AsyncStorage/Backend
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t("delete_account"),
            "Cette action est irréversible. Toutes vos données seront supprimées.",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", style: "destructive", onPress: () => { /* Logic to delete */ } }
            ]
        );
    };

    return (
        <View style={[styles.mainContainer, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F3F4F6" }]}>
            {/* Header */}
            <View style={[styles.header, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "white" }]}>
                <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={darkMode ? "white" : "#1F2937"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, darkMode ? { color: "white" } : { color: "#1F2937" }]}>
                    {t("settingsTitle")}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t("section_profile")}</Text>
                    <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                        <TouchableOpacity style={styles.row} onPress={() => setCurrentScreen("profile")}>
                            <View style={[styles.iconBox, { backgroundColor: "#DBEAFE" }]}>
                                <Feather name="user" size={18} color="#2563EB" />
                            </View>
                            <Text style={[styles.rowLabel, darkMode ? { color: "#E5E7EB" } : {}]}>{t("profileTitle")}</Text>
                            <Feather name="chevron-right" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* General Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t("section_general")}</Text>
                    <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
                                <Feather name="globe" size={18} color="#9333EA" />
                            </View>
                            <Text style={[styles.rowLabel, darkMode ? { color: "#E5E7EB" } : {}]}>{t("language_label")}</Text>
                            <Text style={styles.rowValue}>{profile?.language === 'fr' ? 'Français' : 'English'}</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
                                <Feather name="bell" size={18} color="#D97706" />
                            </View>
                            <Text style={[styles.rowLabel, darkMode ? { color: "#E5E7EB" } : {}]}>{t("notifications")}</Text>
                            <Switch value={true} onValueChange={() => handleToggle('notifications')} />
                        </View>
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t("section_security")}</Text>
                    <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: "#DCFCE7" }]}>
                                <Feather name="lock" size={18} color="#16A34A" />
                            </View>
                            <Text style={[styles.rowLabel, darkMode ? { color: "#E5E7EB" } : {}]}>{t("face_id")}</Text>
                            <Switch value={false} onValueChange={() => handleToggle('faceid')} />
                        </View>
                    </View>
                </View>

                {/* Support & Legal */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t("section_support")}</Text>
                    <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                        <TouchableOpacity style={styles.row} onPress={() => setCurrentScreen("help")}>
                            <Feather name="help-circle" size={18} color="#6B7280" />
                            <Text style={[styles.rowLabel, darkMode ? { color: "#E5E7EB" } : {}, { marginLeft: 12 }]}>{t("help_support")}</Text>
                            <Feather name="chevron-right" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        <View style={styles.separator} />
                        <TouchableOpacity style={styles.row} onPress={() => setCurrentScreen("privacy")}>
                            <Feather name="shield" size={18} color="#6B7280" />
                            <Text style={[styles.rowLabel, darkMode ? { color: "#E5E7EB" } : {}, { marginLeft: 12 }]}>{t("privacy_policy")}</Text>
                            <Feather name="chevron-right" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={[styles.logoutButton, darkMode ? { backgroundColor: "#1F2937" } : {}]} onPress={logout}>
                    <Feather name="log-out" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>{t("menu_logout")}</Text>
                </TouchableOpacity>

                {/* Danger Zone */}
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                    <Text style={styles.deleteText}>{t("delete_account")}</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>{t("version")} 1.0.0 (Build 42)</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    backButton: { padding: 8, borderRadius: 12 },
    headerTitle: { fontSize: 20, fontWeight: "800" },
    scrollContent: { padding: 20 },
    section: { marginBottom: 24 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 8,
        marginLeft: 4,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    card: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: "500", marginLeft: 12, color: "#1F2937" },
    rowValue: { fontSize: 14, color: "#64748B", fontWeight: "600" },
    separator: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 16 },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        gap: 8,
    },
    logoutText: { color: "#EF4444", fontWeight: "700", fontSize: 16 },
    deleteButton: {
        alignItems: "center",
        padding: 12,
    },
    deleteText: { color: "#9CA3AF", fontSize: 13, textDecorationLine: "underline" },
    versionText: { textAlign: "center", color: "#9CA3AF", fontSize: 12, marginTop: 20 },
});
