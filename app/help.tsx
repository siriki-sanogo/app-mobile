import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation } from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

export default function HelpScreen() {
    const { profile, setCurrentScreen, darkMode } = useAppContext();
    const t = useTranslation(profile?.language || "fr");

    const faqs = [
        { q: "Comment fonctionne l'IA ?", a: "Notre IA analyse vos messages localement sur votre téléphone pour vous offrir un soutien personnalisé tout en respectant votre vie privée." },
        { q: "Mes données sont-elles sécurisées ?", a: "Oui, vos conversations sont stockées localement sur votre appareil. Seuls vos paramètres de base sont synchronisés si vous créez un compte." },
        { q: "Comment changer d'objectif ?", a: "Vous pouvez modifier vos objectifs à tout moment dans la section 'Profil'." },
        { q: "Où trouver les exercices ?", a: "Les exercices sont disponibles via le menu latéral dans la section 'Exercices'." },
    ];

    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <View style={[styles.mainContainer, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F3F4F6" }]}>
            {/* Header */}
            <View style={[styles.header, darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "white" }]}>
                <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={darkMode ? "white" : "#1F2937"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, darkMode ? { color: "white" } : { color: "#1F2937" }]}>
                    {t("help_support")}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Contact Section */}
                <View style={[styles.contactCard, { backgroundColor: "#065F46" }]}>
                    <Feather name="mail" size={32} color="white" />
                    <Text style={styles.contactTitle}>Besoin d'aide ?</Text>
                    <Text style={styles.contactText}>Notre équipe est là pour vous accompagner dans votre parcours.</Text>
                    <TouchableOpacity style={styles.contactButton}>
                        <Text style={styles.contactButtonText}>Nous contacter</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <Text style={styles.sectionTitle}>Questions Fréquentes</Text>
                {faqs.map((faq, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.faqItem, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}
                        onPress={() => toggleFAQ(index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={[styles.faqQuestion, darkMode ? { color: "#E5E7EB" } : {}]}>{faq.q}</Text>
                            <Feather name={expandedIndex === index ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
                        </View>
                        {expandedIndex === index && (
                            <Text style={styles.faqAnswer}>{faq.a}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                <View style={styles.supportBox}>
                    <Text style={styles.supportTitle}>Assistance technique</Text>
                    <Text style={styles.supportText}>Version de l'application : 1.0.0</Text>
                    <Text style={styles.supportText}>ID Support : #4242-SAFE</Text>
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
    headerTitle: { fontSize: 20, fontWeight: "800" },
    scrollContent: { padding: 20 },
    contactCard: {
        padding: 24,
        borderRadius: 24,
        alignItems: "center",
        marginBottom: 32,
    },
    contactTitle: { color: "white", fontSize: 22, fontWeight: "800", marginTop: 12, marginBottom: 8 },
    contactText: { color: "rgba(255,255,255,0.8)", textAlign: "center", fontSize: 14, lineHeight: 20 },
    contactButton: {
        backgroundColor: "white",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
    },
    contactButtonText: { color: "#065F46", fontWeight: "700" },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: "#64748B", marginBottom: 16, marginLeft: 4 },
    faqItem: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    faqQuestion: { fontSize: 15, fontWeight: "600", color: "#1F2937", flex: 1, paddingRight: 10 },
    faqAnswer: { marginTop: 12, color: "#64748B", fontSize: 14, lineHeight: 20 },
    supportBox: { marginTop: 32, alignItems: "center" },
    supportTitle: { fontSize: 14, fontWeight: "700", color: "#64748B", marginBottom: 4 },
    supportText: { fontSize: 12, color: "#9CA3AF" },
});
