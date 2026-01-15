import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

interface WebViewModalProps {
    visible: boolean;
    url?: string;
    onClose: () => void;
}

export default function WebViewModal({ visible, url, onClose }: WebViewModalProps) {
    const [loading, setLoading] = useState(true);

    if (!visible || !url) return null;

    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="black" />

                {/* Header with Close Button */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Feather name="x" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.webViewContainer}>
                    {loading && (
                        <ActivityIndicator size="large" color="#F97316" style={styles.loader} />
                    )}
                    <WebView
                        source={{ uri: url }}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        style={{ flex: 1 }}
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    loader: {
        position: "absolute",
        alignSelf: "center",
        top: "50%",
        zIndex: 1,
    },
});
