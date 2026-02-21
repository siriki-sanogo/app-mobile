import { Audio } from "expo-av";
import * as HapticFeedback from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export function useVoiceRecording() {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Web-specific refs
    const mediaRecorderRef = useRef<any>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    function startTimer() {
        setRecordingDuration(0);
        timerRef.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    }

    function stopTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }

    async function startRecording() {
        try {
            if (Platform.OS === 'web') {
                // Real web recording with MediaRecorder API
                console.log("🎙️ [Web] Starting real audio recording...");
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                    chunksRef.current = [];

                    mediaRecorder.ondataavailable = (event: any) => {
                        if (event.data.size > 0) {
                            chunksRef.current.push(event.data);
                        }
                    };

                    mediaRecorder.start(100); // Collect data every 100ms
                    mediaRecorderRef.current = mediaRecorder;
                    setIsRecording(true);
                    setRecordingUri(null);
                    startTimer();
                    console.log("🎙️ [Web] Recording started");
                } catch (err) {
                    console.error("🎙️ [Web] Microphone access denied:", err);
                    alert("Permission d'accéder au micro est requise pour enregistrer.");
                }
                return;
            }

            // Native recording (iOS/Android)
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
            startTimer();
            console.log("Recording started");
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }

    async function stopRecording() {
        stopTimer();

        if (Platform.OS === 'web') {
            // Stop web MediaRecorder
            const mediaRecorder = mediaRecorderRef.current;
            if (!mediaRecorder) {
                setIsRecording(false);
                return null;
            }

            return new Promise<string | null>((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    console.log("🎙️ [Web] Recording stopped, blob size:", blob.size, "URL:", url);

                    // Stop all audio tracks
                    mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
                    mediaRecorderRef.current = null;

                    setRecordingUri(url);
                    setIsRecording(false);
                    resolve(url);
                };

                mediaRecorder.stop();
            });
        }

        // Native stop
        if (!recording) return null;

        console.log("Stopping recording..");
        setIsRecording(false);
        HapticFeedback.notificationAsync(HapticFeedback.NotificationFeedbackType.Success);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log("Recording stopped and stored at", uri);
            setRecordingUri(uri);
            setRecording(null);

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            return uri;
        } catch (err) {
            console.error("Failed to stop recording", err);
            setRecording(null);
            return null;
        }
    }

    function clearRecording() {
        // Revoke blob URL on web to free memory
        if (Platform.OS === 'web' && recordingUri && recordingUri.startsWith('blob:')) {
            URL.revokeObjectURL(recordingUri);
        }
        setRecordingUri(null);
        setRecordingDuration(0);
        stopTimer();
    }

    return {
        isRecording,
        recordingUri,
        recordingDuration,
        startRecording,
        stopRecording,
        clearRecording,
    };
}
