import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";

interface WebViewModalProps {
    visible: boolean;
    url?: string;
    onClose: () => void;
}

export default function WebViewModal({ visible, url, onClose }: WebViewModalProps) {
    if (!visible || !url) return null;

    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <StatusBar hidden />

                {/* Header with Close Button */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Feather name="x" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.webViewContainer}>
                    <iframe
                        src={url}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="External Content"
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
    },
    header: {
        height: 60,
        backgroundColor: "black",
        justifyContent: "center",
        paddingHorizontal: 16,
        zIndex: 10,
    },
    closeButton: {
        padding: 8,
        alignSelf: "flex-end",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 20,
    },
    webViewContainer: {
        flex: 1,
        backgroundColor: "white",
    },
});
