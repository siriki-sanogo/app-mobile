import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import YoutubePlayerView from "./YoutubePlayerView";

interface VideoPlayerModalProps {
    visible: boolean;
    videoId?: string;
    onClose: () => void;
}

export default function VideoPlayerModal({ visible, videoId, onClose }: VideoPlayerModalProps) {
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    if (!visible || !videoId) return null;

    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <StatusBar hidden />
                <TouchableOpacity
                    style={[styles.closeButton, { top: insets.top + 20 }]}
                    onPress={onClose}
                >
                    <Feather name="x" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.videoContainer}>
                    {loading && (
                        <ActivityIndicator size="large" color="#F97316" style={styles.loader} />
                    )}
                    <YoutubePlayerView
                        height={300} // Standard height, can be adjusted
                        play={true}
                        videoId={videoId}
                        onReady={() => setLoading(false)}
                        onChangeState={(state) => {
                            if (state === 'ended') {
                                // Optional: Close or restart
                            }
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 50, // Fallback if insets fail, though we override in style prop
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 20,
    },
    videoContainer: {
        width: "100%",
    },
    loader: {
        position: "absolute",
        alignSelf: "center",
        zIndex: 1,
    }
});
