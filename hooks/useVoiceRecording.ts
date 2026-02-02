import { Audio } from "expo-av";
import * as HapticFeedback from "expo-haptics";
import { useState } from "react";
import { Platform } from "react-native";

export function useVoiceRecording() {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);

    async function startRecording() {
        try {
            if (Platform.OS === 'web') {
                console.log("⚠️ [Web] Mode simulation d'enregistrement vocal");
                // On simule un état d'enregistrement pour tester l'UI
                setIsRecording(true);
                return;
            }

            console.log("Requesting permissions..");
            const permission = await Audio.requestPermissionsAsync();

            if (permission.status !== "granted") {
                alert("Permission d'accéder au micro est requise pour enregistrer.");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log("Starting recording..");
            HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
            setRecordingUri(null);
            console.log("Recording started");
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }

    async function stopRecording() {
        if (Platform.OS === 'web') {
            setIsRecording(false);
            // On retourne une fausse URI pour que le reste de l'app pense qu'on a un fichier
            return "web-simulated-audio-uri";
        }

        if (!recording) return null;

        console.log("Stopping recording..");
        setIsRecording(false);
        setRecording(null);
        HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Success);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log("Recording stopped and stored at", uri);
            setRecordingUri(uri);

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            return uri;
        } catch (err) {
            console.error("Failed to stop recording", err);
            return null;
        }
    }

    return {
        isRecording,
        recordingUri,
        startRecording,
        stopRecording,
    };
}
