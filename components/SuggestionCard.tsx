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
                    ? { backgroundColor: "#1F2937", borderColor: "#374151" }
                    : { backgroundColor: "white", borderColor: "#E5E7EB" },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>{emoji}</Text>
                <View style={styles.cardText}>
                    <Text
                        style={[
                            styles.cardTitle,
                            darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" },
                        ]}
                    >
                        {title}
                    </Text>
                    <Text
                        style={[
                            styles.cardSource,
                            darkMode ? { color: "#9CA3AF" } : { color: "#6B7280" },
                        ]}
                    >
                        {source === "bible"
                            ? "📖 Bible"
                            : source === "coran"
                                ? "📚 Coran"
                                : "🌍 Textes africains"}
                    </Text>
                </View>
                <Feather
                    name="chevron-right"
                    size={20}
                    color={darkMode ? "#6B7280" : "#9CA3AF"}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 12,
        backgroundColor: "white",
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    cardEmoji: {
        fontSize: 28,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontWeight: "600",
        fontSize: 14,
        color: "#1F2937",
        marginBottom: 4,
    },
    cardSource: {
        fontSize: 12,
        color: "#6B7280",
    },
});
