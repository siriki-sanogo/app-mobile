import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { getSurahList, getSurahVerses } from "../../services/database";

interface Surah {
    chapter: number;
    book: string;
}

interface Verse {
    id: number;
    source: string;
    book: string;
    chapter: number;
    verse: number;
    content: string;
}

export default function ReadingScreen() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSurahs();
    }, []);

    const loadSurahs = async () => {
        try {
            setLoading(true);
            const result = (await getSurahList()) as Surah[];
            setSurahs(result);
        } catch (error) {
            console.error("Error loading surahs:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadVerses = async (surahNumber: number) => {
        try {
            setLoading(true);
            setSelectedSurah(surahNumber);
            const result = (await getSurahVerses(surahNumber)) as Verse[];
            setVerses(result);
        } catch (error) {
            console.error("Error loading verses:", error);
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        setSelectedSurah(null);
        setVerses([]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </SafeAreaView>
        );
    }

    // Afficher les versets d'une sourate
    if (selectedSurah !== null) {
        const surahInfo = surahs.find((s) => s.chapter === selectedSurah);
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={goBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Retour</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Sourate {selectedSurah}: {surahInfo?.book}
                    </Text>
                </View>

                <FlatList
                    data={verses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.verseCard}>
                            <Text style={styles.verseNumber}>{item.verse}</Text>
                            <Text style={styles.verseContent}>{item.content}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            </SafeAreaView>
        );
    }

    // Afficher la liste des sourates
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📖 Le Saint Coran</Text>
                <Text style={styles.headerSubtitle}>
                    {surahs.length} Sourates disponibles
                </Text>
            </View>

            <FlatList
                data={surahs}
                keyExtractor={(item) => item.chapter.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.surahCard}
                        onPress={() => loadVerses(item.chapter)}
                    >
                        <View style={styles.surahNumber}>
                            <Text style={styles.surahNumberText}>{item.chapter}</Text>
                        </View>
                        <Text style={styles.surahName}>{item.book}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: "#1e293b",
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#f8fafc",
        textAlign: "center",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 4,
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: "#6366f1",
    },
    listContent: {
        padding: 16,
    },
    surahCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    surahNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#6366f1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    surahNumberText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    surahName: {
        fontSize: 16,
        color: "#f8fafc",
        flex: 1,
    },
    verseCard: {
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: "row",
    },
    verseNumber: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#6366f1",
        marginRight: 12,
        width: 30,
    },
    verseContent: {
        fontSize: 16,
        color: "#e2e8f0",
        flex: 1,
        lineHeight: 24,
    },
    loadingText: {
        color: "#94a3b8",
        marginTop: 16,
        textAlign: "center",
    },
});
