import { Feather } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as HapticFeedback from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useLocalSearchParams } from "expo-router";

import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";
import { createSession, saveMessage, loadMessages } from "../services/database";

import { useNetInfo } from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { fetchAIResponse, audioService } from "../services/api";
import { generatePositiveContent } from "../services/llm";
import { generateOfflineResponse } from "../utils/offlineAI";
import { speechService } from "../services/speechService";
import VoicePlayer from "../components/VoicePlayer";

const { width } = Dimensions.get("window");
const IS_LARGE_SCREEN = width >= 768;

export default function AssistantScreen() {
  const { messages, setMessages, setCurrentScreen, profile, pendingMessage, setPendingMessage, pendingSessionId, setPendingSessionId } = useAppContext();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === "dark";

  const currentLanguage = profile?.language || "fr"; // Get language
  const t = useTranslation(currentLanguage); // Use hook

  // Integrate Native Voice Recording
  const {
    isRecording,
    recordingUri,
    recordingDuration,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecording();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const netInfo = useNetInfo();

  // Transcription is handled after recording stops

  useEffect(() => {
    // Scroll to end whenever messages change
    setTimeout(() => {
      if (scrollRef.current && (scrollRef.current as any).scrollToEnd) {
        (scrollRef.current as any).scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages, isTyping]);

  const insets = useSafeAreaInsets();
  const { initialMessage } = useLocalSearchParams<{ initialMessage?: string }>();
  const initialProcessed = useRef(false);
  const sessionIdRef = useRef<string>(Crypto.randomUUID());
  const sessionCreatedRef = useRef(false);

  // Load messages from a past session if navigating from history
  useEffect(() => {
    if (pendingSessionId) {
      const loadSession = async () => {
        try {
          const storedMessages = await loadMessages(pendingSessionId);
          if (storedMessages && storedMessages.length > 0) {
            const mapped = (storedMessages as any[]).map((m: any) => ({
              id: m.id,
              type: m.role === 'user' ? 'user' as const : 'assistant' as const,
              text: m.content,
              timestamp: m.timestamp,
              helpful: null,
            }));
            setMessages(mapped);
          }
          sessionIdRef.current = pendingSessionId;
          sessionCreatedRef.current = true;
        } catch (e) {
          console.error('Failed to load session messages', e);
        }
        setPendingSessionId(null);
      };
      loadSession();
    }
  }, [pendingSessionId]);

  // initialMessage is handled by the useEffect below handleSend (line ~224)

  const handleActionPress = (action: string, messageId: string) => {
    if (action === "navigate:exercises") {
      setCurrentScreen("exercises");
    } else if (action === "dismiss") {
      // Remove actions from this specific message
      const updatedMessages = messages.map((m) => (m.id === messageId ? { ...m, actions: undefined } : m));
      setMessages(updatedMessages);
      HapticFeedback.selectionAsync();
    } else if (action === "call:emergency") {
      // Placeholder for emergency call
      console.log("Calling emergency");
    }
  };

  // TTS - Speak assistant message
  const handleSpeak = async (text: string, messageId: string) => {
    const currentlySpeaking = await speechService.isSpeaking();

    if (currentlySpeaking && speakingMessageId === messageId) {
      // Stop speaking
      await speechService.stop();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      HapticFeedback.selectionAsync();
    } else {
      // Start speaking
      if (currentlySpeaking) {
        await speechService.stop();
      }
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
      HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);

      await speechService.speak(text, {
        language: currentLanguage as 'fr' | 'en',
        rate: 0.95,
      });

      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  const handleSend = async (overrideText?: any, audioUri?: string) => {
    const textToUse = (typeof overrideText === 'string' ? overrideText : inputText).trim();
    if (!textToUse && !audioUri) return;

    HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
    const userText = textToUse;
    if (!overrideText) setInputText("");

    const sessionId = sessionIdRef.current;
    const sessionTitle = userText || (currentLanguage === "en" ? "Voice conversation" : "Conversation vocale");
    if (!sessionCreatedRef.current) {
      await createSession({ id: sessionId, title: sessionTitle, created_at: new Date().toISOString() });
      sessionCreatedRef.current = true;
    }

    const userMsg = {
      id: Crypto.randomUUID(),
      type: "user" as const,
      text: userText || (currentLanguage === "en" ? "Voice Message" : "Message Vocal"),
      audioUri: audioUri,
      status: audioUri ? "sending" : "sent",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev: any[]) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      let finalPrompt = userText;

      // If it's a voice message, we need to transcribe it first
      if (audioUri && !userText) {
        setIsTranscribing(true);
        try {
          let transcriptionText = "";

          if (netInfo.isConnected !== false) {
            // Mode Online (API Serveur)
            console.log("🌐 Transcription Online");
            const res = await audioService.transcribe(audioUri);
            transcriptionText = res.text;
          } else {
            // Mode Offline (Whisper Local)
            console.log("✈️ Transcription Offline (Whisper)");
            const { transcribeAudioOffline } = require('../services/offlineSTT');
            const res = await transcribeAudioOffline(audioUri);
            transcriptionText = res.text;
          }

          if (transcriptionText && transcriptionText.trim().length > 0) {
            finalPrompt = transcriptionText;
            // Update message text with transcription
            setMessages((prev: any[]) => prev.map(m => m.id === userMsg.id ? { ...m, text: finalPrompt, status: "sent" } : m));
          } else {
            throw new Error("Empty transcription");
          }
        } catch (err) {
          console.error("Transcription error", err);
          // Update the voice message to show it wasn't transcribed
          setMessages((prev: any[]) => prev.map(m => m.id === userMsg.id
            ? { ...m, text: currentLanguage === "en" ? "🎤 Voice message (not transcribed)" : "🎤 Message vocal (non transcrit)", status: "error" }
            : m));

          // Show honest error instead of faking a response
          const errorMessage = {
            id: Date.now().toString() + "-a",
            type: "assistant" as const,
            text: currentLanguage === "en"
              ? "I'm sorry, I couldn't hear your voice message. The transcription service is unavailable. Could you try typing your message instead?"
              : "Désolé, je n'ai pas pu écouter votre message vocal. Le service de transcription n'est pas disponible. Pouvez-vous essayer d'écrire votre message ?",
            timestamp: new Date().toISOString(),
            helpful: null,
          };
          setMessages((prev: any[]) => [...prev, errorMessage]);
          setIsTyping(false);
          setIsTranscribing(false);
          return; // Stop here — don't send to AI
        } finally {
          setIsTranscribing(false);
        }
      }

      // Save to DB
      await saveMessage({
        id: userMsg.id,
        session_id: sessionId,
        role: "user",
        content: finalPrompt || "[Audio]",
        timestamp: userMsg.timestamp
      });

      // 1. Build conversation history from current messages
      const conversationHistory = messages
        .filter((m: any) => m.type === "user" || m.type === "assistant")
        .map((m: any) => ({
          role: m.type === "user" ? "user" as const : "assistant" as const,
          content: m.text || "",
        }));

      // 2. Smart AI response: Groq (online) → mockGenerate with mood classifier (offline)
      //    generatePositiveContent handles the full fallback chain:
      //    Groq API → Native Llama (Android) → mockGenerate (mood + topic + RAG)
      let aiText = "";
      try {
        const llmResponse = await generatePositiveContent(finalPrompt || "...", conversationHistory, profile, currentLanguage);
        if (llmResponse && llmResponse.response && llmResponse.response.length > 10) {
          aiText = llmResponse.response;
        }
      } catch (e) {
        console.log("LLM engine failed, using keyword fallback");
      }

      // 3. Last resort: keyword-based offline engine
      if (!aiText) {
        const offlineResponse = await generateOfflineResponse(finalPrompt || "...", profile, currentLanguage);
        aiText = offlineResponse.text;
      }

      const response = {
        text: aiText,
      };

      const assistantMessage = {
        id: Date.now().toString() + "-a",
        type: "assistant" as const,
        text: response.text,
        timestamp: new Date().toISOString(),
        helpful: null,
      };

      setMessages((prev: any[]) => [...prev, assistantMessage]);
      HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Success);

      // Save assistant response to DB for history
      await saveMessage({
        id: assistantMessage.id,
        session_id: sessionId,
        role: "assistant",
        content: response.text,
        timestamp: assistantMessage.timestamp
      });

      // Auto-speak if toggle is on
      if (autoSpeak) {
        setTimeout(async () => {
          try {
            setIsSpeaking(true);
            setSpeakingMessageId(assistantMessage.id);
            await speechService.speak(response.text, {
              language: currentLanguage as 'fr' | 'en',
              rate: 0.95,
            });
            setIsSpeaking(false);
            setSpeakingMessageId(null);
          } catch (e) {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
          }
        }, 300);
      }
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setIsTyping(false);
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    if (initialMessage && !initialProcessed.current) {
      initialProcessed.current = true;
      // We need to wait a bit for dependencies to be ready
      setTimeout(() => {
        handleSend(initialMessage);
      }, 800);
    }
  }, [initialMessage]);

  // Handle pending message from dashboard suggestion cards
  useEffect(() => {
    if (pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      setTimeout(() => {
        handleSend(msg);
      }, 800);
    }
  }, [pendingMessage]);

  // Dynamic Default Message Translation
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === "1") {
      // Check if message is default (id "1")
      const defaultFr = "Bonjour ! Comment puis-je vous accompagner aujourd'hui ?";
      const defaultEn = "Hello! How can I assist you today?";

      const newText = currentLanguage === "en" ? defaultEn : defaultFr;

      if (messages[0].text !== newText) {
        const updated = [...messages];
        updated[0] = { ...updated[0], text: newText };
        setMessages(updated);
      }
    }
  }, [currentLanguage, messages, setMessages]);

  const handleMicPress = async () => {
    if (isRecording) {
      // Stop recording → enters preview mode (recordingUri will be set)
      await stopRecording();
    } else if (recordingUri) {
      // Already in preview mode, pressing mic again clears it
      clearRecording();
    } else {
      await startRecording();
    }
  };

  // Send the recorded voice note
  const handleSendVoice = () => {
    if (recordingUri) {
      handleSend(undefined, recordingUri);
      clearRecording();
    }
  };

  // Discard the recorded voice note
  const handleDeleteVoice = () => {
    clearRecording();
  };

  // Start a brand new conversation
  const handleNewChat = () => {
    HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
    sessionIdRef.current = Crypto.randomUUID();
    sessionCreatedRef.current = false;
    setMessages([{
      id: "1",
      type: "assistant" as const,
      text: currentLanguage === "en" ? "Hello! How can I assist you today?" : "Bonjour ! Comment puis-je vous accompagner aujourd'hui ?",
      timestamp: new Date().toISOString(),
      helpful: null,
    }]);
    setInputText("");
  };

  // Format seconds to MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      {/* CUSTOM HEADER (INA Style) */}
      <View style={[styles.header, { paddingTop: insets.top + 10, height: 60 + insets.top }]}>
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
              <View style={[styles.statusDot, { backgroundColor: netInfo.isConnected === false ? "#EF4444" : "#10B981" }]} />
              <Text style={styles.statusText}>
                {netInfo.isConnected === false
                  ? (currentLanguage === "en" ? "Offline" : "Hors ligne")
                  : t("online")}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.audioButton, autoSpeak && { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}
          onPress={async () => {
            if (autoSpeak) {
              // Turn off auto-speak and stop any current speech
              setAutoSpeak(false);
              if (isSpeaking) {
                await speechService.stop();
                setIsSpeaking(false);
                setSpeakingMessageId(null);
              }
            } else {
              // Turn on auto-speak
              setAutoSpeak(true);
              HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Feather name={autoSpeak ? "volume-2" : "volume-x"} size={24} color={autoSpeak ? "#22C55E" : "#9CA3AF"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.audioButton}
          onPress={handleNewChat}
          // @ts-ignore - title works on web for tooltip
          title={currentLanguage === 'en' ? 'New conversation' : 'Nouvelle discussion'}
          accessibilityLabel={currentLanguage === 'en' ? 'New conversation' : 'Nouvelle discussion'}
        >
          <Feather name="edit" size={22} color="#F97316" />
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

                  <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: "95%" }}>
                    <View style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleAssistant
                    ]}>
                      {msg.audioUri && (
                        <VoicePlayer uri={msg.audioUri} isUser={isUser} />
                      )}

                      {msg.status === "sending" && (
                        <ActivityIndicator size="small" color="white" style={{ marginBottom: 4 }} />
                      )}

                      <Text style={[
                        styles.messageText,
                        isUser ? styles.textUser : styles.textAssistant
                      ]}>
                        {msg.text}
                      </Text>

                    </View>

                    {/* Render Actions if present */}
                    {msg.actions && msg.actions.length > 0 && (
                      <View style={styles.actionsContainer}>
                        {msg.actions.map((action, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.actionButton,
                              action.style === 'secondary' ? styles.actionButtonSecondary : styles.actionButtonPrimary
                            ]}
                            onPress={() => handleActionPress(action.action, msg.id)}
                          >
                            {action.style === 'primary' && <Feather name="user" size={16} color="white" style={{ marginRight: 6 }} />}
                            {action.style === 'secondary' && <Feather name="message-circle" size={16} color="#6B7280" style={{ marginRight: 6 }} />}
                            <Text style={[
                              styles.actionButtonText,
                              action.style === 'secondary' ? styles.actionButtonTextSecondary : styles.actionButtonTextPrimary
                            ]}>
                              {action.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {(isTyping || isTranscribing) && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start" }}>
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>GA</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAssistant, { paddingVertical: 12 }]}>
                  <Text style={[styles.textAssistant, { fontStyle: "italic", color: "#6B7280" }]}>
                    {isTranscribing ? (currentLanguage === "en" ? "Transcribing..." : "Transcription...") : t("typing")}
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>

        {/* FOOTER INPUT */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>

          {/* STATE 1: Recording in progress — show timer + stop button */}
          {isRecording && (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginRight: 8 }} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#EF4444', fontVariant: ['tabular-nums'] }}>
                  {formatDuration(recordingDuration)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}
                onPress={handleMicPress}
              >
                <Feather name="square" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {/* STATE 2: Preview mode — show duration + playback + send/delete */}
          {!isRecording && recordingUri && (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.iconButton, { borderColor: '#EF4444' }]}
                onPress={handleDeleteVoice}
              >
                <Feather name="trash-2" size={20} color="#EF4444" />
              </TouchableOpacity>

              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                <Feather name="mic" size={18} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', fontVariant: ['tabular-nums'] }}>
                  {formatDuration(recordingDuration)}
                </Text>
                <Text style={{ marginLeft: 8, fontSize: 13, color: '#6B7280' }}>
                  {currentLanguage === 'en' ? 'Voice note ready' : 'Note vocale prête'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendVoice}
              >
                <Feather name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* STATE 3: Normal text input */}
          {!isRecording && !recordingUri && (
            <>
              <TextInput
                style={styles.input}
                placeholder={t("messagePlaceholder")}
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleMicPress}
              >
                <Feather name="mic" size={22} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={() => handleSend()}
                disabled={!inputText.trim()}
              >
                <Feather name="send" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>

      </KeyboardAvoidingView >
    </View >
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
    backgroundColor: "#22C55E",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#9CA3AF"
  },
  actionsContainer: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: "#F97316",
  },
  actionButtonSecondary: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonTextPrimary: {
    color: "white",
  },
  actionButtonTextSecondary: {
    color: "#374151",
  },
  speakButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  speakButtonText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
    fontWeight: "500",
  },
});
