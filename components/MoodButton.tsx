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
                    ? { backgroundColor: "rgba(31, 41, 55, 0.4)", borderColor: "rgba(55, 65, 81, 0.5)" }
                    : { backgroundColor: "rgba(255, 255, 255, 0.7)", borderColor: "rgba(255, 255, 255, 0.8)" },
                isSelected && {
                    backgroundColor: color,
                    borderColor: color,
                    transform: [{ scale: 1.05 }],
                    elevation: 8,
                    shadowColor: color,
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[styles.moodEmoji, isSelected && { transform: [{ scale: 1.2 }] }]}>{emoji}</Text>
            <Text
                style={[
                    styles.moodLabel,
                    isSelected
                        ? { color: "white", fontWeight: "800" }
                        : darkMode
                            ? { color: "#D1D5DB" }
                            : { color: "#4B5563" },
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
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1.5,
        marginRight: 14,
        minWidth: 85,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    moodEmoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    moodLabel: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
});
