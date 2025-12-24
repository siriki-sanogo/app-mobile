import { Feather } from "@expo/vector-icons";
import * as HapticFeedback from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

import { useAppContext } from "../contexte/AppContext";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

import { useTranslation } from "../contexte/i18n";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { generateOfflineResponse } from "../utils/offlineAI";

export default function AssistantScreen() {
  const { messages, setMessages, setCurrentScreen, profile } = useAppContext(); // Get profile
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const currentLanguage = profile?.language || "fr"; // Get language
  const t = useTranslation(currentLanguage); // Use hook

  // Integrate Speech Recognition
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    micActive
  } = useSpeechRecognition();

  // Sync transcript to input when listening
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    // Scroll to end whenever messages change
    setTimeout(() => {
      if (scrollRef.current && (scrollRef.current as any).scrollToEnd) {
        (scrollRef.current as any).scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);

    // 1. Add User Message
    const userText = inputText.trim();
    const userMessage = {
      id: Date.now().toString() + "-u",
      type: "user" as const,
      text: userText,
      timestamp: new Date().toISOString(),
    };

    // Update UI immediately with user message
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true); // Start typing animation

    try {
      // 2. Get Offline Response
      // Pass language to AI
      const responseText = await generateOfflineResponse(userText, currentLanguage);

      const assistantMessage = {
        id: Date.now().toString() + "-a",
        type: "assistant" as const,
        text: responseText,
        timestamp: new Date().toISOString(),
        helpful: null,
      };

      // 3. Add Assistant Message
      setMessages(prev => [...prev, assistantMessage]);
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <View style={styles.container}>
      {/* CUSTOM HEADER (INA Style) */}
      <View style={[styles.header, { paddingTop: IS_LARGE_SCREEN ? 60 : 50 }]}>
        <TouchableOpacity onPress={() => setCurrentScreen("dashboard")} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#F97316" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>GA</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{t("assistantName")}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t("online")}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.audioButton}>
          <Feather name="volume-2" size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.mainContent}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesWrap}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.type === "user";
            return (
              <View key={msg.id} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-start" }}>

                  {!isUser && (
                    <View style={styles.msgAvatar}>
                      <Text style={styles.msgAvatarText}>GA</Text>
                    </View>
                  )}

                  <View style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant
                  ]}>
                    <Text style={[
                      styles.messageText,
                      isUser ? styles.textUser : styles.textAssistant
                    ]}>
                      {msg.text}
                    </Text>
                    {msg.text.includes("?") && !isUser && (
                      <Feather name="volume-2" size={16} color="#9CA3AF" style={{ marginTop: 8 }} />
                    )}
                  </View>

                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" }}>
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>GA</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAssistant, { paddingVertical: 12 }]}>
                  <Text style={[styles.textAssistant, { fontStyle: "italic", color: "#6B7280" }]}>
                    {t("typing")}
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>

        {/* FOOTER INPUT */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder={isListening ? t("listen") : t("messagePlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isListening}
          />

          <TouchableOpacity
            style={[
              styles.iconButton,
              isListening && { backgroundColor: "#FEE2E2", borderColor: "#EF4444" }
            ]}
            onPress={handleMicPress}
          >
            <Feather
              name={isListening ? "mic-off" : "mic"}
              size={22}
              color={isListening ? "#EF4444" : "#6B7280"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Feather name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFAEF", // Cream Background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F97316", // Orange avatar
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  headerInfo: {
    justifyContent: "center",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E", // Green
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: "#22C55E", // Green text
    fontWeight: "500",
  },
  audioButton: {
    padding: 8,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    borderRadius: 99,
  },
  mainContent: {
    flex: 1,
  },
  messagesWrap: {
    padding: 20,
    paddingBottom: 20,
  },
  msgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 4,
  },
  msgAvatarText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  bubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 20,
  },
  bubbleAssistant: {
    backgroundColor: "white",
    borderTopLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: "#065F46", // Dark Green
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  textAssistant: {
    color: "#1F2937",
  },
  textUser: {
    color: "white",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    maxHeight: 100,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#065F46", // Green border as requested/theme
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
