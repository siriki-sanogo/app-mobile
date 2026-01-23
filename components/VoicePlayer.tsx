import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface VoicePlayerProps {
    uri: string;
    isUser?: boolean;
}

export default function VoicePlayer({ uri, isUser = true }: VoicePlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [position, setPosition] = useState(0);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    async function togglePlayback() {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        } else {
            loadAndPlay();
        }
    }

    async function loadAndPlay() {
        setIsLoading(true);
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            setIsPlaying(true);
        } catch (error) {
            console.error("Error playing sound", error);
        } finally {
            setIsLoading(false);
        }
    }

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                if (sound) {
                    sound.setPositionAsync(0);
                }
            }
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const progress = duration ? (position / duration) * 100 : 0;

    return (
        <View style={[styles.container, isUser ? styles.containerUser : styles.containerAssistant]}>
            <TouchableOpacity
                onPress={togglePlayback}
                style={[styles.playButton, isUser ? styles.playButtonUser : styles.playButtonAssistant]}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={isUser ? "white" : "#F97316"} />
                ) : (
                    <Feather name={isPlaying ? "pause" : "play"} size={20} color={isUser ? "white" : "#F97316"} />
                )}
            </TouchableOpacity>

            <View style={styles.trackContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: isUser ? "white" : "#F97316" }]} />
                </View>
                <Text style={[styles.timeText, { color: isUser ? "rgba(255,255,255,0.8)" : "#6B7280" }]}>
                    {formatTime(position)} / {duration ? formatTime(duration) : "0:00"}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderRadius: 12,
        minWidth: 160,
    },
    containerUser: {
        // Parent bubble will handle background
    },
    containerAssistant: {
        // Parent bubble will handle background
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    playButtonUser: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    playButtonAssistant: {
        backgroundColor: "rgba(249, 115, 22, 0.1)",
    },
    trackContainer: {
        flex: 1,
        justifyContent: "center",
    },
    progressBarBg: {
        height: 3,
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: 1.5,
        width: "100%",
        marginBottom: 4,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 1.5,
    },
    timeText: {
        fontSize: 10,
        fontWeight: "600",
    },
});
