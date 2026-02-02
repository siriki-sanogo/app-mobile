import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

type Props = {
    level: number; // 1 to 4
};

// Icons remain static
const ICONS = ["🌱", "🌿", "🪴", "🌳"];

export default function GardenComponent({ level }: Props) {
    const { profile } = useAppContext();
    const t = useTranslation(profile?.language || "fr");

    // Clamp level between 1 and 4
    const stageIndex = Math.min(Math.max(level - 1, 0), 3);

    // Dynamic labels
    const getStageLabel = (index: number) => {
        switch (index) {
            case 0: return t("garden_stage_1");
            case 1: return t("garden_stage_2");
            case 2: return t("garden_stage_3");
            case 3: return t("garden_stage_4");
            default: return t("garden_stage_1");
        }
    };

    const icon = ICONS[stageIndex];
    const label = getStageLabel(stageIndex);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();
    }, [level]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#E0F2FE", "#F0F9FF"]}
                style={styles.gardenBase}
            >
                <View style={styles.sky}>
                    <Text style={{ fontSize: 44, position: 'absolute', top: 10, right: 30 }}>☀️</Text>
                    <Text style={{ fontSize: 34, position: 'absolute', top: 35, left: 25, opacity: 0.5 }}>☁️</Text>
                    <Text style={{ fontSize: 24, position: 'absolute', top: 15, left: 60, opacity: 0.3 }}>☁️</Text>
                </View>

                <Animated.View style={[
                    styles.plantContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}>
                    <Text style={{ fontSize: 90 }}>{icon}</Text>
                </Animated.View>
                <View style={styles.ground} />
            </LinearGradient>

            <View style={styles.info}>
                <Text style={styles.stageLabel}>{t("level")} {level} • {label}</Text>
                <Text style={styles.subtext}>{t("garden_keep_going")}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "white",
    },
    gardenBase: {
        height: 180,
        justifyContent: "flex-end",
        alignItems: "center",
        position: 'relative',
    },
    sky: {
        ...StyleSheet.absoluteFillObject,
    },
    ground: {
        height: 16,
        backgroundColor: "#4ADE80",
        width: "100%",
        borderTopWidth: 2,
        borderColor: "#22C55E",
        opacity: 0.8,
    },
    plantContainer: {
        marginBottom: 8,
        zIndex: 10,
    },
    info: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.05)",
    },
    stageLabel: {
        fontSize: 15,
        fontWeight: "800",
        color: "#065F46",
        letterSpacing: 0.3,
    },
    subtext: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 4,
        fontWeight: "600",
    }
});
