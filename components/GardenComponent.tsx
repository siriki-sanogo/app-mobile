import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
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
            <View style={styles.sky}>
                <Text style={{ fontSize: 40, position: 'absolute', top: 10, right: 20 }}>☀️</Text>
                <Text style={{ fontSize: 30, position: 'absolute', top: 30, left: 20, opacity: 0.6 }}>☁️</Text>
            </View>

            <View style={styles.gardenBase}>
                <Animated.View style={[
                    styles.plantContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}>
                    <Text style={{ fontSize: 80 }}>{icon}</Text>
                </Animated.View>
                <View style={styles.ground} />
            </View>

            <View style={styles.info}>
                <Text style={styles.stageLabel}>{t("level")} {level} : {label}</Text>
                <Text style={styles.subtext}>{t("garden_keep_going")}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F0F9FF",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#BAE6FD",
    },
    sky: {
        height: 80,
        backgroundColor: "#E0F2FE",
    },
    gardenBase: {
        height: 120,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "#E0F2FE",
        position: 'relative',
    },
    ground: {
        height: 20,
        backgroundColor: "#86EFAC",
        width: "100%",
        position: 'absolute',
        bottom: 0,
    },
    plantContainer: {
        marginBottom: 10,
        zIndex: 10,
    },
    info: {
        padding: 12,
        backgroundColor: "white",
        alignItems: 'center'
    },
    stageLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#065F46",
    },
    subtext: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 4,
    }
});
