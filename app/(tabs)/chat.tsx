import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { generatePositiveContent, AIResponse } from "../../services/llm";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    mood?: string;
    timestamp: Date;
}

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // Appel au service IA (Mode Mock pour l'instant)
            const aiResult: AIResponse = await generatePositiveContent(userMessage.text);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResult.response,
                sender: "ai",
                mood: aiResult.mood,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Erreur Chat:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Scroll to bottom à chaque nouveau message
        if (flatListRef.current) {
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
    }, [messages]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === "user";
        return (
            <View
                style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                ]}
            >
                {!isUser && item.mood && (
                    <Text style={styles.moodLabel}>Humeur détectée : {item.mood}</Text>
                )}
                <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                    {item.text}
                </Text>
                <Text style={styles.timestamp}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Assistant Bien-être</Text>
                <Text style={styles.headerSubtitle}>IA Offline</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={[styles.messagesList, { paddingBottom: insets.bottom + 80 }]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="sparkles" size={48} color="#6366f1" />
                        <Text style={styles.emptyText}>
                            Bonjour ! Je suis votre compagnon bien-être. Dites-moi comment vous vous sentez aujourd'hui.
                        </Text>
                    </View>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={styles.inputContainerWrapper}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Je me sens un peu triste..."
                        placeholderTextColor="#94a3b8"
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!input.trim() || loading) && styles.disabledButton]}
                        onPress={sendMessage}
                        disabled={!input.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    header: {
        padding: 16,
        backgroundColor: "#1e293b",
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#f8fafc",
    },
    headerSubtitle: {
        fontSize: 12,
        color: "#6366f1",
        fontWeight: "600",
    },
    messagesList: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
        paddingHorizontal: 32,
    },
    emptyText: {
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 16,
        fontSize: 16,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: "flex-end",
        backgroundColor: "#6366f1",
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: "flex-start",
        backgroundColor: "#334155",
        borderBottomLeftRadius: 4,
    },
    moodLabel: {
        fontSize: 10,
        color: "#fbbf24",
        fontWeight: "bold",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: "#ffffff",
    },
    aiText: {
        color: "#f1f5f9",
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        color: "rgba(255, 255, 255, 0.5)",
        alignSelf: "flex-end",
    },
    inputContainerWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0f172a",
    },
    inputContainer: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#1e293b",
        borderTopWidth: 1,
        borderTopColor: "#334155",
        alignItems: "flex-end",
    },
    input: {
        flex: 1,
        backgroundColor: "#334155",
        color: "#fff",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        minHeight: 40,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#6366f1",
        alignItems: "center",
        justifyContent: "center",
    },
    disabledButton: {
        backgroundColor: "#475569",
        opacity: 0.7,
    },
});
