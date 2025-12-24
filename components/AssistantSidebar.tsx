import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface AssistantSidebarProps {
    darkMode: boolean;
    currentSessionId: string | null;
    startNewChat: () => void;
    loadSession: (id: string) => void;
    sessions: any[];
    onClose?: () => void;
    isLargeScreen: boolean;
}

export default function AssistantSidebar({
    darkMode,
    currentSessionId,
    startNewChat,
    loadSession,
    sessions,
    onClose,
    isLargeScreen,
}: AssistantSidebarProps) {
    return (
        <>
            {/* Sidebar Header */}
            <View
                style={[
                    styles.sidebarHeader,
                    darkMode ? { borderBottomColor: "#374151" } : {},
                ]}
            >
                <TouchableOpacity
                    style={styles.newChatButton}
                    onPress={startNewChat}
                    activeOpacity={0.7}
                >
                    <Feather name="plus" size={20} color="white" />
                    <Text style={styles.newChatText}>New Chat</Text>
                </TouchableOpacity>
                {!isLargeScreen && onClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather
                            name="x"
                            size={20}
                            color={darkMode ? "#E5E7EB" : "#D1D5DB"}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Library Button */}
            <TouchableOpacity style={styles.libraryButton} activeOpacity={0.7}>
                <Feather
                    name="book"
                    size={18}
                    color={darkMode ? "#E5E7EB" : "#D1D5DB"}
                />
                <Text
                    style={[styles.libraryText, darkMode ? { color: "#D1D5DB" } : {}]}
                >
                    Bibliothèque
                </Text>
            </TouchableOpacity>

            {/* Chat History */}
            <View style={styles.historyContainer}>
                <Text
                    style={[styles.historyTitle, darkMode ? { color: "#9CA3AF" } : {}]}
                >
                    Historique
                </Text>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.chatList}>
                    {sessions.map((session: any) => (
                        <TouchableOpacity
                            key={session.id}
                            style={[
                                styles.chatItem,
                                currentSessionId === session.id && styles.chatItemActive,
                                darkMode
                                    ? {
                                        backgroundColor:
                                            currentSessionId === session.id
                                                ? "#374151"
                                                : "transparent",
                                    }
                                    : {},
                            ]}
                            onPress={() => loadSession(session.id)}
                            activeOpacity={0.7}
                        >
                            <Feather
                                name="message-circle"
                                size={16}
                                color={
                                    currentSessionId === session.id
                                        ? "#3B82F6"
                                        : darkMode
                                            ? "#9CA3AF"
                                            : "#9CA3AF"
                                }
                            />
                            <Text
                                style={[
                                    styles.chatItemText,
                                    currentSessionId === session.id && styles.chatItemTextActive,
                                    darkMode
                                        ? {
                                            color:
                                                currentSessionId === session.id
                                                    ? "#E5E7EB"
                                                    : "#9CA3AF",
                                        }
                                        : {},
                                ]}
                                numberOfLines={1}
                            >
                                {session.question}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    sidebarHeader: {
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
        paddingBottom: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        gap: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    newChatButton: {
        flexDirection: "row",
        backgroundColor: "#374151",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flex: 1,
    },
    newChatText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    closeButton: {
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        marginLeft: 4,
    },
    libraryButton: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 12,
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    libraryText: {
        color: "#D1D5DB",
        fontWeight: "500",
        fontSize: 14,
    },
    historyContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    historyTitle: {
        color: "#9CA3AF",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    chatList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: "row",
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 6,
        marginBottom: 6,
        alignItems: "center",
        gap: 8,
    },
    chatItemActive: {
        backgroundColor: "#374151",
    },
    chatItemText: {
        color: "#9CA3AF",
        fontSize: 13,
        flex: 1,
    },
    chatItemTextActive: {
        color: "#E5E7EB",
        fontWeight: "500",
    },
});
