import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

export default function PrivacyScreen() {
    const { profile, setCurrentScreen, darkMode } = useAppContext();
    const t = useTranslation(profile?.language || "fr");

    return (
        <View style={[styles.mainContainer, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F3F4F6" }]}>
            {/* Header */}
            <View style={[styles.header, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "white" }]}>
                <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={darkMode ? "white" : "#1F2937"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, darkMode ? { color: "white" } : { color: "#1F2937" }]}>
                    {t("menu_privacy")}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                    <View style={styles.privacyHeader}>
                        <Feather name="shield" size={40} color="#065F46" />
                        <Text style={[styles.cardTitle, darkMode ? { color: "#E5E7EB" } : {}]}>Votre vie privée est notre priorité</Text>
                    </View>

                    <Text style={styles.sectionTitle}>1. Traitement Local</Text>
                    <Text style={styles.bodyText}>
                        Contrairement à la plupart des assistants IA, notre technologie traite vos messages directement sur votre téléphone. Vos données de conversation ne quittent jamais votre appareil pour l'entraînement d'IA tierces.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Données Collectées</Text>
                    <Text style={styles.bodyText}>
                        Nous collectons uniquement les informations nécessaires au bon fonctionnement de l'application (votre nom, vos objectifs et vos préférences religieuses/linguistiques). Ces données sont stockées de manière sécurisée.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Stockage des Conversations</Text>
                    <Text style={styles.bodyText}>
                        L'historique de vos discussions est stocké dans une base de données SQLite locale protégée par les mécanismes de sécurité de votre système (Android/iOS).
                    </Text>

                    <Text style={styles.sectionTitle}>4. Vos Droits</Text>
                    <Text style={styles.bodyText}>
                        Vous avez le plein contrôle sur vos données. Vous pouvez supprimer votre historique ou votre compte à tout moment depuis les paramètres de l'application.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.updatedText}>Dernière mise à jour : 20 Janvier 2026</Text>
                    <TouchableOpacity style={styles.contactLink}>
                        <Text style={styles.contactLinkText}>privacy@goodapp.com</Text>
                    </TouchableOpacity>
                </View>
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
    headerTitle: { fontSize: 18, fontWeight: "800" },
    scrollContent: { padding: 20 },
    card: {
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    privacyHeader: { alignItems: "center", marginBottom: 32 },
    cardTitle: { fontSize: 20, fontWeight: "800", color: "#1F2937", textAlign: "center", marginTop: 16 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#065F46", marginTop: 20, marginBottom: 8 },
    bodyText: { fontSize: 14, color: "#64748B", lineHeight: 22 },
    footer: { marginTop: 32, alignItems: "center" },
    updatedText: { fontSize: 12, color: "#9CA3AF" },
    contactLink: { marginTop: 8 },
    contactLinkText: { color: "#3B82F6", fontSize: 14, fontWeight: "600" },
});
