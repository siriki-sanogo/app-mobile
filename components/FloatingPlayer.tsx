import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSound } from "../contexte/SoundContext";

const { width } = Dimensions.get("window");

export default function FloatingPlayer() {
    const { currentTrack, isPlaying, togglePlayPause, tracks, playTrack } = useSound();
    const [expanded, setExpanded] = useState(false);

    if (!currentTrack && !expanded) {
        // Show a small button to open the player if nothing is playing
        return (
            <TouchableOpacity style={styles.floatingTrigger} onPress={() => setExpanded(true)}>
                <Feather name="music" size={24} color="white" />
            </TouchableOpacity>
        );
    }

    if (expanded) {
        return (
            <View style={styles.expandedContainer}>
                {/* Header / Collapse */}
                <View style={styles.header}>
                    <Text style={styles.title}>Ambiance Sonore</Text>
                    <TouchableOpacity onPress={() => setExpanded(false)}>
                        <Feather name="chevron-down" size={24} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                {/* Track List */}
                <View style={styles.trackList}>
                    {tracks.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            style={[
                                styles.trackItem,
                                currentTrack?.id === t.id && styles.activeTrack,
                            ]}
                            onPress={() => playTrack(t.id)}
                        >
                            <Feather
                                name={currentTrack?.id === t.id && isPlaying ? "volume-2" : "play"}
                                size={16}
                                color={currentTrack?.id === t.id ? "#2563EB" : "#64748B"}
                            />
                            <Text
                                style={[
                                    styles.trackName,
                                    currentTrack?.id === t.id && styles.activeTrackText,
                                ]}
                            >
                                {t.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Controls */}
                {currentTrack && (
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                            <Feather name={isPlaying ? "pause" : "play"} size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    // Mini Player Mode (Bottom Right)
    return (
        <View style={styles.miniPlayer}>
            <TouchableOpacity style={styles.miniContent} onPress={() => setExpanded(true)}>
                {/* Animated Icon Mock */}
                <Feather name="music" size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.miniText} numberOfLines={1}>
                    {currentTrack?.name}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniPlayBtn} onPress={togglePlayPause}>
                <Feather name={isPlaying ? "pause" : "play"} size={16} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // Trigger Button
    floatingTrigger: {
        position: "absolute",
        bottom: 90,
        right: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 1000,
    },

    // Mini Player
    miniPlayer: {
        position: "absolute",
        bottom: 90,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E293B",
        borderRadius: 24,
        padding: 6,
        paddingLeft: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
        maxWidth: 200,
        zIndex: 1000,
    },
    miniContent: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
    miniText: { color: "white", fontSize: 12, fontWeight: "600" },
    miniPlayBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },

    // Expanded
    expandedContainer: {
        position: "absolute",
        bottom: 90,
        right: 20,
        left: 20, // Stretch
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
        zIndex: 1010,
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 16, fontWeight: "800", color: "#1E3A8A" },
    trackList: { marginBottom: 16 },
    trackItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    activeTrack: { backgroundColor: "#EFF6FF", borderRadius: 8, paddingHorizontal: 8, borderBottomWidth: 0 },
    trackName: { marginLeft: 12, fontSize: 14, color: "#475569", fontWeight: "500" },
    activeTrackText: { color: "#1D4ED8", fontWeight: "700" },
    controls: { alignItems: "center" },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
});
