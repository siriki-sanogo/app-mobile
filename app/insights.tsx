import { Feather } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useAppContext } from "../contexte/AppContext";
import { useTranslation } from "../contexte/i18n";

const { width } = Dimensions.get("window");

// Helper to map mood to score/color
const getMoodScore = (mood: string) => {
    switch (mood) {
        case "happy": return { score: 100, color: "#22C55E", label: "Bien" };
        case "calm": return { score: 80, color: "#3B82F6", label: "Calme" };
        case "neutral": return { score: 60, color: "#9CA3AF", label: "Neutre" };
        case "tired": return { score: 40, color: "#F59E0B", label: "Fatigué" };
        case "anxious": return { score: 30, color: "#F97316", label: "Anxieux" };
        case "stressed": return { score: 20, color: "#EF4444", label: "Stressé" };
        case "sad": return { score: 10, color: "#6366F1", label: "Triste" };
        default: return { score: 50, color: "#9CA3AF", label: "Neutre" };
    }
};

export default function InsightsScreen() {
    const { profile, sessions, moodHistory } = useAppContext();
    const colorScheme = useColorScheme();
    const darkMode = colorScheme === "dark";
    const t = useTranslation(profile?.language || "fr");

    // --- Statistics Calculations ---

    // 1. Total Sessions
    const totalSessions = sessions.length;

    // 2. Dominant Mood Calculation
    const calculateDominantMood = () => {
        if (sessions.length === 0) return t("mood_neutral");

        const moodCounts: Record<string, number> = {};
        sessions.forEach(s => {
            moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
        });

        const topMoodKey = Object.keys(moodCounts).reduce((a, b) =>
            moodCounts[a] > moodCounts[b] ? a : b
        );

        const info = getMoodScore(topMoodKey);
        return info.label; // Return localized label if possible, here using helper
    };

    const dominantMood = calculateDominantMood();

    // 3. Wellness Score (Average of last 7 sessions or moods)
    const calculateWellnessScore = () => {
        // Use sessions for now as moodHistory might be empty in old sessions
        if (sessions.length === 0) return 50; // Default start

        const recentSessions = sessions.slice(0, 7);
        const totalScore = recentSessions.reduce((acc, curr) => acc + getMoodScore(curr.mood).score, 0);
        return Math.round(totalScore / recentSessions.length);
    };

    const wellnessScore = calculateWellnessScore();

    // 4. Generate Daily Data for Chart (Mocking days if not enough data, or using real)
    // We want 7 days history.
    const getWeeklyData = () => {
        // In a real app, we would align this with dates.
        // For this demo, we take the last 7 sessions, reverse them (oldest to newest)
        // If not enough, we pad with "neutral"
        const data = [...sessions].slice(0, 7).reverse();

        // Pad if less than 7
        while (data.length < 7) {
            data.unshift({ mood: 'neutral' } as any); // Filler
        }

        return data.map((d, index) => {
            const { score, color } = getMoodScore(d.mood);
            return { day: t("day_prefix") + (index + 1), score, color };
        });
    };

    const chartData = getWeeklyData();

    // 5. Dynamic Advice
    const getAdvice = () => {
        if (wellnessScore >= 80) return t("insight_excellent");
        if (wellnessScore >= 50) return t("insight_fluctuation");
        return "Prenez un moment pour respirer. Un exercice de cohérence cardiaque pourrait vous aider.";
    };

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                darkMode ? { backgroundColor: "#0B1220" } : { backgroundColor: "#F3F4F6" },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.title, darkMode ? { color: "#E5E7EB" } : { color: "#1F2937" }]}>
                    {t("insights_title")}
                </Text>
                <Text style={{ color: darkMode ? "#9CA3AF" : "#64748B" }}>
                    {t("insights_subtitle")}
                </Text>
            </View>

            {/* MAIN SCORE CARD */}
            <View style={[styles.card, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                <View style={styles.scoreRow}>
                    <View>
                        <Text style={[styles.scoreLabel, darkMode ? { color: "#D1D5DB" } : { color: "#475569" }]}>
                            {t("score_label")}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={[
                                styles.scoreBig,
                                { color: wellnessScore >= 70 ? "#22C55E" : (wellnessScore >= 40 ? "#F59E0B" : "#EF4444") }
                            ]}>
                                {wellnessScore}
                            </Text>
                            <Text style={[styles.scoreTotal, darkMode ? { color: "#9CA3AF" } : { color: "#94A3B8" }]}>/100</Text>
                        </View>
                    </View>
                    {/* Ring or Icon representation could go here */}
                    <View style={[styles.iconCircle, { backgroundColor: wellnessScore >= 70 ? "#DCFCE7" : "#FEF3C7" }]}>
                        <Feather
                            name={wellnessScore >= 70 ? "trending-up" : "trending-down"}
                            size={28}
                            color={wellnessScore >= 70 ? "#16A34A" : "#D97706"}
                        />
                    </View>
                </View>

                {/* Bar Chart Visualization */}
                <View style={styles.chartContainer}>
                    {chartData.map((item, index) => (
                        <View key={index} style={styles.barWrapper}>
                            <View style={styles.barTrack}>
                                <View
                                    style={[
                                        styles.barFill,
                                        { height: `${item.score}%`, backgroundColor: item.color }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.barLabel, darkMode ? { color: "#9CA3AF" } : { color: "#64748B" }]}>
                                {item.day}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* STATS GRID */}
            <View style={styles.grid}>
                <View style={[styles.statCard, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                    <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
                        <Feather name="message-square" size={20} color="#2563EB" />
                    </View>
                    <View>
                        <Text style={[styles.statValue, darkMode ? { color: "#E5E7EB" } : { color: "#1E293B" }]}>{totalSessions}</Text>
                        <Text style={styles.statLabel}>{t("stat_sessions")}</Text>
                    </View>
                </View>

                <View style={[styles.statCard, darkMode ? { backgroundColor: "#1F2937" } : { backgroundColor: "white" }]}>
                    <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
                        <Feather name="heart" size={20} color="#DC2626" />
                    </View>
                    <View>
                        <Text style={[styles.statValue, darkMode ? { color: "#E5E7EB" } : { color: "#1E293B" }]}>{dominantMood}</Text>
                        <Text style={styles.statLabel}>{t("stat_mood")}</Text>
                    </View>
                </View>
            </View>

            {/* AI ADVICE CARD */}
            <View style={styles.adviceCard}>
                <View style={styles.adviceHeader}>
                    <Feather name="zap" size={20} color="white" />
                    <Text style={styles.adviceTitleSmall}>{t("advice_title")}</Text>
                </View>
                <Text style={styles.adviceContent}>
                    "{getAdvice()}"
                </Text>
            </View>

            {/* PREVIEW GARDEN (Call to Action) */}
            <View style={[styles.card, { padding: 0, overflow: 'hidden', marginTop: 10 }]}>
                <View style={{ backgroundColor: "#065F46", padding: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: '700' }}>{t("garden_title")}</Text>
                            <Text style={{ color: "#A7F3D0", fontSize: 14, marginTop: 4 }}>{t("garden_keep_going")}</Text>
                        </View>
                        <Feather name="sun" size={32} color="#FCD34D" />
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60, // Consider safe area in parent or here
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 4,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scoreBig: {
        fontSize: 42,
        fontWeight: "900",
        lineHeight: 48,
    },
    scoreTotal: {
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 4,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    barTrack: {
        height: "100%",
        width: 8,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: 4,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: "100%",
        borderRadius: 4,
    },
    barLabel: {
        marginTop: 8,
        fontSize: 11,
        fontWeight: "500",
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: "800",
    },
    statLabel: {
        fontSize: 12,
        color: "#64748B",
    },
    adviceCard: {
        backgroundColor: "#2563EB", // Blue
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        opacity: 0.8,
    },
    adviceTitleSmall: {
        color: "white",
        fontSize: 14,
        fontWeight: "700",
        textTransform: 'uppercase',
    },
    adviceContent: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 26,
    },
});
