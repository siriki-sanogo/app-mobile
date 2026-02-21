import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

export default function SourcesScreen() {
    const { profile, setCurrentScreen, darkMode } = useAppContext();
    const t = useTranslation(profile?.language || "fr");

    const sources = [
        { title: "Saint Coran", desc: "Traduction française de Muhammad Hamidullah.", link: "https://quran.com" },
        { title: "Sainte Bible", desc: "Version Louis Segond (1910).", link: "https://www.bible.com" },
        { title: "Dictionnaire Larousse", desc: "API de référence pour les définitions françaises.", link: "https://www.larousse.fr" },
        { title: "Free Dictionary API", desc: "Source pour les définitions en anglais.", link: "https://dictionaryapi.dev/" },
        { title: "Llama.rn", desc: "Moteur d'IA locale optimisé pour mobile.", link: "https://github.com/PygmalionAI/llama.rn" },
    ];

    return (
        <View style={[styles.mainContainer, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F3F4F6" }]}>
            {/* Header */}
            <View style={[styles.header, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "white" }]}>
                <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={darkMode ? "white" : "#1F2937"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, darkMode ? { color: "white" } : { color: "#1F2937" }]}>
                    {t("menu_sources")}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.introText}>
                    Cette application utilise des sources de haute qualité pour vous fournir des conseils et des références fiables.
                </Text>

                {sources.map((source, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.sourceCard, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}
                        onPress={() => Linking.openURL(source.link)}
                    >
                        <View style={styles.sourceInfo}>
                            <Text style={[styles.sourceTitle, darkMode ? { color: "#E5E7EB" } : {}]}>{source.title}</Text>
                            <Text style={styles.sourceDesc}>{source.desc}</Text>
                        </View>
                        <Feather name="external-link" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                ))}

                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        Toutes les marques et droits d'auteur appartiennent à leurs propriétaires respectifs.
                    </Text>
                </View>
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
    introText: { fontSize: 14, color: "#64748B", lineHeight: 22, marginBottom: 24, paddingHorizontal: 4 },
    sourceCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    sourceInfo: { flex: 1 },
    sourceTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
    sourceDesc: { fontSize: 13, color: "#64748B" },
    disclaimer: { marginTop: 40, paddingHorizontal: 20 },
    disclaimerText: { fontSize: 11, color: "#9CA3AF", textAlign: "center", lineHeight: 16 },
});
