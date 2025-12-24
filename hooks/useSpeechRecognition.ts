import * as HapticFeedback from "expo-haptics";
import { useRef, useState } from "react";
import { Platform } from "react-native";

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [micActive, setMicActive] = useState(false);
    const [transcript, setTranscript] = useState("");

    const recognitionRef = useRef<any>(null);

    const startListening = async () => {
        setTranscript("");
        HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);

        // NATIVE MOBILE
        if (Platform.OS !== 'web') {
            alert("La reconnaissance vocale n'est pas disponible sur cette version.");
            return;
        }

        // WEB SPEECH API
        try {
            setMicActive(true);
            setIsListening(true);

            if (typeof window !== "undefined") {
                const SpeechRecognitionAPI =
                    (window as any).webkitSpeechRecognition ||
                    (window as any).SpeechRecognition;

                if (SpeechRecognitionAPI) {
                    const recognition = new SpeechRecognitionAPI();
                    recognitionRef.current = recognition;
                    recognition.continuous = false;
                    recognition.interimResults = true;
                    recognition.lang = "fr-FR";

                    recognition.onstart = () => {
                        setMicActive(true);
                        setIsListening(true);
                    };

                    recognition.onresult = (event: any) => {
                        let interimTranscript = "";
                        let finalTranscript = "";

                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            const text = event.results[i][0].transcript;
                            if (event.results[i].isFinal) {
                                finalTranscript += text + " ";
                            } else {
                                interimTranscript += text;
                            }
                        }

                        if (finalTranscript || interimTranscript) {
                            setTranscript(finalTranscript + interimTranscript);
                        }
                    };

                    recognition.onerror = (event: any) => {
                        console.error("Erreur reconnaissance web:", event.error);
                        setMicActive(false);
                        setIsListening(false);
                    };

                    recognition.onend = () => {
                        setMicActive(false);
                        setIsListening(false);
                    };

                    recognition.start();
                    return;
                }
            }
            console.log("Web Speech API non disponible");
        } catch (error: any) {
            console.error("Erreur web:", error);
            setMicActive(false);
            setIsListening(false);
        }
    };

    const stopListening = async () => {
        HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);

        if (Platform.OS !== 'web') {
            setIsListening(false);
            setMicActive(false);
            return;
        }

        try {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            setMicActive(false);
            setIsListening(false);
        } catch (e) {
            console.error("Erreur lors de l'arrêt:", e);
            setMicActive(false);
        }
    };

    return {
        isListening,
        micActive,
        startListening,
        stopListening,
        transcript,
        setTranscript
    };
}
