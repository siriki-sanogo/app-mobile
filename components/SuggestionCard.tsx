import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SuggestionCardProps {
    title: string;
    source: string;
    emoji: string;
    darkMode: boolean;
    onPress?: () => void;
}

export default function SuggestionCard({
    title,
    source,
    emoji,
    darkMode,
    onPress,
}: SuggestionCardProps) {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                darkMode
                    ? { backgroundColor: "rgba(31, 41, 55, 0.4)", borderColor: "rgba(55, 65, 81, 0.5)" }
                    : { backgroundColor: "rgba(255, 255, 255, 0.6)", borderColor: "rgba(255, 255, 255, 0.8)" },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.cardContent}>
                <View style={[
                    styles.emojiContainer,
                    darkMode ? { backgroundColor: "#374151" } : { backgroundColor: "#F3F4F6" }
                ]}>
                    <Text style={styles.cardEmoji}>{emoji}</Text>
                </View>
                <View style={styles.cardText}>
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.cardTitle,
                            darkMode ? { color: "#F9FAFB" } : { color: "#111827" },
                        ]}
                    >
                        {title}
                    </Text>
                    <View style={styles.sourceTag}>
                        <Text
                            style={[
                                styles.cardSource,
                                darkMode ? { color: "#9CA3AF" } : { color: "#4B5563" },
                            ]}
                        >
                            {source === "bible"
                                ? "📖 Bible"
                                : source === "coran"
                                    ? "📚 Coran"
                                    : "🌍 Textes africains"}
                        </Text>
                    </View>
                </View>
                <View style={styles.chevronContainer}>
                    <Feather
                        name="arrow-right"
                        size={18}
                        color={darkMode ? "#3B82F6" : "#2563EB"}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    emojiContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    cardEmoji: {
        fontSize: 26,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontWeight: "700",
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
    },
    sourceTag: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardSource: {
        fontSize: 12,
        fontWeight: "600",
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    }
});
