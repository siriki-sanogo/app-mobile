import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface MoodButtonProps {
    label: string;
    emoji: string;
    color: string;
    isSelected: boolean;
    onPress: () => void;
    darkMode: boolean;
}

export default function MoodButton({
    label,
    emoji,
    color,
    isSelected,
    onPress,
    darkMode,
}: MoodButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.moodButton,
                darkMode
                    ? { backgroundColor: "#1F2937", borderColor: "#374151" }
                    : { backgroundColor: "white", borderColor: "#E5E7EB" },
                isSelected && {
                    backgroundColor: color,
                    borderColor: color,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.moodEmoji}>{emoji}</Text>
            <Text
                style={[
                    styles.moodLabel,
                    isSelected
                        ? { color: "white", fontWeight: "600" }
                        : darkMode
                            ? { color: "#D1D5DB" }
                            : { color: "#6B7280" },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    moodButton: {
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 12,
        backgroundColor: "white",
        borderColor: "#E5E7EB",
    },
    moodEmoji: {
        fontSize: 24,
        marginBottom: 6,
    },
    moodLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#6B7280",
    },
});
